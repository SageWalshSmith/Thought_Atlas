from langchain_ollama import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate
from app.db import summaries_collection

model = OllamaLLM(model="llama3")
prompt = ChatPromptTemplate.from_template("""
Summarize the concept below in simple terms, across disciplines.

Concept: "{concept}"
Summary:
""")
chain = prompt | model

def generate_summary(concept: str) -> str:
    return chain.invoke({"concept": concept})

def get_summary_cached(concept: str) -> str:
    try:
        cached = summaries_collection.find_one({"concept": concept})
        if cached:
            print(f"[CACHE HIT] {concept}")
            return cached["summary"]
        print(f"[CACHE MISS] {concept}")
        summary = generate_summary(concept)
        if summary:
            summaries_collection.insert_one({"concept": concept, "summary": summary})
            return summary
        return "No summary available."
    except Exception as e:
        print(f"[SUMMARY ERROR] {concept}: {e}")
        return "Summary unavailable."