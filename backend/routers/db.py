# routers/email.py
from fastapi import APIRouter
from functools import lru_cache

from models.request import CustomerEmailRequest, InfoRequestForDB, AnalyticsDataRequest
from db.db_operations import save_email_customer, save_account_data, save_property_data, save_analytics_data


router = APIRouter()

"""
    email_propagate: propagateのemail
    email_customer: customerのemail
"""
@router.post("/send-email")
def get_email_from_customer(request: CustomerEmailRequest):
    email_propagate_id = request.email_propagate_id
    email_customer = request.email_customer

    # email_customerをDBに保存
    email_customer = save_email_customer(email_propagate_id, email_customer)
    print(email_customer)

    return {"email_propagate": email_propagate_id, "email_customer": email_customer}

"""
    Propertyを取得したのち, その情報からDBを更新するエンドポイント
"""
@router.post("/send-info")
def get_info_for_db(request: InfoRequestForDB):
    properties_data = request.properties
    email_propagate_id = request.email_propagate_id
    email_customer = request.email_customer

    # User TableにEmailを保存
    email_customer = save_email_customer(email_propagate_id, email_customer)

    # properties_dataに含まれるaccountId, propertyIdからDBを更新
    for property_data in properties_data:
        accountId = property_data.accountId
        propertyId = property_data.propertyId
        property_name = property_data.propertyName

        # Account TableにAccountIDを保存
        # save_account_data(email_customer, accountId)

        # Property TableにPropertyIDとPropertyNameを保存
        # save_property_data(accountId, propertyId, property_name)

"""
    Google Analyticsからデータを取得したのち, その情報をDBに保存するエンドポイント
"""
@router.post("/send-analytics/{propertyId}")
def get_analytics_data(request: AnalyticsDataRequest, propertyId: str):
    analytics_data = request.analyticsData
    
    # Google AnalyticsのデータをDBに保存
    # save_analytics_data(propertyId, analytics_data)