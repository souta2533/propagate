from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import logging
import os

from db.supabase_client import supabase
from db.db_operations import AnalyticsData, SearchConsoleDataTable
from utils.data_process import aggregate_data


logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
log = logging.getLogger("uvicorn")

router = APIRouter()

security = HTTPBearer()     # JWT認証用のセキュリティ設定


@router.get('/fetch-aggregated-data')
async def get_aggregated_data(
    propertyId: str,
    startDate: str,
    endDate: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    #  JWTトークンの検証
    token = credentials.credentials
    if not token:
        raise HTTPException(status_code=403, detail='Unauthorized')
    
    try:
        # DBからデータを取得
        analytics_table = AnalyticsData(supabase)
        analytics_data = await analytics_table.fetch_aggregated_data(propertyId, startDate, endDate, token)

        search_console_table = SearchConsoleDataTable(supabase)
        search_console_data = await search_console_table.fetch_aggregated_data(propertyId, startDate, endDate, token)
        
        # logging.info(f"Analytics data: {analytics_data}")
        # logging.info(f"Search Console data: {search_console_data}")

        # データを集計
        aggegate_data = aggregate_data(analytics_data, search_console_data)

        # logging.info(f"Aggregated data: {aggegate_data[0]["query"]}")

        return {"status": "succes", "data": aggegate_data}
    except Exception as e:
        log.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get aggregated data")