from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from js_runner import run_js_script


router = APIRouter()

class AnalyticsRequest(BaseModel):
    accessToken: str
    accountId: str = None
    propertyId: str = None

"""
    プロパティ情報を取得するエンドポイント
        - accountId, accountName, propertyId, propertyName
"""
@router.post("/get-properties")
async def get_properties(data: AnalyticsRequest):
    result = run_js_script("./js/get_properties.js", data.model_dump())
    if result is None:
        raise HTTPException(status_code=500, detail="Failed to get properties data")
    # print(result[0])
    return result