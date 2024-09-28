from collections import defaultdict
from urllib.parse import urlparse, unquote


NUM = 30
def get_top_n(data_dict, n=NUM):
        """
        ソートして上位n件を返す関数
        """
        return dict(sorted(data_dict.items(), key=lambda x: x[1], reverse=True)[:n])

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

        date = entry.get("date")
        if not date:
            continue

        # URLからドメイン部分を取得
        parsed_url = urlparse(page_location)
        base_url = f"{parsed_url.scheme}://{parsed_url.netloc}"
        if date not in data_by_date[base_url]:
            # 日付ごとに初期データを設定
            data_by_date[base_url][date] = {
                "screen_page_views": 0,
                "conversions": 0,
                "conversion_rate": 0.0,
                "active_users": 0,
                "sessions": 0,
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
        data_by_date[base_url][date]['screen_page_views'] += entry.get('screen_page_views', 0)
        data_by_date[base_url][date]['conversions'] += entry.get('conversions', 0)
        data_by_date[base_url][date]['active_users'] += entry.get('active_users', 0)
        data_by_date[base_url][date]['sessions'] += entry.get('sessions', 0)
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
                data['conversion_rate'] = data['conversions'] / data['total_users']
            else:
                data['conversion_rate'] = 0.0

    # Search Console Dataの処理
    for entry in search_console_data:
        page = entry.get('page')
        if not page:
            continue
        
        date = entry.get('date').replace("-", "")
        if not date:
            continue

        # URLからパスを取得
        parsed_url = urlparse(page)
        base_url = f"{parsed_url.scheme}://{parsed_url.netloc}"

        if date not in data_by_date[base_url]:
            # 日付ごとに初期データを設定
            data_by_date[base_url][date] = {
                "screen_page_views": 0,
                "conversions": 0,
                "conversion_rate": 0.0,
                "active_users": 0,
                "sessions": 0,
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
    
    return data_by_date

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
                "screen_page_views": 0,
                "conversions": 0,
                "conversion_rate": 0.0,
                "active_users": 0,
                "sessions": 0,
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
        aggregated[base_url][decoded_path]['screen_page_views'] += entry.get('screen_page_views', 0)
        aggregated[base_url][decoded_path]['conversions'] += entry.get('conversions', 0)
        aggregated[base_url][decoded_path]['active_users'] += entry.get('active_users', 0)
        aggregated[base_url][decoded_path]['sessions'] += entry.get('sessions', 0)
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
                data['conversion_rate'] = data['conversions'] / data['total_users'] * 100
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
                "screen_page_views": 0,
                "conversions": 0,
                "conversion_rate": 0.0,
                "active_users": 0,
                "sessions": 0,
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

    # # Conversion Rateの計算
    # for base_url, paths in aggregated.items():
    #     for page_path, data in paths.items():
    #         if data['total_users'] > 0:
    #             data['conversion_rate'] = data['conversions'] / data['total_users'] * 100
    #         else:
    #             data['conversion_rate'] = 0.0

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
            "screen_page_views": 0,
            "conversions": 0,
            "conversion_rate": 0.0,
            "active_users": 0,
            "sessions": 0,
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
            url_summary[base_url]["screen_page_views"] += data["screen_page_views"]
            url_summary[base_url]["conversions"] += data["conversions"]
            url_summary[base_url]["active_users"] += data["active_users"]
            url_summary[base_url]["sessions"] += data["sessions"]
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
            url_summary[base_url]["conversion_rate"] = url_summary[base_url]["conversions"] / url_summary[base_url]["total_users"]
        else:
            url_summary[base_url]["conversion_rate"] = 0.0
        
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