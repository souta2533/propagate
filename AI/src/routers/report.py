from fastapi import APIRouter, HTTPException, Request
from inference import LLMModel
import logging


router = APIRouter()
logging.basicConfig(level=logging.INFO)  # INFO レベルを設定
logger = logging.getLogger(__name__)

llm_model = LLMModel(model_name="elyza/ELYZA-japanese-Llama-2-7b-instruct")
logger.info("Access!!")


@router.post("/get-report")
async def get_report(request: Request):
    """
        統計解析結果のリクエストを受け取るエンドポイント
    """
    # logger.info("Access!!")
    body = await request.json()
    propmt = body["prompt"]
    if not propmt:
        raise HTTPException(status_code=400, detail="Prompt is required")
    
    # 統計解析の結果（Prompt）をLLMに投げてレポートを取得
    report = llm_model.make_report(prompt=propmt)
    # logger.info(f"Prompt: {propmt}")
    logger.info(f"Result of Analysis: {report}")
    return {"report": report}