from fastapi import FastAPI, HTTPException, APIRouter
from pydantic import BaseModel
from logging import getLogger

from js_runner import run_js_script
from models.request import AnalyticsRequest
from db.db_operations import save_analytics_data

router = APIRouter()
logger = getLogger(__name__)


# Google Analyticsのデータを取得するエンドポイント
@router.post("/get-analytics")
async def get_analytics(data: AnalyticsRequest):
    property_id = data.propertyId
    result = run_js_script("./js/get_analytics.js", data.model_dump())
    # print(result)
    # JSONファイルに保存する
    # with open('analytics_result.json', 'w') as json_file:
    #     json.dump(result, json_file, indent=4, ensure_ascii=False)
    if result is None or result == '':
        logger.error(f"Result is None: {result}")
        raise HTTPException(status_code=500, detail="Failed to get analytics data")
        
    else:
        pass
        # Google AnalyticsのデータをDBに保存
        await save_analytics_data(property_id, result) 
    return result