from transformers import AutoModelForCausalLM


def load_model(model_name, checkpoint_path=None):
    if checkpoint_path is None:
        model = AutoModelForCausalLM.from_pretrained(model_name, torch_dtype="auto")    # trust_remote_code: リモートのカスタムコードを信頼するかどうか(信頼できるモデルのみに使用する)
        return model
    else:
        model = AutoModelForCausalLM.from_pretrained(checkpoint_path)
        return model