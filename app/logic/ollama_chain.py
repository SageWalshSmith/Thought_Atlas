
from langchain_ollama import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate

template = """
You are a helpful AI that explains human ideas and their relationships.

Here is the topic: "{question}"

Briefly describe the topic in 1-2 sentences, and mention key thinkers or works related to the topic.
"""

model = OllamaLLM(model="llama3")
prompt = ChatPromptTemplate.from_template(template)
chain = prompt | model

def generate_idea_summary(question: str) -> str:
    return chain.invoke({"question": question})