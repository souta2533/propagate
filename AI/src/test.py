import argparse
import torch
from torch.utils.data import DataLoader 
from transformers import AutoTokenizer, AutoModelForCausalLM

from AI.src.models import load_model
from AI.src.datasets import load_dataset, TextDataset
from AI.src.ai_utils.search_dir import load_latest_checkpoint


def argument_parser():
    parser = argparse.ArgumentParser()

    parser.add_argument("--save_dir", type=str, default="", help='Save Directory')
    parser.add_argument("--data_path", type=str, default="")

    return parser

def test(args):
    # tokenizer
    tokenizer = AutoTokenizer.from_pretrained(args.model)

    # パディングトークンを設定(モデルに入力するテキストの長さは統一しなけらば行けないため，Paddingを行うトークンを指定)
    tokenizer.pad_token = tokenizer.eos_token 

    # 最新のチェックポイントをロード
    latest_checkpoint_path = load_latest_checkpoint(args.save_dir)

    # モデルのロード
    model = load_model(checkpoint_path=latest_checkpoint_path)
    model.eval()

    # テストデータのロード
    data = load_dataset(args.data_path)
    test_dataset = TextDataset(data, tokenizer)
    test_dataloader = DataLoader(test_dataset, batch_size=1, shuffle=True)

    # Deviceの設定
    device = 'cuda' if torch.cuda.is_available() else 'cpu'

    results = []
    with torch.no_grad():
        for batch in test_dataloader:
            input_ids = batch['input_ids'].to(device)
            attention_mask = batch['attention_mask'].to(device)
            labels = batch['labels'].to(device)

