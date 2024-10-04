import argparse
from transformers import AutoTokenizer, AutoModelForCausalLM

from AI.src.models import load_model


def argument_parser():
    parser = argparse.ArgumentParser()

    parser.add_argument("--model", type=str, default="", help='Model Name')
    parser.add_argument("--batch_size", type=int, default=8)
    parser.add_argument("--epochs", type=int, default=100)
    parser.add_argument("--lr", type=float, default=1e-5)

    return parser

def test(args):
    # tokenizer
    tokenizer = AutoTokenizer.from_pretrained(args.model)

    # Modelのロード
    model = load_model(args.model)