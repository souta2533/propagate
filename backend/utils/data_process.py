from collections import defaultdict
import copy
from datetime import datetime, timedelta
import pandas as pd
from urllib.parse import urlparse, unquote
from logging import getLogger


logger = getLogger(__name__)


def get_top_n(data_dict, n=30):
    """
    ソートして上位n件を返す関数
    """
    try:
        # defaultdict なら通常の dict に変換
        if isinstance(data_dict, defaultdict):
            data_dict = dict(data_dict)
        
        # ソートして上位n件を返す
        sorted_items = sorted(data_dict.items(), key=lambda x: x[1], reverse=True)[:n]
        
        # dict を defaultdict に変換して返す
        return defaultdict(int, sorted_items)

    except Exception as e:
        logger.error(f"Error in get_top_n: {e}")
        return defaultdict(int)


def transform_data_by_date(data_by_date, source='dashboard'):
    """
        dashboard
            data_by_data[base_url][date] -> data_by_date[base_url]

        details
            data_by_data[base_url][page_path][date] -> data_by_date[base_url][page_path]
    """

    if source == 'dashboard':
        transformed_data = defaultdict(list)

        for base_url, date_entries in data_by_date.items():
            for date, data in date_entries.items():
                d = {
                    "date": date,
                    "PV": data.get("PV", 0),
                    "CV": data.get("CV", 0),
                    "CVR": data.get("CVR", 0.0),
                    "active_users": data.get("active_users", 0),
                    "UU": data.get("UU", 0),
                    "engaged_sessions": data.get("engaged_sessions", 0),
                    "city": data.get("city", {}),
                    "device_category": data.get("device_category", {}),
                    "query": data.get("query", {}),
                    "click": data.get("click", 0),
                    "impression": data.get("impression", 0),
                    "ctr": data.get("ctr", 0),
                    "position": data.get("position", 0),
                    "country": data.get("country", {}),
                    "source": data.get("source", {}),
                }

                transformed_data[base_url].append(d)

        return transformed_data
    
    elif source == 'details':
        flattened_data = defaultdict(lambda: defaultdict(list))

        for base_url, page_paths in data_by_date.items():
            for page_path, dates in page_paths.items():
                for date, data in dates.items():
                    flattened_entry = {
                        "date": date,
                        "PV": data.get("PV", 0),
                        "CV": data.get("CV", 0),
                        "CVR": data.get("CVR", 0.0),
                        "active_users": data.get("active_users", 0),
                        "UU": data.get("UU", 0),
                        "engaged_sessions": data.get("engaged_sessions", 0),
                        "city": data.get("city", {}),
                        "device_category": data.get("device_category", {}),
                        "query": data.get("query", {}),
                        "click": data.get("click", 0),
                        "impression": data.get("impression", 0),
                        "ctr": data.get("ctr", 0),
                        "position": data.get("position", 0),
                        "country": data.get("country", {}),
                        "source": data.get("source", {}),
                    }

                    flattened_data[base_url][page_path].append(flattened_entry)
        return flattened_data

def data_by_date(analytics_data, search_console_data, url_depth=1):
    """
        DBに保存する前に実行
        日付ごとにデータを集計する関数
        ページパスは考慮せず, URLごとに集計
    """
    if analytics_data is None:
        analytics_data = []
    if search_console_data is None:
        search_console_data = []

    # 日付ごとにデータを集計
    data_by_date = defaultdict(dict)

    # Analytics Dataの処理
    for entry in analytics_data:
        page_location = entry.get("page_location", None)
        if not page_location:
            continue

        date = datetime.strptime(entry.get("date"), "%Y%m%d").strftime("%Y/%m/%d")
        if not date:
            continue

        # URLからドメイン部分を取得
        parsed_url = urlparse(page_location)
        if url_depth == 1:
            base_url = f"{parsed_url.scheme}://{parsed_url.netloc}"
        elif url_depth == 2:
            base_url = f"{parsed_url.scheme}://{parsed_url.netloc}{'/'.join(parsed_url.path.split('/')[:2])}"
        else:
            raise ValueError("url_depth must be 1 or 2")
        
        if date not in data_by_date[base_url]:
            # 日付ごとに初期データを設定
            data_by_date[base_url][date] = {
                "PV": 0,
                "CV": 0,
                "CVR": 0.0,
                "active_users": 0,
                "UU": 0,
                "engaged_sessions": 0,
                "city": defaultdict(int),       # Analytics Dataから取得
                "device_category": defaultdict(int),
                "query": defaultdict(int),
                "click": 0,                    
                "impression": 0,
                "ctr": 0,
                "position": 0,
                "country": defaultdict(int),
                "source": defaultdict(int),
            }
        
        # 数値項目の計算
        data_by_date[base_url][date]['PV'] += entry.get('screen_page_views', 0)
        data_by_date[base_url][date]['CV'] += entry.get('conversions', 0)
        data_by_date[base_url][date]['active_users'] += entry.get('active_users', 0)
        data_by_date[base_url][date]['UU'] += entry.get('total_users', 0)
        data_by_date[base_url][date]['engaged_sessions'] += entry.get('engaged_sessions', 0)

        # カテゴリ項目のカウント
        city = entry.get('city')
        if city:
            data_by_date[base_url][date]['city'][city] += 1
        
        device_category = entry.get('device_category')
        if device_category:
            data_by_date[base_url][date]['device_category'][device_category] += 1

        source = entry.get('session_source')
        if source:
            data_by_date[base_url][date]['source'][source] += 1

    # Conversion Rateの計算
    for base_url, dates in data_by_date.items():
        for date, data in dates.items():
            if data['UU'] > 0:
                data['CVR'] = round(data['CV'] / data['UU'] * 100, 3)
            else:
                data['CVR'] = 0.0

    # Search Console Dataの処理
    for entry in search_console_data:
        page = entry.get('page')
        if not page:
            continue
        
        date = datetime.strptime(entry.get("date"), "%Y-%m-%d").strftime("%Y/%m/%d")
        if not date:
            continue

        # URLからパスを取得
        parsed_url = urlparse(page)
        if url_depth == 1:
            base_url = f"{parsed_url.scheme}://{parsed_url.netloc}"
        elif url_depth == 2:
            base_url = f"{parsed_url.scheme}://{parsed_url.netloc}{'/'.join(parsed_url.path.split('/')[:2])}"
        else:
            raise ValueError("url_depth must be 1 or 2")

        if date not in data_by_date[base_url]:
            # 日付ごとに初期データを設定
            data_by_date[base_url][date] = {
                "PV": 0,
                "CV": 0,
                "CVR": 0.0,
                "active_users": 0,
                "UU": 0,
                "engaged_sessions": 0,
                "city": defaultdict(int),       # Analytics Dataから取得
                "device_category": defaultdict(int),
                "query": defaultdict(int),
                "click": 0,                    
                "impression": 0,
                "ctr": 0,
                "position": 0,
                "country": defaultdict(int),
                "source": defaultdict(int),
            }
        
        # クエリの集計
        data_by_date[base_url][date]['click'] += entry.get('clicks', 0)
        data_by_date[base_url][date]['impression'] += entry.get('impressions', 0)
        data_by_date[base_url][date]['ctr'] += entry.get('ctr', 0)
        data_by_date[base_url][date]['position'] += int(entry.get('position', 0))

        # カテゴリ項目のカウント
        query = entry.get('query')
        if query:
            data_by_date[base_url][date]['query'][query] += 1
        
        country = entry.get('country')
        if country:
            data_by_date[base_url][date]['country'][country] += 1

    # CTRの平均値を計算
    for base_url, dates in data_by_date.items():
        for date, data in dates.items():
            if data['impression'] > 0:
                data['ctr'] = round((data['click'] / data['impression']) * 100, 3)
            else:
                data['ctr'] = 0.0
    
    # city, country, queryは上位30件のみ渡す
    for base_url, dates in data_by_date.items():
        for date, data in dates.items():
            if 'city' in data:
                data_by_date[base_url][date]['city'] = get_top_n(data['city'])
            if 'country' in data:
                data_by_date[base_url][date]['country'] = get_top_n(data['country'])
            if 'query' in data:
                data_by_date[base_url][date]['query'] = get_top_n(data['query'])
    
    # 日付をキーに持つ構造から、base_url 内に date フィールドを含む形式に変換
    transformed_data = transform_data_by_date(data_by_date)

    return transformed_data

def data_by_page_path(analytics_data, search_console_data):
    """
        Analytics DataとSearch Console Dataをページパスごとに集計する関数
    """
    if analytics_data is None:
        analytics_data = []
    if search_console_data is None:
        search_console_data = []

    # base_url -> page_pathごとにデータを集計
    data_by_page_path = defaultdict(lambda: defaultdict(dict))

    # Analytics Dataの処理
    for entry in analytics_data:
        page_location = entry.get("page_location")
        if not page_location:
            continue
            
        date = datetime.strptime(entry.get("date"), "%Y%m%d").strftime("%Y-%m-%d")
        if not date:
            continue
            
        # URLからドメイン部分を取得
        parsed_url = urlparse(page_location)
        base_url = f"{parsed_url.scheme}://{parsed_url.netloc}"

        # ページパスを取得
        full_page_path = unquote(parsed_url.path)
        page_path_parts = full_page_path.split('/')
        if len(page_path_parts) > 1:
            page_path = '/' + page_path_parts[1]
        else:
            page_path = '/' + page_path_parts[1]

        if date not in data_by_page_path[base_url][page_path]:
            # 日付け毎に初期データを設定
            data_by_page_path[base_url][page_path][date] = {
                "PV": 0,
                "CV": 0,
                "CVR": 0.0,
                "active_users": 0,
                "UU": 0,
                "engaged_sessions": 0,
                "city": defaultdict(int),       # Analytics Dataから取得
                "device_category": defaultdict(int),
                "query": defaultdict(int),
                "click": 0,                    
                "impression": 0,
                "ctr": 0,
                "position": 0,
                "country": defaultdict(int),
                "source": defaultdict(int),
            }
        
        # 数値項目の計算
        data_by_page_path[base_url][page_path][date]['PV'] += entry.get('screen_page_views', 0)
        data_by_page_path[base_url][page_path][date]['CV'] += entry.get('conversions', 0)
        data_by_page_path[base_url][page_path][date]['active_users'] += entry.get('active_users', 0)
        data_by_page_path[base_url][page_path][date]['UU'] += entry.get('total_users', 0)
        data_by_page_path[base_url][page_path][date]['engaged_sessions'] += entry.get('engaged_sessions', 0)

        # カテゴリ項目のカウント
        city = entry.get('city')
        if city:
            data_by_page_path[base_url][page_path][date]['city'][city] += 1

        device_category = entry.get('device_category')
        if device_category:
            data_by_page_path[base_url][page_path][date]['device_category'][device_category] += 1
        
        source = entry.get('session_source')    
        if source:
            data_by_page_path[base_url][page_path][date]['source'][source] += 1

    # Conversion Rateの計算
    for base_url, page_paths in data_by_page_path.items():
        for page_path, dates in page_paths.items():
            for date, data in dates.items():
                if data['UU'] > 0:
                    data['CVR'] = data['CV'] / data['UU']
                else:
                    data['conversion_rate'] = 0.0

    # Search Console Dataの処理
    for entry in search_console_data:
        page = entry.get('page')
        if not page:
            continue
        
        date = entry.get('date')
        if not date:
            continue

        # URLからパスを取得
        parsed_url = urlparse(page)
        base_url = f"{parsed_url.scheme}://{parsed_url.netloc}"
        
        # ページパスを取得
        full_page_path = unquote(parsed_url.path)
        page_path_parts = full_page_path.split('/')
        if len(page_path_parts) > 1:
            page_path = '/' + page_path_parts[1]
        else:
            page_path = '/' + page_path_parts[1]

        if date not in data_by_page_path[base_url][page_path]:
            # 日付ごとに初期データを設定
            data_by_page_path[base_url][page_path][date] = {
                "PV": 0,
                "CV": 0,
                "CVR": 0.0,
                "active_users": 0,
                "UU": 0,
                "engaged_sessions": 0,
                "city": defaultdict(int),       # Analytics Dataから取得
                "device_category": defaultdict(int),
                "query": defaultdict(int),
                "click": 0,                    
                "impression": 0,
                "ctr": 0,
                "position": 0,
                "country": defaultdict(int),
                "source": defaultdict(int),
            }

        # クエリの集計
        data_by_page_path[base_url][page_path][date]['click'] += entry.get('click', 0)
        data_by_page_path[base_url][page_path][date]['impression'] += entry.get('impression', 0)
        data_by_page_path[base_url][page_path][date]['ctr'] += entry.get('ctr', 0)
        data_by_page_path[base_url][page_path][date]['position'] += entry.get('position', 0)

        # カテゴリ項目のカウント
        query = entry.get('query')
        if query:
            data_by_page_path[base_url][page_path][date]['query'][query] += 1
        
        country = entry.get('country')
        if country:
            data_by_page_path[base_url][page_path][date]['country'][country] += 1

    # CTRの平均値を計算
    for base_url, page_paths in data_by_page_path.items():
        for page_path, dates in page_paths.items():
            for date, data in dates.items():
                if data['impression'] > 0:
                    data['ctr'] = (data['click'] / data['impression']) * 100
                else:
                    data['ctr'] = 0.0

    # city, country, queryは上位30件のみ渡す
    for base_url, page_paths in data_by_page_path.items():
        for page_path, dates in page_paths.items():
            for date, data in dates.items():
                if 'city' in data:
                    data_by_page_path[base_url][page_path][date]['city'] = get_top_n(data['city'])
                if 'country' in data:
                    data_by_page_path[base_url][page_path][date]['country'] = get_top_n(data['country'])
                if 'query' in data:
                    data_by_page_path[base_url][page_path][date]['query'] = get_top_n(data['query'])

    # 日付をキーに持つ構造から、base_url 内に date フィールドを含む形式に変換
    transformed_data = transform_data_by_date(data_by_page_path, source='details')
    return transformed_data

def aggregate_data(analytics_data, search_console_data):
    """
        Analytics DataとSearch Console Dataを集計する関数
        URLとPage Pathごとに集計
    """
    if analytics_data is None:
        analytics_data = []
    if search_console_data is None:
        search_console_data = []

    aggregated = {}

    # Analytics Dataの処理
    for entry in analytics_data:
        page_location = entry.get("page_location")
        if not page_location:
            continue

        # URL からドメイン部分を取得
        parsed_url = urlparse(page_location)
        base_url = f"{parsed_url.scheme}://{parsed_url.netloc}"
        if base_url not in aggregated:
            aggregated[base_url] = {}

        # ページパスを取得
        full_page_path = unquote(parsed_url.path)
        page_path_parts = full_page_path.split('/')
        if len(page_path_parts) > 1:
            decoded_path = '/' + page_path_parts[1]
        else:
            decoded_path = '/' + page_path_parts[1]

        if decoded_path not in aggregated[base_url]:
            # page_locationごとに初期データを設定
            aggregated[base_url][decoded_path] = {
                "PV": 0,
                "CV": 0,
                "CVR": 0.0,
                "active_users": 0,
                "UU": 0,
                "engaged_sessions": 0,
                "city": defaultdict(int),       # Analytics Dataから取得
                "device_category": defaultdict(int),
                "query": defaultdict(int),
                "click": 0,                    
                "impression": 0,
                "ctr": 0,
                "position": 0,
                "country": defaultdict(int),
                "source": defaultdict(int),
            }
        
        # 数値項目の計算
        aggregated[base_url][decoded_path]['PV'] += entry.get('screen_page_views', 0)
        aggregated[base_url][decoded_path]['CV'] += entry.get('conversions', 0)
        aggregated[base_url][decoded_path]['active_users'] += entry.get('active_users', 0)
        aggregated[base_url][decoded_path]['UU'] += entry.get('total_users', 0)
        aggregated[base_url][decoded_path]['engaged_sessions'] += entry.get('engaged_sessions', 0)

        # カテゴリ項目のカウント
        city = entry.get('city')    
        if city:
            aggregated[base_url][decoded_path]['city'][city] += 1

        device_category = entry.get('device_category')
        if device_category:
            aggregated[base_url][decoded_path]['device_category'][device_category] += 1

        source = entry.get('session_source')
        if source:
            aggregated[base_url][decoded_path]['source'][source] += 1

    # Conversion Rateの計算
    for base_url, paths in aggregated.items():
        for page_path, data in paths.items():
            if data['UU'] > 0:
                data['CVR'] = data['CV'] / data['UU'] * 100
            else:
                data['conversion_rate'] = 0.0

    # Search Console Dataの処理
    for entry in search_console_data:
        page = entry.get('page')
        if not page:
            continue    

        # URLからパスを取得
        parsed_url = urlparse(page)
        base_url = f"{parsed_url.scheme}://{parsed_url.netloc}"
        if base_url not in aggregated:
            aggregated[base_url] = {}

        # ページパスを取得
        full_page_path = unquote(parsed_url.path)
        page_path_parts = full_page_path.split('/')
        if len(page_path_parts) > 1:
            decoded_path = '/' + page_path_parts[1]
        else:
            decoded_path = '/' + page_path_parts[1]

        if decoded_path not in aggregated[base_url]:
            # page_locationごとに初期データを設定
            aggregated[base_url][decoded_path] = {
                "PV": 0,
                "CV": 0,
                "CVR": 0.0,
                "active_users": 0,
                "UU": 0,
                "engaged_sessions": 0,
                "city": defaultdict(int),       # Analytics Dataから取得
                "device_category": defaultdict(int),
                "query": defaultdict(int),
                "click": 0,                    
                "impression": 0,
                "ctr": 0,
                "position": 0,
                "country": defaultdict(int),
                "source": defaultdict(int),
            }
        
        # クエリの集計
        aggregated[base_url][decoded_path]['click'] += entry.get('click', 0)
        aggregated[base_url][decoded_path]['impression'] += entry.get('impression', 0)
        aggregated[base_url][decoded_path]['ctr'] += entry.get('ctr', 0)
        aggregated[base_url][decoded_path]['position'] += entry.get('position', 0)

        # カテゴリ項目のカウント
        query = entry.get('query')
        if query:
            aggregated[base_url][decoded_path]['query'][query] += 1
        
        country = entry.get('country')
        if country:
            aggregated[base_url][decoded_path]['country'][country] += 1

    # CTRの平均値を計算
    for base_url, paths in aggregated.items():
        for path, data in paths.items():
            if data['impression'] > 0:
                data['ctr'] = (data['click'] / data['impression']) * 100
            else:
                data['ctr'] = 0.0
    
    # city, country, queryは上位30件のみ渡す
    for base_url, paths in aggregated.items():
        for page_path, data in paths.items():
            if 'city' in data:
                aggregated[base_url][page_path]['city'] = get_top_n(data['city'])
            if 'country' in data:
                aggregated[base_url][page_path]['country'] = get_top_n(data['country'])
            if 'query' in data:
                aggregated[base_url][page_path]['query'] = get_top_n(data['query'])

    return aggregated

def aggregate_by_url(aggregated_data):
    """
        aggregate_data関数で集計したデータをURLごとに集計する関数
        （上記では, URLとPage Pathごとに集計）
    """ 
    url_summary = {}

    for base_url, paths in aggregated_data.items():
        url_summary[base_url] = {
            "PV": 0,
            "CV": 0,
            "CVR": 0.0,
            "active_users": 0,
            "UU": 0,
            "engaged_sessions": 0,
            "city": defaultdict(int),       # Analytics Dataから取得
            "device_category": defaultdict(int),
            "query": defaultdict(int),
            "click": 0,                    
            "impression": 0,
            "ctr": 0,
            "position": 0,
            "country": defaultdict(int),
            "source": defaultdict(int),
        }

        # Page Pathごとの集計をURLごとに集計
        for page_path, data in paths.items():
            url_summary[base_url]["PV"] += data["PV"]
            url_summary[base_url]["CV"] += data["CV"]
            url_summary[base_url]["active_users"] += data["active_users"]
            url_summary[base_url]["UU"] += data["UU"]
            url_summary[base_url]["engaged_sessions"] += data["engaged_sessions"]
            url_summary[base_url]["click"] += data["click"]
            url_summary[base_url]["impression"] += data["impression"]
            url_summary[base_url]["ctr"] += data["ctr"]
            url_summary[base_url]["position"] += data["position"]

            # カテゴリ項目のカウント
            for city, count in data["city"].items():
                url_summary[base_url]["city"][city] += count
            for device_category, count in data["device_category"].items():
                url_summary[base_url]["device_category"][device_category] += count
            for query, count in data["query"].items():
                url_summary[base_url]["query"][query] += count
            for country, count in data["country"].items():
                url_summary[base_url]["country"][country] += count
            for source, count in data["source"].items():
                url_summary[base_url]["source"][source] += count

        # Conversion Rateの計算
        if url_summary[base_url]["UU"] > 0:
            url_summary[base_url]["CVR"] = url_summary[base_url]["CV"] / url_summary[base_url]["UU"]
        else:
            url_summary[base_url]["CVR"] = 0.0
        
        # CTRの平均値を計算
        if url_summary[base_url]["impression"] > 0:
            url_summary[base_url]["ctr"] = (url_summary[base_url]["click"] / url_summary[base_url]["impression"]) * 100
        else:
            url_summary[base_url]["ctr"] = 0.0

        # city, country, queryは上位30件のみ渡す
        if 'city' in url_summary[base_url]:
            url_summary[base_url]['city'] = get_top_n(url_summary[base_url]['city'])
        if 'country' in url_summary[base_url]:
            url_summary[base_url]['country'] = get_top_n(url_summary[base_url]['country'])
        if 'query' in url_summary[base_url]:
            url_summary[base_url]['query'] = get_top_n(url_summary[base_url]['query'])
        if 'source' in url_summary[base_url]:
            url_summary[base_url]['source'] = get_top_n(url_summary[base_url]['source'])

    return url_summary

def transform_for_statistic_analysis(data_by_data):
    """
        統計解析用のデータ構造に変換する関数
        Parameters:
        - data_by_data: 辞書型のデータ構造（base_url ごとの日付データ）

        Returns:
        - transformed_data: 統計解析に使用するためのリスト形式のデータ
    """
    transformed_data = []

    for base_url, entries in data_by_data.items():
        for entry in entries:
            # device_category, queryを統計分析可能な形に変換
            top_device_category = max(entry['device_category'], key=entry['device_category'].get) if entry['device_category'] else None
            top_query = max(entry['query'], key=entry['query'].get) if entry['query'] else None
            top_source = max(entry['session_source'], key=entry['session_source'].get) if entry['session_source'] else None

            transformed_data.append({
                'base_url': base_url,
                'date': entry['date'],
                'PV': int(entry['PV']),
                'CV': int(entry['CV']),
                'CVR': float(entry['CVR']),
                'active_users': int(entry['active_users']),
                'UU': int(entry['UU']),
                'engaged_sessions': int(entry['engaged_sessions']),
                'city': entry['city'],
                'device_category': top_device_category,
                'query': top_query,
                'click': int(entry['click']),
                'impression': int(entry['impression']),
                'ctr': float(entry['ctr']),
                'position': float(entry['position']),
                'source': top_source,
            })

    return transformed_data

def aggregate_by_base_url(data):
    """
        data: AnalyticsDataTableに格納されているデータ
    """
    if data is None:
        return None
    
    base_url_aggregates = defaultdict(lambda: {
        'PV': 0,
        'CV': 0,
        'CVR': 0.0,
        'active_users': 0,
        'UU': 0,
        'engaged_sessions': 0,
        'click': 0,
        'impression': 0,
        'ctr': 0,
        'position': 0,
        'city': defaultdict(int),
        'device_category': defaultdict(int),
        'query': defaultdict(int),
        'country': defaultdict(int),
        'source': defaultdict(int),
    })

    for record in data:
        url = record.get('url', None)
        if not url or url is None:
            continue

        parsed_url = urlparse(url)
        base_url = f"{parsed_url.scheme}://{parsed_url.netloc}"

        # Base URLごとに集計
        base_url_aggregates[base_url]['PV'] += record.get('PV') if record.get('PV') is not None else 0
        base_url_aggregates[base_url]['CV'] += record.get('CV') if record.get('CV') is not None else 0
        base_url_aggregates[base_url]['CVR'] += record.get('CVR') if record.get('CVR') is not None else 0.0
        base_url_aggregates[base_url]['active_users'] += record.get('active_users') if record.get('active_users') is not None else 0
        base_url_aggregates[base_url]['UU'] += record.get('UU') if record.get('UU') is not None else 0
        base_url_aggregates[base_url]['engaged_sessions'] += record.get('engaged_sessions') if record.get('engaged_sessions') is not None else 0
        base_url_aggregates[base_url]['click'] += record.get('click') if record.get('click') is not None else 0
        base_url_aggregates[base_url]['impression'] += record.get('impression') if record.get('impression') is not None else 0
        base_url_aggregates[base_url]['ctr'] += record.get('ctr') if record.get('ctr') is not None else 0.0
        base_url_aggregates[base_url]['position'] += float(record.get('position')) if record.get('position') is not None else 0.0

        # logger.info(base_url_aggregates)

        # カテゴリ項目のカウント
        cities = record.get('city') if record.get('city') is not None else {}
        if cities is not None:
            for city, v in cities.items():
                base_url_aggregates[base_url]['city'][city] += 1

        device_categories = record.get('device_category') if record.get('device_category') is not None else {}
        if device_categories is not None:
            # logger.info(device_categories)
            for device_category, v in device_categories.items():
                base_url_aggregates[base_url]['device_category'][device_category] += 1

        queries = record.get('query') if record.get('query') is not None else {}
        if queries is not None:
            # logger.info(queries)
            for query, v in queries.items():
                base_url_aggregates[base_url]['query'][query] += 1
        
        countries = record.get('country') if record.get('country') is not None else {}
        if countries is not None:
            # logger.info(countries)  
            for country, v in countries.items():
                base_url_aggregates[base_url]['country'][country] += 1
        
        sources = record.get('source') if record.get('source') is not None else {}
        if sources is not None:
            logger.info(sources)
            for source, v in sources.items():
                base_url_aggregates[base_url]['source'][source] += 1

    # Conversion Rateの計算
    for base_url, data in base_url_aggregates.items():
        if data['UU'] > 0:
            data['CVR'] = data['CV'] / data['UU']
        else:
            data['CVR'] = 0.0
    
    # CTRの平均値を計算
    for base_url, data in base_url_aggregates.items():
        if data['impression'] > 0:
            data['ctr'] = (data['click'] / data['impression']) * 100
        else:
            data['ctr'] = 0.0

    # city, country, queryは上位30件のみ渡す
    for base_url, data in base_url_aggregates.items():
        if 'city' in data:
            base_url_aggregates[base_url]['city'] = get_top_n(data['city'])
        if 'country' in data:
            base_url_aggregates[base_url]['country'] = get_top_n(data['country'])
        if 'query' in data:
            base_url_aggregates[base_url]['query'] = get_top_n(data['query'])
        if 'source' in data:
            base_url_aggregates[base_url]['source'] = get_top_n(data['source'])

    return base_url_aggregates

def arrange_by_url(data):
    """
        DBから取得したデータをURLごとのデータ構造に変更する関数
    """
    if data is None:
        return None
    
    arranged_data = defaultdict(list)

    for record in data:
        url = record.get('url', None) 
        if url is None:
            continue

        arranged_data[url].append(record)

    return arranged_data

def initialize_missing_data(data_by_date, start_date, end_date):
    """
        期間内でデータが存在しない場合に初期化する関数
    """ 
    if data_by_date is None:
        return None
    
    initial_data = {
            "PV": 0,
            "CV": 0,
            "CVR": 0.0,
            "active_users": 0,
            "UU": 0,
            "engaged_sessions": 0,
            "city": defaultdict(int),       # Analytics Dataから取得
            "device_category": defaultdict(int),
            "query": defaultdict(int),
            "click": 0,                    
            "impression": 0,
            "ctr": 0,
            "date": "",
            "position": 0,
            "country": defaultdict(int),
            "source": defaultdict(int),
    }

    start_dt = datetime.strptime(start_date, "%Y-%m-%d")
    end_dt = datetime.strptime(end_date, "%Y-%m-%d")
    date_list = [(start_dt + timedelta(days=x)).strftime("%Y-%m-%d") for x in range((end_dt - start_dt).days + 1)]

    # URLごとに処理
    for url, records in data_by_date.items():
        # 既存の日付データを取得
        existing_dates = [record['date'] for record in records]

        # 日付リストから不足している日付を追加
        for date in date_list:
            date = datetime.strptime(date, "%Y-%m-%d").strftime("%Y/%m/%d")
            if date not in existing_dates:
                initial_data_copy = copy.deepcopy(initial_data)
                initial_data_copy['date'] = date
                data_by_date[url].append(initial_data_copy)

    return data_by_date

def sort_by_date(data_by_date):
    """
        日付順にsortする関数
    """
    if data_by_date is None:
        logger.error("data_by_date is None") 
        return data_by_date
    
    try:
        for url, records in data_by_date.items():   # records: []
            if records is None:
                logger.error(f"Error: date is None ({url})")
                continue

            sorted_data = sorted(
                records,
                key=lambda x: datetime.strptime(x['date'], "%Y/%m/%d")
            )
            data_by_date[url] = sorted_data

        return data_by_date
    
    except Exception as e:
        logger.error(f"Error: {e}")
        return data_by_date

def aggregate_by_path(data):
    """
        URLのパスをキーとして集計する関数
    """
    if data is None:
        return None
    
    data_by_path = defaultdict(lambda: {
        "PV": 0,
        "CV": 0,
        "CVR": 0.0,
        "active_users": 0,
        "UU": 0,
        "engaged_sessions": 0,
        "city": defaultdict(int),       # Analytics Dataから取得
        "device_category": defaultdict(int),
        "query": defaultdict(int),
        "click": 0,                    
        "impression": 0,
        "ctr": 0,
        "position": 0,
        "country": defaultdict(int),
        "source": defaultdict(int),
    })

    # データをPathごとに集計
    for record in data:
        url = record.get('url', None)
        if url is None:
            continue

         # 数値項目の計算
        data_by_path[url]['PV'] += record.get('PV') if record.get('PV') is not None else 0
        data_by_path[url]['CV'] += record.get('CV') if record.get('CV') is not None else 0
        data_by_path[url]['active_users'] += record.get('active_users') if record.get('active_users') is not None else 0
        data_by_path[url]['UU'] += record.get('UU') if record.get('UU') is not None else 0
        data_by_path[url]['engaged_sessions'] += record.get('engaged_sessions') if record.get('engaged_sessions') is not None else 0
        data_by_path[url]['click'] += record.get('click') if record.get('click') is not None else 0
        data_by_path[url]['impression'] += record.get('impression') if record.get('impression') is not None else 0
        data_by_path[url]['position'] += int(record.get('position')) if record.get('position') is not None else 0

        # カテゴリ項目のカウント
        cities = record.get('city') if record.get('city') is not None else {}
        if cities is not None:
            for city, v in cities.items():
                data_by_path[url]['city'][city] += 1
        
        device_categories = record.get('device_category') if record.get('device_category') is not None else {}
        if device_categories is not None:
            for device_category, v in device_categories.items():
                data_by_path[url]['device_category'][device_category] += 1

        queries = record.get('query') if record.get('query') is not None else {}
        if queries is not None:
            for query, v in queries.items():
                data_by_path[url]['query'][query] += 1

        countries = record.get('country') if record.get('country') is not None else {}
        if countries is not None:
            for country, v in countries.items():
                data_by_path[url]['country'][country] += 1

        sources = record.get('source') if record.get('source') is not None else {}  
        if sources is not None:
            for source, v in sources.items():
                data_by_path[url]['source'][source] += 1

        # Conversion Rateの計算
        if data_by_path[url]['UU'] > 0:
            data_by_path[url]['CVR'] = round(data_by_path[url]['CV'] / data_by_path[url]['UU'] * 100, 3)

        # CTRの平均値を計算
        if data_by_path[url]['impression'] > 0:
            data_by_path[url]['ctr'] = round((data_by_path[url]['click'] / data_by_path[url]['impression']) * 100, 3)

        # city, country, queryは上位30件のみ渡す
        if 'city' in data_by_path[url]:
            data_by_path[url]['city'] = get_top_n(data_by_path[url]['city'])
        if 'country' in data_by_path[url]:
            data_by_path[url]['country'] = get_top_n(data_by_path[url]['country'])
        if 'query' in data_by_path[url]:
            data_by_path[url]['query'] = get_top_n(data_by_path[url]['query'])
        
    return data_by_path


if __name__ == '__main__':
    page_location = 'https://example.com/blog/2021/01/01'
    parsed_url = urlparse(page_location)
    base_url = f"{parsed_url.scheme}://{parsed_url.netloc}"
    print(f"base_url: {base_url}")
    base_url = f"{parsed_url.scheme}://{parsed_url.netloc}{'/'.join(parsed_url.path.split('/')[:2])}"
    print(f"base_url: {base_url}")