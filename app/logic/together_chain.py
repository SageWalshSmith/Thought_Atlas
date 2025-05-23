import os
import requests
from dotenv import load_dotenv

load_dotenv()

TOGETHER_API_KEY = os.getenv("TOGETHER_API_KEY")

if not TOGETHER_API_KEY:
    raise EnvironmentError("❌ Missing TOGETHER_API_KEY in environment variables.")
else:
    print("✅ TOGETHER_API_KEY loaded")

def generate_idea_summary(question: str) -> str:
    prompt = f"""
You are a helpful AI that explains human ideas and their relationships.

Here is the topic: "{question}"

Briefly describe the topic in 1-2 sentences, and mention key thinkers or works related to the topic.
"""

    headers = {
        "Authorization": f"Bearer {TOGETHER_API_KEY}",
        "Content-Type": "application/json",
    }

    body = {
        "model": "mistralai/Mistral-7B-Instruct-v0.2",
        "prompt": prompt,
        "max_tokens": 150,
        "temperature": 0.7,
        "top_p": 0.9
    }

    try:
        response = requests.post("https://api.together.xyz/v1/completions", headers=headers, json=body)
        response.raise_for_status()
        return response.json()['choices'][0]['text'].strip()
    except Exception as e:
        print(f"❌ Error in generate_idea_summary: {e}")
        return "AI summary generation failed."