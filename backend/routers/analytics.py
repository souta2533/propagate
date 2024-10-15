from fastapi import FastAPI, HTTPException, APIRouter
from pydantic import BaseModel
from logging import getLogger

from js_runner import run_js_script
from models.request import AnalyticsRequest
from db.supabase_client import supabase
from db.db_operations import AnalyticsDataTable
from utils.data_process import data_by_date

router = APIRouter()
logger = getLogger(__name__)


# Google Analyticsのデータを取得するエンドポイント
@router.post("/get-analytics")
async def get_analytics(data: AnalyticsRequest):
    property_id = data.propertyId
    result = run_js_script("./js/get_analytics.js", data.model_dump())

    if result is None or result == '':
        logger.error(f"Result is None: {result}")
        raise HTTPException(status_code=500, detail="Failed to get analytics data")
        
    else:
        analytics_by_date = data_by_date(result, search_console_data=None, url_depth=2)

        # Google AnalyticsのデータをDBに保存
        analytics_data_table = AnalyticsDataTable(supabase)
        # await analytics_data_table.insert_analytics_data(property_id, analytics_by_date)

    return HTTPException(status_code=200, detail="Success to get analytics data")