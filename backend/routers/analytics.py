from fastapi import FastAPI, HTTPException, APIRouter
from pydantic import BaseModel
import json

from js_runner import run_js_script
from models.request import AnalyticsRequest
from db.db_operations import save_analytics_data

router = APIRouter()


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
        print(f"Result is None: {result}")
        raise HTTPException(status_code=500, detail="Failed to get analytics data")
    
    else:
        # print(f"Result: {result}")
        # Google AnalyticsのデータをDBに保存
        save_analytics_data(property_id, result) 
    return result