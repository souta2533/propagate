from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import report


app = FastAPI()

app.include_router(report.router)

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

@app.get("/")
def read_root():
    return {"Hello": "World"}