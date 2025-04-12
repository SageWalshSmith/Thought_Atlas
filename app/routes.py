from fastapi import APIRouter
from app.logic.ollama_chain import generate_idea_summary
from app.logic.wiki_summary import get_wikipedia_data
from app.logic.graph_builder import build_concept_graph
from networkx.readwrite import json_graph

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