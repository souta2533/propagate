import os
from openai import OpenAI


client = OpenAI(
    api_key=os.getenv("CHATGPT_API_KEY")
)

def get_answer_from_gpt(prompt: str) -> str:
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a native speaker of both English and Japanese and an excellent English teacher in Japan who teaches Japanese. Please explain the following about the word in Japanese, except the example sentence which should be in English."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=300,
    )
    
    return response.choices[0].message.content