import csv
import json


class ProcessCSV:
    @staticmethod
    def csv_to_json(csv_path):
        data = []

        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            
            # 各行を'prompt'と'response'に分割
            for row in reader:
                prompt = row.get('prompt', '')
                response = row.get('response', '')

                # ファインチューニング用のデータ形式に変換
                data.append({
                    'prompt': prompt,
                    'response': response
                })
        
        return json.dumps(data, ensure_ascii=False, indent=4)