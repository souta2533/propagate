from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from js_runner import run_js_script

from models.request import URLRequest


router = APIRouter()


"""
    UserがURLを入力した際にDBへ保存するエンドポイント
"""
@router.post("/submit-url")
async def sumit_url(data: URLRequest):
    pass