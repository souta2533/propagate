from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from js_runner import run_js_script

from db.supabase_client import supabase
from models.request import URLRequest, RegisterUser
from db.db_operations import UnregisteredTable


router = APIRouter()


"""
    Userが新規登録した際にDBへ保存するエンドポイント
"""
@router.post("/register-user")
async def register_user(data: RegisterUser):
    unregistered_table = UnregisteredTable(supabase)
    try:
        email = await unregistered_table.add_unregistered_user(data.email)
        return {"message": f"User registered {email}"}
    except Exception as e:
        return {"error": str(e)}, 500

"""
    UserがURLを入力した際にDBへ保存するエンドポイント
"""
@router.post("/submit-url")
async def sumit_url(data: URLRequest):
    pass