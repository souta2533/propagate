from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import json

from routers import properties, db, analytics
from db.db_operations import save_email_customer
from js_runner import run_js_script

app = FastAPI()

app.include_router(properties.router)
app.include_router(db.router)
app.include_router(analytics.router)

# 許可するオリジンを指定
# CORS設定
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,         # CORS（Cross-Origin Resource Sharing）ミドルウェアを追加
    allow_origins=origins,  # 許可されたオリジンのリストを設定
    allow_credentials=True, # クレデンシャル情報（クッキーや認証ヘッダーなど）の送信を許可
    allow_methods=["*"],    # すべてのHTTPメソッド（GET, POST, PUT, DELETEなど）を許可
    allow_headers=["*"],    # すべてのHTTPヘッダーを許可
)

# """
#     ln -s ../frontend/node_modules node_modules : frontendディレクトリにシンボリックリンクを作成
# """
# class AnalyticsRequest(BaseModel):
#     accessToken: str
#     accountId: str = None
#     propertyId: str = None

# class EmailRequest(BaseModel):
#     email: EmailStr

# """
#     プロパティ情報を取得するエンドポイント
#         - accountId, accountName, propertyId, propertyName
# """
# @app.post("/get-properties")
# async def get_properties(data: AnalyticsRequest):
#     result = run_js_script("./js/get_properties.js", data.model_dump())
#     if result is None:
#         raise HTTPException(status_code=500, detail="Failed to get properties data")
#     print(result[0])
#     # 取得したaccountIdからAccount Tableを作成
#     return result

# """
#     Userが入力したEmailを取得するエンドポイント
# """
# @app.post("/send-email")
# def get_email(request: EmailRequest):
#     email = request.email
#     # save_user_data(email)
#     print(email)
#     return {"email": email}

# # Google Analyticsのデータを取得するエンドポイント
# @app.post("/get-analytics")
# async def get_analytics(data: AnalyticsRequest):
#     result = run_js_script("./js/get_analytics.js", data.model_dump())
#     # print(result)
#     # JSONファイルに保存する
#     with open('analytics_result.json', 'w') as json_file:
#         json.dump(result, json_file, indent=4, ensure_ascii=False)
#     if result is None or result == '':
#         print(f"Result is None: {result}")
#         raise HTTPException(status_code=500, detail="Failed to get analytics data")
    
#     return result

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: str = None):
    return {"item_id": item_id, "q": q}