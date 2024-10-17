import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

import argparse
from bert_score import score
from datetime import datetime
from functools import partial
import numpy as np
import os
from sklearn.model_selection import train_test_split
import torch
from transformers import AutoTokenizer, Trainer, TrainingArguments

from AI.src.models import load_model
from AI.src.datasets import load_dataset, TextDataset
from AI.src.ai_utils.save import save_model


def argument_parser():
    parser = argparse.ArgumentParser()

    parser.add_argument("--model", type=str, default="elyza/ELYZA-japanese-Llama-2-7b-instruct", help='Model Name')
    parser.add_argument("--batch_size", type=int, default=8)
    parser.add_argument("--epochs", type=int, default=100)
    parser.add_argument("--lr", type=float, default=1e-5)
    parser.add_argument("--data_path", type=str, default="")

    return parser

def eval(eval_pred, tokenizer):
    logits, labels = eval_pred      # logits: モデルの予測確率，labels: 正解値()

    # logitsからトークンIDを取得
    predictions = np.argmax(logits, axis=-1)
    
    predictions = tokenizer.batch_decode(predictions, skip_special_tokens=True)   # モデルの予測をトークンIDからテキストに変換
    references = tokenizer.batch_decode(labels, sikp_special_tokens=True)    # 正解ラベルをトークンIDからテキストに変換

    # BERTScoreを用いて予測と参照のスコアを計算
    P, R, F1 = score(predictions, references, lang='ja', verbose=True)

    # F1スコアが一般的にBERTScoreで使用される指標
    result = {
        'bert_score_precision': P.mean().item(),
        'bert_score_recall': R.mean().item(),
        'bert_score_f1': F1.mean().item(),
    }

    return result

def main(args):
    device = 'cuda' if torch.cuda.is_available() else 'cpu'

    # tokenizer: テキストをモデルが扱いやすい形式に変換
    tokenizer = AutoTokenizer.from_pretrained(args.model)

    # パディングトークンを設定(モデルに入力するテキストの長さは統一しなけらば行けないため，Paddingを行うトークンを指定)
    tokenizer.pad_token = tokenizer.eos_token 

    # Modelのロード
    model = load_model(args.model)
    model.to(device)
    
    # Datasetのロード(path -> Json)
    data = load_dataset(args.data_path)
    train_data, eval_data = train_test_split(data, test_size=0.1, random_state=42)
    train_dataset = TextDataset(train_data, tokenizer)
    eval_dataset = TextDataset(eval_data, tokenizer)

    # 保存先フォルダの作成
    current_time = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
    model_dir = os.path.join('AI/models', current_time)
    os.makedirs(model_dir, exist_ok=True)

    log_dir = os.path.join('AI/logs', current_time)
    os.makedirs(log_dir, exist_ok=True)

    # eval関数にtokenizerを部分適用
    compute_metrics = partial(eval, tokenizer=tokenizer)

    # Trainerの設定
    training_args = TrainingArguments(
        output_dir=model_dir,                           # モデルの保存先
        num_train_epochs=args.epochs,                   
        per_device_train_batch_size=args.batch_size,    
        per_device_eval_batch_size=1,                   # 評価時のバッチサイズ
        evaluation_strategy='epoch',                    # モデルの評価するタイミング
        save_strategy='epoch',                          # モデルの保存するタイミング
        learning_rate=args.lr,
        logging_dir=log_dir,                            # ログの保存先
        logging_steps=10,
        metric_for_best_model='bert_score_f1',          # F1スコアで最良のモデルを選択
        greater_is_better=True,                         # F1スコアが大きいほど良い
    )

    # Trainerの初期化
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=eval_dataset,
        compute_metrics=compute_metrics,                # 評価関数を指定
    )

    # Trainingを実行
    trainer.train()

    # モデルの保存
    save_model(model, model_dir)


if __name__ == '__main__':
    parser = argument_parser()
    args = parser.parse_args()

    print(args.model)

    main(args)