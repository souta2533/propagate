from fastapi import APIRouter, HTTPException
import logging

from js_runner import run_js_script
from models.request import SearchConsoleRequest
from db.db_operations import get_property_id_by_url, save_search_console_data


router = APIRouter()
logger = logging.getLogger(__name__)


"""
    Search Consoleからデータを取得するエンドポイント
"""
@router.post("/get-search-console")
async def get_search_console(data: SearchConsoleRequest):
    logger.info(f"Recieved accessToken: {data.accessToken}")
    logger.info(f"Recieved URL: {data.url}")

    # トークンが存在するか確認
    if not data.accessToken:
        raise HTTPException(status_code=400, detail="Access token is missing")

    # URLリストが存在するか確認
    if not data.url or not isinstance(data.url, str):
        raise HTTPException(status_code=400, detail="URL is missing or invalid")

    result = run_js_script("./js/get_search_console.js", data.model_dump())
    # print(f"result: {result}")
    if result is None:
        raise HTTPException(status_code=500, detail='Failed to get Search Console data')
    elif result == "NoData":
        raise HTTPException(status_code=204, detail='No data available from Search Console')
    else:
        # URLからPropertyIDを取得
        property_id = get_property_id_by_url(data.url)

        # Search ConsoleのデータをDBに保存
        # save_search_console_data(property_id, result)
    return result