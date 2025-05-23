from fastapi import APIRouter
from app.logic.together_chain import generate_idea_summary
from app.logic.wiki_summary import get_wikipedia_data
from app.logic.graph_builder import build_concept_graph
from networkx.readwrite import json_graph
import networkx as nx
router = APIRouter()

@router.get("/explore")
def explore_idea(topic: str):
    wiki_summary, related_links = get_wikipedia_data(topic)
    ai_summary = generate_idea_summary(topic)
    graph = build_concept_graph(topic, ai_summary, related_links)

    return {
        "topic": topic,
        "wikipedia": wiki_summary,
        "ai_summary": ai_summary,
        "graph": json_graph.node_link_data(graph)
    }

@router.get("/expand")
def expand_node(topic: str):
    import networkx as nx  # in case it's not already imported

    wiki_summary, related_links = get_wikipedia_data(topic)
    ai_summary = generate_idea_summary(topic)

    # Build a new graph just for this expansion
    G = nx.Graph()

    # Add the clicked node (center of this expansion)
    G.add_node(topic, type="expanded", summary=ai_summary, depth=1)

    for related in related_links[:4]:  # Limit expansion
        try:
            summary = generate_idea_summary(related)
        except Exception:
            summary = "No summary available."

        G.add_node(related, type="related", summary=summary, depth=2)
        G.add_edge(topic, related, relation="expanded_link")  # 👈 Connect new nodes to clicked one

    return {
        "topic": topic,
        "wikipedia": wiki_summary,
        "ai_summary": ai_summary,
        "graph": json_graph.node_link_data(G)
    }