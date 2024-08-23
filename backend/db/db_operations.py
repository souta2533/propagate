from postgrest.exceptions import APIError   
from db.supabase_client import supabase
import json
import logging


"""

    ここに新しいEmail Propagateの情報を保存する関数が必要

"""
def make_email_propagate(email_propagate):
    """
        同じemail_propagateがすでに存在するかを確認する必要がある
    """
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
        - date
        - date
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
def save_analytics_data(property_id, data):
    try:
        for item in data:
            # 重複データがないかを確認
            existing_data = supabase.table("AnalyticsData").select("id").eq("property_id", property_id).eq("date", item.date).execute()

            if existing_data.data:
                print(f"Data already exists: {existing_data.data}")
                continue

            response = supabase.table("AnalyticsData").insert({
                "property_id": property_id,
                "page_location": item.pageLocation,
                "page_path": item.pagePath,
                "date": item.date,
                "device_category": item.deviceCategory,
                "session_source": item.sessionSource,
                "city": item.city,
                "first_user_source_medium": item.firstUserSourceMedium,
                "screen_page_views": item.screenPageViews,
                "conversions": item.conversions,
                "active_users": item.activeUsers,
                "sessions": item.sessions,
                "engaged_sessions": item.engagedSessions,
            }).execute()
    except APIError as e:
        error_info = e.args[0]
        print(e)
        print(f"Error to save analytics data: {error_info}")


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