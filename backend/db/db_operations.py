import datetime
from postgrest.exceptions import APIError 
from supabase import Client  
from db.supabase_client import supabase
import logging

from utils.batch import batch_process


logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
log = logging.getLogger("uvicorn")

# NUM_DATA = 200


class PropagateAccountTable:
    """
        PropagateAccountTable
            - id
            - email_propagate
            - created_at
    """
    def __init__(self, supabase_client: Client) -> None:
        self.supabase = supabase_client

    async def get_id_by_email(self, email_propagate: str):
        try:
            response = self.supabase.table("PropagateAccountTable").select('id').eq('email_propagate', email_propagate).execute()

            if response.data:
                # log.info(f"PropagateID: {response.data[0]['id']}")
                return response.data[0]['id']
            
            elif 'error' in response:
                log.error(f"Error: {response.error}")
                return None
            else:
                log.error(f"PropagateID not found for email: {email_propagate}")
        except Exception as e:
            log.error(f"Error: {e}")
            return None
        
class CustomerEmailsTable:
    """
        CustomerEmailsTable
            - id
            - email_propagate_id
            - email_customer
    """
    def __init__(self, supabase_client: Client) -> None:
        self.supabase = supabase_client

    async def insert_customer_email(self, email_propagate_id, email_customer):
        try:
            # log.info(f"Email: {email_customer}")
            existing_response = self.supabase.table("CustomerEmailsTable").select("email_propagate_id", 'email_customer').eq("email_customer", email_customer).execute()
            # log.info(f"Existing response: {existing_response}")

            if existing_response.data:
                log.error(f"Email already exists: {existing_response.data[0]['email_customer']}")
                return None
                
            else:
                response = self.supabase.table("CustomerEmailsTable").insert({
                    "email_propagate_id": email_propagate_id,
                    "email_customer": email_customer
                }).execute()

                # log.info(f"Response: {response}")

                if 'error' in response:
                    log.error(f"Error: {response.error}")
                    return None
                else:
                    log.info(f"Success to insert email: {response.data[0]['email_customer']}")
                    return response.data[0]['email_customer']
        except Exception as e:
            log.error(f"Error: {e}")
            return None

class CustomerDetailsTable:
    """
        CustomerDetailsTable
            - id
            - email_customer
            - accounts_id
            - user_id
            - created_at
    """
    def __init__(self, supabase_client: Client) -> None:
        self.supabase = supabase_client

    def get_account_id_by_email(self, email_customer: str):
        # 複数のAccountIDが見つかった場合でも，最初に見つかったAccountIDを返す
        # TODO: 複数のAccountIDが見つかった場合の処理
        try:
            response = self.supabase.table("CustomerDetailsTable").select('accounts_id').eq('email_customer', email_customer).execute()

            if response.data:
                return response.data[0]['accounts_id']
            else:
                return None
        except Exception as e:
            print(f"Error: {e}")
            return None
        
    async def register_account_id(self, email_customer: str, account_id: str, user_id: str):
        try:
            # log.info(f"Email: {email_customer}")
            # log.info(f"AccountID: {account_id}")    
            existing_response = self.supabase.table("CustomerDetailsTable").select('accounts_id').eq('accounts_id', account_id).execute()

            if existing_response.data:
                return existing_response.data[0]['accounts_id']

            elif 'error' in existing_response:
                log.error(f"Error: {existing_response.error}")
                return None
            else:
                response = self.supabase.table("CustomerDetailsTable").insert({
                        "email_customer": email_customer,
                        "accounts_id": account_id,
                        "user_id": user_id
                    }).execute()
                
                if 'error' in response:
                    log.error(f"Error: {response.error}")
                    return None
                return response.data[0]['accounts_id']
            
        except Exception as e:
            log.error(f"Error: {e}")
            return None

class PropertyTable:
    """
        Property table
            - id
            - account_id
            - properties_id
            - properties_name
            - url
            - created_at
    """
    def __init__(self, supabase_client: Client) -> None:
        self.supabase = supabase_client

    async def register_property(self, account_id, property_id, property_name, url):
        try:
            response = self.supabase.table('PropertyTable').insert({
                'account_id': account_id,
                'properties_id': property_id,
                'properties_name': property_name,
                'url': url
            }).execute()

            if 'error' in response:
                print(f"Error: {response.error}")
            else:
                return response.data[0]
        except Exception as e:
            print(f"Error: {e}")
            return None

    async def get_property_id_by_url(self, url):
        try:
            response = self.supabase \
                .table("PropertyTable") \
                .select("properties_id") \
                .eq("url", url) \
                .execute()
            
            if 'error' in response:
                log.error(f"Error: {response.error}")
                return None
            elif len(response.data) == 0:
                log.error(f"No property ID found for URL: {url}")
                return None
            else:
                return response.data[0]['properties_id']
            
        except Exception as e:
            log.error(f"Error: {e}")
            return None

class AnalyticsData:
    """
        Analytics Table
            - id
            - property_id
            - date
            - page_location
            - page_path
            - device_category
            - session_source
            - city
            - first_user_source_medium
            - screen_page_views
            - conversions
            - active_users
            - sessions
            - engaged_sessions
            - total_users
            - created_at
    """
    def __init__(self, supabase_client: Client) -> None:
        self.supabase = supabase_client

    async def fetch_data(self, property_id, start_date, end_date, jwt_token):
        try:
            # JWTトークンをSupabaseクライアントに設定
            # self.supabase.auth.set_auth(jwt_token)

            limit = 1000
            offset = 0
            all_data = []

            while True:
                response = self.supabase \
                    .table("AnalyticsData") \
                    .select("""
                        date,
                        page_location,
                        page_path, 
                        device_category, 
                        city, 
                        screen_page_views, 
                        conversions, 
                        active_users, 
                        sessions, 
                        engaged_sessions, 
                        total_users
                        """) \
                    .eq("property_id", property_id) \
                    .gte('date', start_date) \
                    .lte('date', end_date) \
                    .range(offset, offset + limit - 1) \
                    .execute()
                
                # データがない場合，ループを終了
                if not response.data or response.data == []:
                    logging.warning(f"No data found for property ID: {property_id}")
                    break
                    
                # データをリストに追加
                all_data.extend(response.data)

                # データが1000件未満の場合，ループを終了
                if len(response.data) < limit:
                    break

                # オフセットを更新
                offset += limit

            return all_data if all_data else None
        
        except Exception as e:
            log.error(f"Error: {e}")
            return None
        
class SearchConsoleDataTable:
    """
        Search Console Data Table
        - id
        - property_id
        - date
        - query
        - page
        - country
        - device
        - clicks
        - impressions
        - ctr
        - position
    """
    def __init__(self, supabase_client: Client) -> None:
        self.supabase = supabase_client

    async def fetch_data(self, property_id, start_date, end_date, jwt_token):
        try:
            # self.supabase.auth.set_auth(jwt_token)

            limit = 1000
            offset = 0
            all_data = []

            while True:
                response = self.supabase \
                    .table("SearchConsoleDataTable") \
                    .select("""
                    date,
                    query,
                    page,
                    country,
                    device,
                    click,
                    impression,
                    ctr,
                    position,
                    total_users
                    """) \
                    .eq("property_id", property_id) \
                    .gte('date', start_date) \
                    .lte('date', end_date) \
                    .range(offset, offset + limit - 1) \
                    .execute()
                
                # データがない場合，ループを終了
                if not response.data or response.data == []:
                    logging.warning(f"No data found for property ID: {property_id}")
                    break

                # データをリストに追加
                all_data.extend(response.data)

                # データが1000件未満の場合，ループを終了
                if len(response.data) < limit:
                    break

                # オフセットを更新
                offset += limit
            
            return all_data if all_data else None
        
        except Exception as e:
            logging.error(f"Error: {e}")
            return None
        



class UnregisteredTable:
    """
        UnregisteredTable
            - id
            - email
            - url
            - user_id
    """
    def __init__(self, supabase_client: Client) -> None:
        self.supabase = supabase_client
    
    async def add_unregistered_user(self, email: str, user_id: str):
        try:
            existing_response = self.supabase.table("UnregisteredTable").select("email").eq("email", email).eq('user_id', user_id).execute()

            if existing_response.data:
                print(f"Email already exists: {existing_response.data}")
                return existing_response.data[0]['email']
            
            response = self.supabase.table("UnregisteredTable").insert({
                "email": email,
                "user_id": user_id
            }).execute()

            if 'error' in response:
                print(f"Error: {response.error}")
            else:
                return response.data[0]['email']
        except Exception as e:
            print(f"Error: {e}")
            return False
        
    async def del_new_user(self, email: str):
        """
            Account IDをつけたユーザの削除
            ただし, URLの登録はされていないことを想定
        """
        try:
            existing_response = self.supabase.table("UnregisteredTable").select('email').eq('email', email).execute()

            if existing_response.data:
                delete_response = self.supabase.table("UnregisteredTable").delete().eq('email', email).eq('url', 'NULL').execute()
                # log.info(f"Delete response: {delete_response}")

                if 'error' in delete_response.data:
                    log.error(f"Error: {delete_response.error}")
                    return False
                else:
                    log.info(f"Deleted email: {email}")
                    return True
            else:
                log.error(f"Email not found: {email}")
                return False
        except Exception as e:
            log.error(f"Error: {e}")
            return False
        
    async def add_url(self, email: str, url: str):
        try:
            existing_response = self.supabase.table("UnregisteredTable").select('email', 'url').eq('email', email).eq('url', url).execute()

            if existing_response.data:
                log.info(f"URL already exists: {existing_response.data}") 
                return existing_response.data[0]['url']
            
            response = self.supabase.table("UnregisteredTable").insert({
                'email': email,
                'url': url
            }).execute()

            if 'error' in response:
                log.error(f"Error: {response.error}")
                return None

            return response.data[0]['url']
    
        except Exception as e:
            log.error(f"Error: {e}")
            return None
        
    async def del_unregistered_url(self, email: str, url: str):
        try:
            existing_response = self.supabase.table("UnregisteredTable").select('email', 'url').eq('email', email).eq('url', url).execute()

            if existing_response.data:
                delete_response = self.supabase.table("UnregisteredTable").delete().eq('email', email).eq('url', url).execute()

                if 'error' in delete_response:
                    print(f"Error: {delete_response.error}")
                    return False
                else:
                    print(f"Deleted URL: {url}")
                    return True
            else:
                print(f"URL not found: {url}")
                return False
        except Exception as e:
            print(f"Error: {e}")
            return False

            
"""

    ここに新しいEmail Propagateの情報を保存する関数が必要

"""

def make_email_propagate(email_propagate):
    """
        同じemail_propagateがすでに存在するかを確認する必要がある
    """
    existing_response = supabase.table("PropagateAccountTable").select("id").eq("email_propagate", email_propagate).execute()

    if existing_response.data:
        print(f"Email propagate already exists: {existing_response.data}")
        return existing_response.data[0]['id']
    
    # email_propagateがすでに存在しない場合, 新しいユーザーを作成
    response = supabase.table("PropagateAccountTable").insert({
        "email_propagate": email_propagate,
    }).execute()

    # エラーが含まれているかをチェック
    if 'error' in response:
        print(f"Error: {response.error}")
    else:
        pass
        # print("Data inserted successfully")
        # print(f"Inserted data: {response.data}")
    return response.data[0]['id']

"""
    Userが入力したURLを保存する関数
"""
# def save_customer_url(customer_email, property_id, url):
#     response = supabase.table("CustomerUrlTable").select("customer_url").eq("customer_url", url).execute()
#     existing_url = response.data
#     print(existing_url)

#     if existing_url and existing_url[0]['customer_url']:
#         return existing_url[0]['customer_url']
#     else:
#         response = supabase.table("CustomerUrlTable").insert({
#             "email_customer": customer_email,
#             "property_id": property_id,
#             "customer_url": url
#         }).execute()

#         if 'error' in response:
#             print(f"Error: {response.error}")
        
#         return response.data[0]['customer_url']

"""
    CustomerEmailsTable
        - id
        - email_propagate_id
        - email_customer
"""
def save_email_customer(email_propagate_id, email_customer):
    # email_customerがすでに存在するかを確認({{'data': {'id': 'xxx', ...}, 'error}: (), 'status_code': ())
    response = supabase.table("CustomerEmailsTable").select("email_customer").eq("email_customer", email_customer).execute()
    existing_user = response.data
    
    if existing_user and existing_user[0]['email_customer']:
        # email_customerがすでに存在する場合
        return existing_user[0]['email_customer']
    
    else:
        # メールが存在しない場合, 新しいユーザーを作成
        response = supabase.table("CustomerEmailsTable").insert({
            "email_propagate_id": email_propagate_id,
            "email_customer": email_customer    
        }).execute()

        # エラーが含まれているかをチェック
        if 'error' in response:
            print(f"Error: {response.error}")
        else:
            pass
            # print("Data inserted successfully")
            # print(f"Inserted data: {response.data}")
        return response.data[0]['email_customer']

"""
    CustomerDetailsTable
        - id
        - email_customer
        - accounts_id
        - created_at
"""
def save_account_data(email_customer, account_id):
    try:
        response = supabase.table("CustomerDetailsTable").insert({
            "email_customer": email_customer,
            "accounts_id": account_id,
        }).execute()

    except APIError as e:
        error_info = e.args[0]
        
        if '23505' in error_info:
            print(f"Duplicate key error: The accountID '{account_id}' already exists")
        else:
            print(f"Error: {error_info}")

"""
    Property table
        - id
        - account_id
        - properties_id
        - properties_name
        - created_at
"""
def save_property_data(account_id, property_id, property_name):
    try:
        response = supabase.table("PropertyTable").insert({
            "account_id": account_id,
            "properties_id": property_id,
            "properties_name": property_name
        }).execute()
    except APIError as e:
        error_info = e.args[0]
        
        if '23505' in error_info:
            logging.warning(f"Duplicate key error: The propertyID '{property_id}' already exists")
            # print(f"Duplicate key error: The propertyID '{property_id}' already exists")
        else:
            logging.error(f"Error: {error_info}")

"""
    Analytics Table
        - id
        - property_id
        - date
        - page_location
        - page_path
        - device_category
        - session_source
        - city
        - first_user_source_medium
        - screen_page_views
        - conversions
        - active_users
        - sessions
        - engaged_sessions
        - total_users
        - created_at

    data: {"pageLocation": x, ...}
"""
def save_batch_analytics_data(batch, property_id):
    try:
        for item in batch:
            # 重複データがないかを確認
            existing_data = (
                supabase.table("AnalyticsData")
                .select("id")
                .eq("property_id", property_id)
                .eq("date", item['date'])
                .eq("page_location", item['pageLocation'])
                .eq("page_path", item['pagePath'])
                .eq("device_category", item['deviceCategory'])
                .eq("session_source", item['sessionSource'])
                .eq("city", item['city'])
                .eq("first_user_source_medium", item['firstUserSourceMedium'])
                .eq("screen_page_views", item['screenPageViews'])
                .eq("conversions", item['conversions'])
                .eq("active_users", item['activeUsers'])
                .eq("sessions", item['sessions'])
                .eq("engaged_sessions", item['engagedSessions'])
                .eq("total_users", item['totalUsers'])  
                .execute()
                )
            
            if existing_data.data:
                print(f"Data already exists: {existing_data.data}")
                continue

            response = supabase.table("AnalyticsData").insert({
                "property_id": property_id,
                "date": item['date'],
                "page_location": item['pageLocation'],
                "page_path": item['pagePath'],
                "device_category": item['deviceCategory'],
                "session_source": item['sessionSource'],
                "city": item['city'],
                "first_user_source_medium": item['firstUserSourceMedium'],
                "screen_page_views": item['screenPageViews'],
                "conversions": item['conversions'],
                "active_users": item['activeUsers'],
                "sessions": item['sessions'],
                "engaged_sessions": item['engagedSessions'],
                "total_users": item['totalUsers']
            }).execute()
    except APIError as e:
        error_info = e.args[0]
        print(e)
        print(f"Error to save analytics data: {error_info}")

async def save_analytics_data(property_id, data, batch_size=50):
    try:
        batch_process(data, batch_size, save_batch_analytics_data, property_id)
    except APIError as e:
        error_info = e.args[0]
        print(f"Error to save analytics data: {error_info}")

"""
    URLをKeyとして, PropertyIDを取得する関数
"""
def get_property_id_by_url(customer_url):
    try:
        response = (
            supabase.table("CustomerUrlTable")
            .select("property_id")
            .eq("customer_url", customer_url)
            .execute()
        )

        if response.data:
            return response.data[0]['property_id']
        else:
            print(f"No property ID found for URL: {customer_url}")
            return None
    except Exception as e:
        print(f"Error to get property ID: {e}")
        return None

"""
    Search Console Data Table
    - id
    - property_id
    - date
    - query
    - page
    - country
    - device
    - clicks
    - impressions
    - ctr
    - position
"""
def save_batch_search_console_data(batch, property_id):
    try:
        for item in batch:
            # 重複データの確認
            existing_data = (
                supabase.table("SearchConsoleDataTable")
                .select("id")
                .eq("property_id", property_id)
                .eq("date", item['date'])
                .eq("query", item['query'])
                .eq("page", item['page'])
                .eq("country", item['country'])
                .eq("device", item['device'])
                .execute()
            )
        
            if existing_data.data:
                print(f"Data already exists: {existing_data.data}")
                continue
            
            # データの挿入
            response = supabase.table("SearchConsoleDataTable").insert({
                "property_id": property_id,
                "date": item['date'],
                "query": item['query'],
                "page": item['page'],
                "country": item['country'],
                "device": item['device'],
                "click": int(item['clicks']),
                "impression": int(item['impressions']),
                "ctr": float(item['ctr']),
                "position": int(round(item['position']))
            }).execute()

    except Exception as e:
        print(f"data: {item}")
        print(f"Error to save search console data: {e}")

async def save_search_console_data(property_id, data, batch_size=50):
    try:
        print(f"Property ID: {property_id}")
        print(f"Total data: {len(data)}")
        # バッチ処理
        for i in range(0, len(data), batch_size):
            print(f"Processing batch {i} to {i + batch_size}")
            batch = data[i:i + batch_size]
            save_batch_search_console_data(batch, property_id)
    except Exception as e:
        print(f"Error to save search console data: {e}")


if __name__ == "__main__":

    """ 
        以下はホストページから処理する内容
    """
    email_propagate = "propagate1@gmail.com"
    # email_propagate_id = make_email_propagate(email_propagate)

    email_customer = "egn1@gmail.com"
    save_email_customer(email_propagate_id=33, email_customer=email_customer)


    """
        ここからはUserが登録またはログイン後に動作する内容?
    """

    # id = save_user_data("kk11@gmail.com")

    # save_account_data(id, account_id="1234")

    # save_property_data(account_id="1234", property_id="5678", property_name="test property")

    data = {
        "pageLocation": "test",
        "pagePath": "test",
        "date": "test",
        "deviceCategory": "test",
        "sessionSource": "test",
        "city": "test",
        "firstUserSourceMedium": "test",
        "screenPageViews": 1,
        "conversions": 1,
        "activeUsers": 1,
        "sessions": 1,
        "engagedSessions": 1,
        "analyticsId": 1
    }
    # save_analytics_data(property_id="5678", data=data)