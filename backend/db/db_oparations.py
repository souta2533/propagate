from supabase_client import supabase
from postgrest.exceptions import APIError   


"""
    users table 
        - id
        - email
        - created_at
"""
def save_user_data(email: str):
    response = supabase.table("users").insert({
        "email": email
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
    Account Table
        - id
        - user_id
        - accounts_id
        - created_at
"""
def save_account_data(user_id, account_id):
    try:
        response = supabase.table("accounts").insert({
            "user_id": user_id,
            "accounts_id": account_id,
        }).execute()

    except APIError as e:
        error_info = e.args[0]
        
        if '23505' in error_info:
            print(f"Duplicate key error: The accountID '{account_id}' already exists")
        else:
            print(f"Error: {error_info}")

"""
    properties table
        - id
        - account_id
        - properties_id
        - properties_name
        - created_at
"""
def save_property_data(account_id, property_id, property_name):
    try:
        response = supabase.table("properties").insert({
            "account_id": account_id,
            "properties_id": property_id,
            "properties_name": property_name
        }).execute()
    except APIError as e:
        error_info = e.args[0]
        
        if '23505' in error_info:
            print(f"Duplicate key error: The propertyID '{property_id}' already exists")
        else:
            print(f"Error: {error_info}")

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
        response = supabase.table("analytics_data").insert({
            "property_id": property_id,
            "page_location": data["pageLocation"],
            "page_path": data["pagePath"],
            "date": data["date"],
            "device_category": data["deviceCategory"],
            "session_source": data["sessionSource"],
            "city": data["city"],
            "first_user_source_medium": data["firstUserSourceMedium"],
            "screen_page_views": data["screenPageViews"],
            "conversions": data["conversions"],
            "active_users": data["activeUsers"],
            "sessions": data["sessions"],
            "engaged_sessions": data["engagedSessions"],
        }).execute()
    except APIError as e:
        error_info = e.args[0]
        print(e)
        print(f"Error: {error_info}")


if __name__ == "__main__":
    id = save_user_data("kk11@gmail.com")

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
    save_analytics_data(property_id="5678", data=data)