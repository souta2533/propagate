"""
    PythonからJavaScriptを実行するためのモジュール
"""
import subprocess
import json


def run_js_script(script_name, input_data):
    try:
        # Node.jsのプロセスを実行
        process = subprocess.Popen(
            ['node', script_name],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )

        # 入力データをJSON形式に変換
        # print('Input data to Node.js script: ', input_data)
        # print(json.dumps(input_data))
        stdout, stderr = process.communicate(json.dumps(input_data).encode())

        if stderr:
            print(f"JavaScript Error: {stderr.decode()}")
            raise Exception(f"JavaScript Error: {stderr.decode()}") 
        
        if not stdout:
            raise Exception("No output received from JavaScript")
        
        # 出力結果をJSON形式に変換
        # print('Raw stdout from Node.hs script: ', stdout.decode())
        # print(json.loads(stdout.decode()))

        # 出力が空だった場合，Noneを返す
        if stdout.decode().strip() == "NoData":
            return "NoData"
        
        return json.loads(stdout.decode())
    
    except Exception as e:
        print(f"Failed to run JavaScript: {e}")
        return None