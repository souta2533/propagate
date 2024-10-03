from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import logging
import os

from db.supabase_client import supabase
from db.db_operations import AnalyticsData, SearchConsoleDataTable
from utils.data_process import data_by_date, data_by_page_path, aggregate_data, aggregate_by_url


logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
log = logging.getLogger("uvicorn")

router = APIRouter()

security = HTTPBearer()     # JWT認証用のセキュリティ設定 


@router.get('/fetch-data-by-day')
async def get_data_by_day(
    propertyId: str,
    startDate: str,
    endDate: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
        Analytics DataとSearch Console Dataを日付ごとに取得するエンドポイント
    """
    # JWTトークンの検証
    jwt_token = credentials.credentials
    if not jwt_token:
        raise HTTPException(status_code=403, detail='Unauthorized')
    
    try:
        # DBからデータを取得
        analytics_table = AnalyticsData(supabase)
        analytics_data = await analytics_table.fetch_data(propertyId, startDate, endDate, jwt_token)

        search_console_table = SearchConsoleDataTable(supabase)
        search_console_data = await search_console_table.fetch_data(propertyId, startDate, endDate, jwt_token)

        data_by_day = data_by_date(analytics_data, search_console_data)

        return {"status": "success", "data": data_by_day}

    except Exception as e:
        log.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get data by day")

@router.get('/fetch-data-by-day-from-details')
async def get_data_by_day_from_details(
    propertyId: str,
    startDate: str,
    endDate: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
        Detailsのページ用
        Analytics DataとSearch Console Dataを日付ごとに取得するエンドポイント
    """
    logging.info("Fetching data by day from details")
    # JWTトークンの検証
    jwt_token = credentials.credentials
    if not jwt_token:
        raise HTTPException(status_code=403, detail='Unauthorized')
    
    try:
        # DBからデータを取得
        analytics_table = AnalyticsData(supabase)
        analytics_data = await analytics_table.fetch_data(propertyId, startDate, endDate, jwt_token)

        search_console_table = SearchConsoleDataTable(supabase)
        search_console_data = await search_console_table.fetch_data(propertyId, startDate, endDate, jwt_token)

        data = data_by_page_path(analytics_data, search_console_data)

        return {"status": "success", "data": data}
    
    except Exception as e:
        log.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get data by day details")

@router.get('/fetch-aggregated-data-from-dashboard')
async def get_aggregated_data_from_dashboard(
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
        analytics_data = await analytics_table.fetch_data(propertyId, startDate, endDate, token)

        search_console_table = SearchConsoleDataTable(supabase)
        search_console_data = await search_console_table.fetch_data(propertyId, startDate, endDate, token)
        
        # logging.info(f"Analytics data: {analytics_data}")
        # logging.info(f"Search Console data: {search_console_data}")

        # データを集計
        aggregated_data = aggregate_data(analytics_data, search_console_data)
        aggregated_data_by_url = aggregate_by_url(aggregated_data)

        logging.info(f"Aggregated data: {aggregated_data_by_url}")

        return {"status": "success", "data": aggregated_data_by_url}
    except Exception as e:
        log.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get aggregated data from dashboard")

@router.get('/fetch-aggregated-data-from-detail')
async def get_aggregated_data_from_detail(
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
        analytics_data = await analytics_table.fetch_data(propertyId, startDate, endDate, token)

        search_console_table = SearchConsoleDataTable(supabase)
        search_console_data = await search_console_table.fetch_data(propertyId, startDate, endDate, token)
        
        # logging.info(f"Analytics data: {analytics_data}")
        # logging.info(f"Search Console data: {search_console_data}")

        # データを集計
        aggregated_data = aggregate_data(analytics_data, search_console_data)

        # logging.info(f"Aggregated data: {aggegate_data[0]["query"]}")

        return {"status": "success", "data": aggregated_data}
    except Exception as e:
        log.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get aggregated data from detail")