import torch
from transformers import AutoModelForCausalLM, AutoTokenizer


B_INST, E_INST = "[INST]", "[/INST]"
B_SYS, E_SYS = "<<SYS>>\n", "\n<</SYS>>\n\n"
DEFAULT_SYSTEM_PROMPT = "あなたは誠実で優秀な日本人のアシスタントです。誰でもわかりやすい形でWebサイトの現状と課題を説明してください。"


class LLMModel:
    def __init__(self, model_name):
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'

        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForCausalLM.from_pretrained(model_name, torch_dtype="auto")
        self.model.to(self.device)

    def make_report(self, prompt, max_length=512):
        """
            統計解析結果のレポートを生成
        """
        # プロンプトのフォーマットにシステムとインスタンスタグを追加
        formatted_prompt = "{bos_token}{b_inst} {system}{prompt} {e_inst}".format(
            bos_token=self.tokenizer.bos_token,
            b_inst=B_INST,
            system=f"{B_SYS}{DEFAULT_SYSTEM_PROMPT}{E_SYS}",
            prompt=prompt,
            e_inst=E_INST
        )
        inputs = self.tokenizer(formatted_prompt, return_tensors='pt', max_length=max_length, truncation=True).to(self.device)

        # 推論
        with torch.no_grad():
            outputs = self.model.generate(
                inputs['input_ids'], 
                max_new_tokens=max_length,
            )
        
        # 生成されたテキストをDecode
        generated_text = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        return generated_text