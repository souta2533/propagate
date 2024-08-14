from fastapi import APIRouter, HTTPException, Request
import requests

router = APIRouter()

@router.post("/api/get-analytics")
async def get_analytics(request: Request):
    body = await request.json()
    access_token = body.get("accessToken")
    account_id = body.get("accountId")
    property_id = body.get("propertyId")

    if not access_token or not account_id or not property_id:
        raise HTTPException(status_code=400, detail="AccessToken, AccountId, and PropertyId are required")

    try:
        # Google Analytics Data APIのエンドポイントURL
        url = f"https://analyticsdata.googleapis.com/v1beta/properties/{property_id}:runReport"

        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }

        # リクエストボディ
        payload = {
            "dateRanges": [
                {"startDate": "2024-02-01", "endDate": "2024-03-09"}
            ],
            "dimensions": [
                {"name": "pageLocation"},
                {"name": "pagePath"},
                {"name": "date"},
                {"name": "deviceCategory"},
                {"name": "sessionSource"},
                {"name": "city"},
                {"name": "firstUserSourceMedium"}
            ],
            "metrics": [
                {"name": "screenPageViews"},
                {"name": "conversions"},
                {"name": "activeUsers"},
                {"name": "sessions"},
                {"name": "engagedSessions"}
            ]
        }

        # Google Analytics Data APIへのリクエスト
        response = requests.post(url, headers=headers, json=payload)

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch analytics data")

        return response.json()

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))