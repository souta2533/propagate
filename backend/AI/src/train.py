import argparse
from datetime import datetime
import os
from transoformers import AutoTokenizer, Trainer, TrainingArguments

from AI.src.model import load_model
from AI.src.ai_utils.save import save_model


def argument_parser():
    parser = argparse.ArgumentParser()

    parser.add_argument("--model", type=str, default="", help='Model Name')
    parser.add_argument("--batch_size", type=int, default=8)
    parser.add_argument("--epochs", type=int, default=100)
    parser.add_argument("--lr", type=float, default=1e-5)

    return parser

def main(args):
    # tokenizer
    tokenizer = AutoTokenizer.from_pretrained(args.model)

    # Modelのロード
    model = load_model(args.model)
    
    # Datasetのロード
    """
        データセットをロードする
    """

    # 保存先フォルダの作成
    current_time = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
    model_dir = os.path.join('AI/models/fine_tuned', current_time)
    os.makedirs(model_dir, exist_ok=True)

    log_dir = os.path.join('AI/logs', current_time)
    os.makedirs(log_dir, exist_ok=True)


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
    )

    # Trainerの初期化
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=eval_dataset,
    )

    # Trainingを実行
    trainer.train()

    # モデルの保存
    save_model(model, model_dir)


if __name__ == '__main__':
    parser = argument_parser()
    args = parser.parse_args()

    print(args.model)