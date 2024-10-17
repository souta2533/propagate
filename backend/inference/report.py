from dotenv import load_dotenv
import os
import requests


load_dotenv(".env.local")
GPU_SERVER_URL = os.getenv("GPU_SERVER_URL")


def get_report(prompt: str) -> str:
    """
        GPUサーバに統計解析の結果を投げてレポートを取得する
    """
    try:
        response = requests.post(
            f"{GPU_SERVER_URL}/get-report",
            json={"prompt": prompt}
        )
        if response.status_code == 200:
            result = response.json()
            return result["report"]
        else:
            return f"Error: {response.status_code} - {response.text}"
        
    except Exception as e:
        return f"Error: {e}"
    

if __name__ == "__main__":
    test_input = "日本で最も美味しい食べ物は何ですか?"
    report = get_report(test_input)
    print(report)