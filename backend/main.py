from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from routers import properties, db, analytics, search_console, user_input_handler, register, get_data
from db.db_operations import save_email_customer
from js_runner import run_js_script

app = FastAPI()

app.include_router(properties.router)
app.include_router(db.router)
app.include_router(analytics.router)
app.include_router(search_console.router)
app.include_router(user_input_handler.router)
app.include_router(register.router)
app.include_router(get_data.router)

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

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: str = None):
    return {"item_id": item_id, "q": q}