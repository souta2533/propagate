from fastapi import APIRouter, HTTPException
import logging

from js_runner import run_js_script
from db.supabase_client import supabase
from db.db_operations import AnalyticsDataTable
from models.request import SearchConsoleRequest
from db.db_operations import PropertyTable, save_search_console_data
from utils.data_process import data_by_date


router = APIRouter()
logger = logging.getLogger(__name__)


"""
    Search Consoleからデータを取得するエンドポイント
    - access Token
    - URL
    - Start Date
    - End Date
"""
@router.post("/get-search-console")
async def get_search_console(data: SearchConsoleRequest):
    # トークンが存在するか確認
    if not data.accessToken:
        raise HTTPException(status_code=400, detail="Access token is missing")

    # URLリストが存在するか確認
    if not data.url or not isinstance(data.url, str):
        raise HTTPException(status_code=400, detail="URL is missing or invalid")
    
    try:
        # logger.info(data.model_dump())
        result = run_js_script("./js/get_search_console.js", data.model_dump())

        if result == "NoData" or result == "" or result is None:
            # return []
            raise HTTPException(status_code=404, detail=f'No data available from Search Console ({data.url})')
        elif result == 'Access denied':
            raise HTTPException(status_code=403, detail="Access denied: User does not have sufficient permissions for this URL")
        elif result == 'UnregisteredForSearchConsole':
            raise HTTPException(status_code=400, detail="Unregistered for Search Console")
        elif result is None:
            logger.error(f"Error ({data.url}): {result}")
            raise HTTPException(status_code=500, detail='Failed to get Search Console data')
        else:   
            # URLからPropertyIDを取得
            property_table = PropertyTable(supabase)
            property_id = await property_table.get_property_id_by_url(data.url)

            # Search ConsoleのデータをDBに保存
            analytics_data_table = AnalyticsDataTable(supabase)
            search_console_data = data_by_date(analytics_data=None, search_console_data=result, url_depth=2)
            # logger.info(f"Search Console data: {search_console_data}")
            # await analytics_data_table.insert_search_console_data(property_id, search_console_data)
        return HTTPException(status_code=200, detail="Success to get Search Console data")
    
    except HTTPException as e:
        if "403" in str(e) or e.status_code == 403:
            raise HTTPException(status_code=403, detail="Access denied: User does not have sufficient permissions for this URL")
        else:
            logger.error(f"Error: {e}")
            raise e
    except Exception as e:
        # 権限不足でエラーが発生した場合
        if 'Access denied' in str(e):
            raise HTTPException(status_code=403, detail="Access denied: User does not have sufficient permissions for this URL")
        
        raise HTTPException(status_code=500, detail=str(e))