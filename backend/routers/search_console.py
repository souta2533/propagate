from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from js_runner import run_js_script

from models.request import SearchConsoleRequest


router = APIRouter()

"""
    Search Consoleからデータを取得するエンドポイント
"""
@router.post("/get-search-console")
async def get_search_console(data: SearchConsoleRequest):
    result = run_js_script("./js/get_search_console.js", data.model_dump())
    if result is None:
        raise HTTPException(status_code=500, detail='Failed to get search console data')
    return result