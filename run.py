from app.logic.ollama_chain import generate_idea_summary
from app.logic.wiki_summary import get_wikipedia_summary
from app.logic.graph_builder import build_concept_graph

def cli():
    print("🧠 Welcome to ThoughtAtlas CLI")
    topic = input("Enter a topic: ")
    wiki = get_wikipedia_summary(topic)
    ai = generate_idea_summary(topic)
    graph = build_concept_graph(topic, ai)

    print("\n🔍 Wikipedia Summary:\n", wiki)
    print("\n🤖 AI Summary:\n", ai)
    print("\n🕸️ Graph Nodes:")
    print(graph.nodes(data=True))

if __name__ == "__main__":
    cli()