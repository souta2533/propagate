from collections import defaultdict
from urllib.parse import urlparse, unquote


NUM = 30


def aggregate_data(analytics_data, search_console_data):
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

    # Sortして上位30件を取得する関数
    def get_top_n(data_dict):
        sorted_items = sorted(data_dict.items(), key=lambda x: x[1], reverse=True)
        return dict(sorted_items[:NUM])
    
    # city, country, queryは上位30件のみ渡す
    for page_path, data in aggregated.items():
        if 'city' in data:
            aggregated[base_url][decoded_path]['city'] = get_top_n(data['city'])
        if 'country' in data:
            aggregated[base_url][decoded_path]['country'] = get_top_n(data['country'])
        if 'query' in data:
            aggregated[base_url][decoded_path]['query'] = get_top_n(data['query'])

    return aggregated
