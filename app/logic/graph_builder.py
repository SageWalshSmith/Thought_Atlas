import networkx as nx
from app.logic.together_chain import generate_idea_summary

def build_concept_graph(topic: str, summary: str, related: list[str]) -> nx.Graph:
    G = nx.Graph()
    G.add_node(topic, type="topic", summary=summary, depth=0)

    for concept in related:
        try:
            concept_summary = generate_idea_summary(concept)
        except Exception:
            concept_summary = "No summary available."

        G.add_node(concept, type="related", summary=concept_summary, depth=1)
        G.add_edge(topic, concept, relation="wikipedia_link")

    return G