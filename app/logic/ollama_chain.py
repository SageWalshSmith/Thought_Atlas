
from langchain_ollama import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate

template = """
You are a helpful AI that explains human ideas and their relationships.

Here is the question: "{question}"

Answer in 1-2 paragraphs, and mention key thinkers, related concepts, and fields.
"""

model = OllamaLLM(model="llama3")
prompt = ChatPromptTemplate.from_template(template)
chain = prompt | model

def generate_idea_summary(question: str) -> str:
    return chain.invoke({"question": question})