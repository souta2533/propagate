from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import logging
import os

from db.supabase_client import supabase
from db.db_operations import AnalyticsData, SearchConsoleDataTable, AnalyticsDataTable
from utils.data_process import aggregate_data, aggregate_by_url, aggregate_by_base_url, arrange_by_url, initialize_missing_data, sort_by_date, aggregate_by_path


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
        analytics_data_table = AnalyticsDataTable(supabase)
        data_by_date = await analytics_data_table.fetch_data(propertyId, startDate, endDate, jwt_token)

        # URLごとにデータ構造を整理
        data_by_url = arrange_by_url(data_by_date)

        # 日付がないデータには初期値を設定
        data_by_url = initialize_missing_data(data_by_url, startDate, endDate)

        # 日付でソート
        data_by_url = sort_by_date(data_by_url)

        return {"status": "success", "data": data_by_url}

    except Exception as e:
        log.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get data by day")

@router.get('/fetch-aggregated-data-from-dashboard')
async def get_aggregated_data_from_dashboard(
    propertyId: str,
    startDate: str,
    endDate: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    #  JWTトークンの検証
    jwt_token = credentials.credentials
    if not jwt_token:
        raise HTTPException(status_code=403, detail='Unauthorized')
    
    try:
        # DBからデータを取得
        analytics_data_table = AnalyticsDataTable(supabase)
        data_by_date = await analytics_data_table.fetch_data(propertyId, startDate, endDate, jwt_token)


        # データを集計
        aggregated_data = aggregate_by_path(data_by_date)

        return {"status": "success", "data": aggregated_data}
    except Exception as e:
        log.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get aggregated data from dashboard")

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
    # logging.info("Fetching data by day from details")
    # JWTトークンの検証
    jwt_token = credentials.credentials
    if not jwt_token:
        raise HTTPException(status_code=403, detail='Unauthorized')
    
    try:
        # DBからデータを取得
        analytics_data_table = AnalyticsDataTable(supabase)
        data_by_date = await analytics_data_table.fetch_data(propertyId, startDate, endDate, jwt_token)
        data_by_date_by_base_url = aggregate_by_base_url(data_by_date)

        return {"status": "success", "data": data_by_date_by_base_url}
    
    except Exception as e:
        log.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get data by day details")
    
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