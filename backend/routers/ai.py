from fastapi import FastAPI, HTTPException, APIRouter, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from logging import getLogger
import pandas as pd

from db.supabase_client import supabase
from db.db_operations import AnalyticsDataTable
from utils.data_process import arrange_by_url, transform_for_statistic_analysis
from utils.prompt import Prompt
from statistics_analysis.analysis import StatisticsAnalysisData
from inference.report  import get_report


router = APIRouter()
security = HTTPBearer()     # JWT認証用のセキュリティ設定 

logger = getLogger(__name__)

# ChatGPTからレポートを受け取るエンドポイント
@router.get("/fetch-llm-report")
async def get_gpt_report(
    propertyId: str,
    startDate: str,
    endDate: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
        ChatGPTからレポートを受け取るエンドポイント
    """
    # JWTトークンの検証
    jwt_token = credentials.credentials
    if not jwt_token:
        raise HTTPException(status_code=403, detail='Unauthorized')
    
    try:
        # DBからデータを取得
        analytics_data_table = AnalyticsDataTable(supabase)
        data_by_date = await analytics_data_table.fetch_data(propertyId, startDate, endDate, jwt_token)
        data_by_url = arrange_by_url(data_by_date, type='analysis')

        if data_by_url is None:
            return {"status": "failed", "message": "No data"}
        
        df = pd.DataFrame(data_by_url)
        # logger.info(f"Data for analysis: {data_by_url['base_url']}")

        # 統計解析を行うインスタンスを生成
        statistics_analysis = StatisticsAnalysisData(supabase)

        # 統計解析を実行
        # logger.info(f"Data for analysis: {df}")
        result = statistics_analysis.perform_analysis(data_by_day=df)

        if result is None:
            return {"status": "failed", "message": "Failed to perform analysis"}

        prompt = Prompt()
        prompt_for_issues = prompt.create_prompt_for_issues(
            format_path='static/analysis_format.txt',
            user_info={
                'industry': 'Web運用',
                'goal': 'CVR向上',
                'website_overview': 'Web運用のためのWebサイト'
            },
            result_of_analysis=result
        )
        
        # logger.info(f"Prompt for GPT: {prompt_for_issues}")

        # LLMから統計解析の結果を取得
        report = get_report(prompt_for_issues)
        logger.info(f"Report from LLM: {report}")

        return {"status": "success", "report": report}

    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get data by day")