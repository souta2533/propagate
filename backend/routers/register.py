from fastapi import APIRouter

from db.supabase_client import supabase
from models.request import RegisterUrl
from db.db_operations import CustomerDetailsTable, PropertyTable, UnregisteredTable


router = APIRouter()


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
    print(f"AccountID: {account_id}")

    # 取得したAcountIDからPropertyTableにPropertyIDとPropertyNameを保存
    property_table = PropertyTable(supabase)
    unregistered_table = UnregisteredTable(supabase)
    try:
        result = await property_table.register_property(account_id, property_id, property_name)

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