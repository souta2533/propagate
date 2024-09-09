import datetime
from postgrest.exceptions import APIError 
from supabase import Client  
from db.supabase_client import supabase
import logging

from utils.batch import batch_process

NUM_DATA = 10


class CustomerDetailsTable:
    """
        CustomerDetailsTable
            - id
            - email_customer
            - accounts_id
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

class PropertyTable:
    """
        Property table
            - id
            - account_id
            - properties_id
            - properties_name
            - created_at
    """
    def __init__(self, supabase_client: Client) -> None:
        self.supabase = supabase_client

    async def register_property(self, account_id, property_id, property_name):
        try:
            response = self.supabase.table('PropertyTable').insert({
                'account_id': account_id,
                'properties_id': property_id,
                'properties_name': property_name    
            }).execute()

            if 'error' in response:
                print(f"Error: {response.error}")
            else:
                return response.data[0]
        except Exception as e:
            print(f"Error: {e}")
            return None
    
"""
    UnregisteredTable
        - id
        - email
        - url
"""
class UnregisteredTable:
    def __init__(self, supabase_client: Client) -> None:
        self.supabase = supabase_client
    
    async def add_unregistered_user(self, email: str):
        try:
            existing_response = self.supabase.table("UnregisteredTable").select("email").eq("email", email).execute()

            if existing_response.data:
                print(f"Email already exists: {existing_response.data}")
                return existing_response.data[0]['email']
            
            response = self.supabase.table("UnregisteredTable").insert({
                "email": email
            }).execute()

            if 'error' in response:
                print(f"Error: {response.error}")
            else:
                return response.data[0]['email']
        except Exception as e:
            print(f"Error: {e}")
            return False
        
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
    CustomerEmailsTable
        - id
        - email_propagate_id
        - email_customer
        - updated_at
"""
class CustomerEmailsTable:
    def __init__(self, supabase_client: Client):
        self.supabase = supabase_client 

    async def update_updated_at(self, email_customer: str):
        """指定されたemail_customerのupdated_atを更新する"""
        try:
            # 現在の日時を取得
            current_time = datetime.datetime.utnow()
            jst_time = current_time + datetime.timedelta(hours=9)

            # email_customerに一致する行のupdated_atを更新
            response = await self.supabase \
                .table("CustomerEmailsTable").update({'updated_at': jst_time}) \
                .eq('email_customer', email_customer) \
                .execute()

            if response.status_code == 200:
                return True
        except Exception as e:
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
def save_customer_url(customer_email, property_id, url):
    response = supabase.table("CustomerUrlTable").select("customer_url").eq("customer_url", url).execute()
    existing_url = response.data
    print(existing_url)

    if existing_url and existing_url[0]['customer_url']:
        return existing_url[0]['customer_url']
    else:
        response = supabase.table("CustomerUrlTable").insert({
            "email_customer": customer_email,
            "property_id": property_id,
            "customer_url": url
        }).execute()

        if 'error' in response:
            print(f"Error: {response.error}")
        
        return response.data[0]['customer_url']

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
            }).execute()
    except APIError as e:
        error_info = e.args[0]
        print(e)
        print(f"Error to save analytics data: {error_info}")

def save_analytics_data(property_id, data, batch_size=50):
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

def save_search_console_data(property_id, data, batch_size=50):
    try:
        print(f"Property ID: {property_id}")
        print(f"Total data: {len(data)}")
        # バッチ処理
        for i in range(0, NUM_DATA, batch_size):
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