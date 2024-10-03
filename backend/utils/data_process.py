from collections import defaultdict
from datetime import datetime
import pandas as pd
from urllib.parse import urlparse, unquote


NUM = 30
def get_top_n(data_dict, n=NUM):
        """
        ソートして上位n件を返す関数
        """
        return dict(sorted(data_dict.items(), key=lambda x: x[1], reverse=True)[:n])

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
                    "total_users": data.get("total_users", 0),
                    "city": data.get("city", {}),
                    "device_category": data.get("device_category", {}),
                    "query": data.get("query", {}),
                    "click": data.get("click", 0),
                    "impression": data.get("impression", 0),
                    "ctr": data.get("ctr", 0),
                    "position": data.get("position", 0),
                    "country": data.get("country", {}),
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
                        "total_users": data.get("total_users", 0),
                        "city": data.get("city", {}),
                        "device_category": data.get("device_category", {}),
                        "query": data.get("query", {}),
                        "click": data.get("click", 0),
                        "impression": data.get("impression", 0),
                        "ctr": data.get("ctr", 0),
                        "position": data.get("position", 0),
                        "country": data.get("country", {}),
                    }

                    flattened_data[base_url][page_path].append(flattened_entry)
        return flattened_data

def data_by_date(analytics_data, search_console_data):
    """
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
        page_location = entry.get("page_location")
        if not page_location:
            continue

        date = datetime.strptime(entry.get("date"), "%Y%m%d").strftime("%Y-%m-%d")
        if not date:
            continue

        # URLからドメイン部分を取得
        parsed_url = urlparse(page_location)
        base_url = f"{parsed_url.scheme}://{parsed_url.netloc}"
        if date not in data_by_date[base_url]:
            # 日付ごとに初期データを設定
            data_by_date[base_url][date] = {
                "PV": 0,
                "CV": 0,
                "CVR": 0.0,
                "active_users": 0,
                "UU": 0,
                "engaged_sessions": 0,
                "total_users": 0,
                "city": defaultdict(int),       # Analytics Dataから取得
                "device_category": defaultdict(int),
                "query": defaultdict(int),
                "click": 0,                    
                "impression": 0,
                "ctr": 0,
                "position": 0,
                "country": defaultdict(int),
            }
        
        # 数値項目の計算
        data_by_date[base_url][date]['PV'] += entry.get('screen_page_views', 0)
        data_by_date[base_url][date]['CV'] += entry.get('conversions', 0)
        data_by_date[base_url][date]['active_users'] += entry.get('active_users', 0)
        data_by_date[base_url][date]['UU'] += entry.get('sessions', 0)
        data_by_date[base_url][date]['engaged_sessions'] += entry.get('engaged_sessions', 0)
        data_by_date[base_url][date]['total_users'] += entry.get('total_users', 0)

        # カテゴリ項目のカウント
        city = entry.get('city')
        if city:
            data_by_date[base_url][date]['city'][city] += 1
        
        device_category = entry.get('device_category')
        if device_category:
            data_by_date[base_url][date]['device_category'][device_category] += 1

    # Conversion Rateの計算
    for base_url, dates in data_by_date.items():
        for date, data in dates.items():
            if data['total_users'] > 0:
                data['CVR'] = data['CV'] / data['total_users']
            else:
                data['CVR'] = 0.0

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

        if date not in data_by_date[base_url]:
            # 日付ごとに初期データを設定
            data_by_date[base_url][date] = {
                "PV": 0,
                "CV": 0,
                "CVR": 0.0,
                "active_users": 0,
                "UU": 0,
                "engaged_sessions": 0,
                "total_users": 0,
                "city": defaultdict(int),       # Analytics Dataから取得
                "device_category": defaultdict(int),
                "query": defaultdict(int),
                "click": 0,                    
                "impression": 0,
                "ctr": 0,
                "position": 0,
                "country": defaultdict(int),
            }
        
        # クエリの集計
        data_by_date[base_url][date]['click'] += entry.get('click', 0)
        data_by_date[base_url][date]['impression'] += entry.get('impression', 0)
        data_by_date[base_url][date]['ctr'] += entry.get('ctr', 0)
        data_by_date[base_url][date]['position'] += entry.get('position', 0)

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
                data['ctr'] = (data['click'] / data['impression']) * 100
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
        page_path = unquote(parsed_url.path)

        if date not in data_by_page_path[base_url][page_path]:
            # 日付毎に初期データを設定
            data_by_page_path[base_url][page_path][date] = {
                "PV": 0,
                "CV": 0,
                "CVR": 0.0,
                "active_users": 0,
                "UU": 0,
                "engaged_sessions": 0,
                "total_users": 0,
                "city": defaultdict(int),       # Analytics Dataから取得
                "device_category": defaultdict(int),
                "query": defaultdict(int),
                "click": 0,                    
                "impression": 0,
                "ctr": 0,
                "position": 0,
                "country": defaultdict(int),
            }
        
        # 数値項目の計算
        data_by_page_path[base_url][page_path][date]['PV'] += entry.get('screen_page_views', 0)
        data_by_page_path[base_url][page_path][date]['CV'] += entry.get('conversions', 0)
        data_by_page_path[base_url][page_path][date]['active_users'] += entry.get('active_users', 0)
        data_by_page_path[base_url][page_path][date]['UU'] += entry.get('sessions', 0)
        data_by_page_path[base_url][page_path][date]['engaged_sessions'] += entry.get('engaged_sessions', 0)
        data_by_page_path[base_url][page_path][date]['total_users'] += entry.get('total_users', 0)

        # カテゴリ項目のカウント
        city = entry.get('city')
        if city:
            data_by_page_path[base_url][page_path][date]['city'][city] += 1

        device_category = entry.get('device_category')
        if device_category:
            data_by_page_path[base_url][page_path][date]['device_category'][device_category] += 1

    # Conversion Rateの計算
    for base_url, page_paths in data_by_page_path.items():
        for page_path, dates in page_paths.items():
            for date, data in dates.items():
                if data['total_users'] > 0:
                    data['CVR'] = data['CV'] / data['total_users']
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
        page_path = unquote(parsed_url.path)

        if date not in data_by_page_path[base_url][page_path]:
            # 日付ごとに初期データを設定
            data_by_page_path[base_url][page_path][date] = {
                "PV": 0,
                "CV": 0,
                "CVR": 0.0,
                "active_users": 0,
                "UU": 0,
                "engaged_sessions": 0,
                "total_users": 0,
                "city": defaultdict(int),       # Analytics Dataから取得
                "device_category": defaultdict(int),
                "query": defaultdict(int),
                "click": 0,                    
                "impression": 0,
                "ctr": 0,
                "position": 0,
                "country": defaultdict(int),
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

        decoded_path = unquote(parsed_url.path)
        if decoded_path not in aggregated[base_url]:
            # page_locationごとに初期データを設定
            aggregated[base_url][decoded_path] = {
                "PV": 0,
                "CV": 0,
                "CVR": 0.0,
                "active_users": 0,
                "UU": 0,
                "engaged_sessions": 0,
                "total_users": 0,
                "city": defaultdict(int),       # Analytics Dataから取得
                "device_category": defaultdict(int),
                "query": defaultdict(int),
                "click": 0,                    
                "impression": 0,
                "ctr": 0,
                "position": 0,
                "country": defaultdict(int),
            }
        
        # 数値項目の計算
        aggregated[base_url][decoded_path]['PV'] += entry.get('screen_page_views', 0)
        aggregated[base_url][decoded_path]['CV'] += entry.get('conversions', 0)
        aggregated[base_url][decoded_path]['active_users'] += entry.get('active_users', 0)
        aggregated[base_url][decoded_path]['UU'] += entry.get('sessions', 0)
        aggregated[base_url][decoded_path]['engaged_sessions'] += entry.get('engaged_sessions', 0)
        aggregated[base_url][decoded_path]['total_users'] += entry.get('total_users', 0)

        # カテゴリ項目のカウント
        city = entry.get('city')    
        if city:
            aggregated[base_url][decoded_path]['city'][city] += 1

        device_category = entry.get('device_category')
        if device_category:
            aggregated[base_url][decoded_path]['device_category'][device_category] += 1

    # Conversion Rateの計算
    for base_url, paths in aggregated.items():
        for page_path, data in paths.items():
            if data['total_users'] > 0:
                data['CVR'] = data['CV'] / data['total_users'] * 100
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

        decoded_path = unquote(parsed_url.path)
        if decoded_path not in aggregated[base_url]:
            # page_locationごとに初期データを設定
            aggregated[base_url][decoded_path] = {
                "PV": 0,
                "CV": 0,
                "CVR": 0.0,
                "active_users": 0,
                "UU": 0,
                "engaged_sessions": 0,
                "total_users": 0,
                "city": defaultdict(int),       # Analytics Dataから取得
                "device_category": defaultdict(int),
                "query": defaultdict(int),
                "click": 0,                    
                "impression": 0,
                "ctr": 0,
                "position": 0,
                "country": defaultdict(int),
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
            "total_users": 0,
            "city": defaultdict(int),       # Analytics Dataから取得
            "device_category": defaultdict(int),
            "query": defaultdict(int),
            "click": 0,                    
            "impression": 0,
            "ctr": 0,
            "position": 0,
            "country": defaultdict(int),
        }

        # Page Pathごとの集計をURLごとに集計
        for page_path, data in paths.items():
            url_summary[base_url]["PV"] += data["PV"]
            url_summary[base_url]["CV"] += data["CV"]
            url_summary[base_url]["active_users"] += data["active_users"]
            url_summary[base_url]["UU"] += data["UU"]
            url_summary[base_url]["engaged_sessions"] += data["engaged_sessions"]
            url_summary[base_url]["total_users"] += data["total_users"]
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

        # Conversion Rateの計算
        if url_summary[base_url]["total_users"] > 0:
            url_summary[base_url]["CVR"] = url_summary[base_url]["CV"] / url_summary[base_url]["total_users"]
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

            transformed_data.append({
                'base_url': base_url,
                'date': entry['date'],
                'PV': int(entry['PV']),
                'CV': int(entry['CV']),
                'CVR': float(entry['CVR']),
                'active_users': int(entry['active_users']),
                'UU': int(entry['UU']),
                'engaged_sessions': int(entry['engaged_sessions']),
                'total_users': int(entry['total_users']),
                'city': entry['city'],
                'device_category': top_device_category,
                'query': top_query,
                'click': int(entry['click']),
                'impression': int(entry['impression']),
                'ctr': float(entry['ctr']),
                'position': float(entry['position']),
            })

    return transformed_data