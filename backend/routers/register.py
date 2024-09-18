from fastapi import APIRouter, HTTPException, Header
from dotenv import load_dotenv
import logging
import os

from db.supabase_client import supabase
from models.request import RegisterUrl, RegisterAccountId
from db.db_operations import PropagateAccountTable, CustomerEmailsTable, CustomerDetailsTable, PropertyTable, UnregisteredTable


logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
log = logging.getLogger("uvicorn")

router = APIRouter()
load_dotenv()
    

"""
    Userの新規登録を行うエンドポイント
        - Gmail
        - AccountID(Propagateが挿入)
"""
@router.post("/register-account-id")
async def register_account_id(
    request: RegisterAccountId,
    authorization: str = Header(None)   # JWTトークンをヘッダーから取得
):     
    propagate_email = request.propagateEmail
    email = request.email
    user_id = request.userId
    account_id = request.accountId
    
    # JWTトークンからuserIDを取得
    logging.info(f"Authorization: {authorization}")
    if authorization is None or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail='Authorization header is missing')
    
    jwt_token = authorization.split(" ")[1]
    # headers = {
    #     "Authorization": f"Bearer {jwt_token}",
    #     "apikey": os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    # }

    try:
        # propagate_emailからそのIDを取得
        propagate_account_table = PropagateAccountTable(supabase)
        propagate_id = await propagate_account_table.get_id_by_email(propagate_email)
        # log.info(f"PropagateID: {propagate_id}")

        if propagate_id is None:
            raise HTTPException(status_code=500, detail="Failed to get Propagate ID")
        
        # 取得したPropagateIDからCustomerEmailsTableにEmailを保存
        customer_emails_table = CustomerEmailsTable(supabase)
        result = await customer_emails_table.insert_customer_email(propagate_id, email)
        # log.info(f"CustomerEmailsTable: {result}")

        if result is None:
            log.error(f"CustomerEmailsTable: {result}")
            raise HTTPException(status_code=500, detail="Failed to register email data")
        
        # CustomerDetailsTableにAccountIDを保存
        # log.info(f"Email: {email}, AccountID: {account_id}")
        customer_details_table = CustomerDetailsTable(supabase)
        result = await customer_details_table.register_account_id(email, account_id, user_id)
        # log.info(f"CustomerDetailsTable: {result}")

        if result is None:
            log.info(f"CustomerDetailsTable: {result}")
            raise HTTPException(status_code=500, detail="Failed to register account data")
        
        unregistered_table = UnregisteredTable(supabase)
        result = await unregistered_table.del_new_user(email)

        if result is None:
            log.info(f"UnregisteredTable: {result}")
            raise HTTPException(status_code=500, detail="Failed to delete new user data")
        
        return {"message": "Account ID registered successfully"}
        
    except Exception as e:
        log.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
        return {"error": str(e)}, 500

"""
    Userが入力したURLをDBに保存するエンドポイント
"""
@router.post("/register-property-id")
async def register_url(request: RegisterUrl):
    email = request.email
    property_id = request.propertyId
    property_name = request.propertyName
    url = request.url

    # EmailからAcountIDを取得
    customer_details_table = CustomerDetailsTable(supabase)
    account_id = customer_details_table.get_account_id_by_email(email)

    # AccountIDが複数ある場合，最初のAccountIDを採用
    # TODO: AccountIDが複数ある場合の処理
    # account_id = account_id[0] if len(account_id) > 1 else account_id
    # log.info(f"AccountID: {account_id}")

    # 取得したAcountIDからPropertyTableにPropertyIDとPropertyNameを保存
    property_table = PropertyTable(supabase)
    unregistered_table = UnregisteredTable(supabase)
    try:
        result = await property_table.register_property(account_id, property_id, property_name, url)

        if result is None:
            print(f"PropertyTable: {result}")
            raise Exception(status_code=500, detail="Failed to register property data")
        
        # UnregisteredTableから登録したURLを削除
        result = await unregistered_table.del_unregistered_url(email, url)
        if result:
            print(f"Deleted URL of UnregisteredTable: {url}")
        else:
            print(f"Failed to delete URL of UnregisteredTable: {url}")
        
    except Exception as e:
        return {"error": str(e)}, 500