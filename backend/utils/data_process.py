from collections import defaultdict
from urllib.parse import urlparse, unquote


NUM = 30


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
                "clicks": 0,                    
                "impressions": 0,
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
                data['conversion_rate'] = data['conversions'] / data['total_users']
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
                "clicks": 0,                    
                "impressions": 0,
                "ctr": 0,
                "position": 0,
                "country": defaultdict(int),
            }
        
        # クエリの集計
        aggregated[base_url][decoded_path]['clicks'] += entry.get('clicks', 0)
        aggregated[base_url][decoded_path]['impressions'] += entry.get('impressions', 0)
        aggregated[base_url][decoded_path]['ctr'] += entry.get('ctr', 0)
        aggregated[base_url][decoded_path]['position'] += entry.get('position', 0)

        # カテゴリ項目のカウント
        query = entry.get('query')
        if query:
            aggregated[base_url][decoded_path]['query'][query] += 1
        
        country = entry.get('country')
        if country:
            aggregated[base_url][decoded_path]['country'][country] += 1

    # Conversion Rateの計算
    for base_url, paths in aggregated.items():
        for page_path, data in paths.items():
            if data['total_users'] > 0:
                data['conversion_rate'] = data['conversions'] / data['total_users'] * 100
            else:
                data['conversion_rate'] = 0.0

    # CTRの平均値を計算
    for base_url, paths in aggregated.items():
        for path, data in paths.items():
            if data['impressions'] > 0:
                data['ctr'] = (data['clicks'] / data['impressions']) * 100
            else:
                data['ctr'] = 0.0


    # Sortして上位30件を取得する関数
    def get_top_n(data_dict):
        sorted_items = sorted(data_dict.items(), key=lambda x: x[1], reverse=True)
        return dict(sorted_items[:NUM])
    
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
            "clicks": 0,                    
            "impressions": 0,
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
            url_summary[base_url]["clicks"] += data["clicks"]
            url_summary[base_url]["impressions"] += data["impressions"]
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
        if url_summary[base_url]["impressions"] > 0:
            url_summary[base_url]["ctr"] = (url_summary[base_url]["clicks"] / url_summary[base_url]["impressions"]) * 100
        else:
            url_summary[base_url]["ctr"] = 0.0

    return url_summary