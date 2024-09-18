"""
    PythonからJavaScriptを実行するためのモジュール
"""
import subprocess
import json
import logging


logger = logging.getLogger(__name__)


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

        # print("STDOUT: ", stdout.decode())
        # print("STDERR: ", stderr.decode())
        # print("STDDECODE: ", stdout.decode().strip()[:500])

        if stderr:            
            print(f"JavaScript Error: {stderr.decode()}\n")
            raise Exception(f"JavaScript Error: {stderr.decode()}") 
        
        # 出力結果をJSON形式に変換
        # print('Raw stdout from Node.hs script: ', stdout.decode())
        # print(json.loads(stdout.decode()))

        # 出力が空だった場合，Noneを返す
        if stdout.decode().strip() == "NoData" or stdout.decode().strip() == "":
            return "NoData"
        
        return json.loads(stdout.decode())
    
    except Exception as e:
        if '400' in str(e):
            return "UnregisteredForSearchConsole"
        # Googleのログイン切れの場合
        elif '401' in str(e):
            return "GooglePropertyError"
        # Search Consoleで権限がない場合
        elif '403' in str(e):
            return "Access denied"
        else:
            print(f"Failed to run JavaScript: {e}")
            return None