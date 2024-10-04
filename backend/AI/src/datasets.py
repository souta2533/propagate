import json 
from torch.utils.data import Dataset
from transformers import AutoTokenizer
import os


class TextDataset(Dataset):
    def __init__(self, file_path, tokenizer, max_length=512):
        # ファイルからデータを読み込む
        with open(file_path, 'r', encoding='utf-8') as f:
            self.data = json.load(f)

        self.tokenizer = tokenizer
        self.max_length = max_length

    def __len__(self):
        return len(self.data)
    
    def __getitem__(self, idx):
        item = self.data[idx]
        prompt = item['prompt']
        response = item['response']

        # テキストをトークン化
        inputs = self.tokenizer(
            prompt + self.tokenizer.eos_token + response,   # promptとresponseを結合(tokenier.eos_tokenによりpromptとresponseを区別)
            truncation=True,                                # 最大トークン数を超えた場合，トークンを切り捨てる
            max_length=self.max_length,                 
            padding='max_length',                           # 最大長に満たない場合，パディングを追加   
            return_tensors='pt'                             # PyTorchテンソルを返す
        )
        return {
            'input_ids': inputs['input_ids'].squeeze(),             # input_ids: テキストTokenのIDシーケンス，squeeze()で次元を削減
            'attention_mask': inputs['attention_mask'].squeeze(),   # attention_mask: パディングされた箇所を示すマスク(1: パディングされていない箇所，0: パディングされた箇所)
            'labels': inputs['input_ids'].squeeze()
        }