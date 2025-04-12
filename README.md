# 🧠 ThoughtAtlas

An AI-powered web app that maps human ideas across disciplines using Ollama LLM, Wikipedia, and interactive graphs.

## Features
- Analyze any concept (e.g. "free will", "quantum physics")
- Get LLM and Wikipedia-based summaries
- Visualize related ideas with NetworkX
- Use via CLI or FastAPI

## Quick Start

Install dependencies:

```bash
pip install -r requirements.txt

run with:
uvicorn app.main:app --reload
and open "http://localhost:8000" in browser


TO DO:
-add data cache for optimization - reloading data nodes should be quicker.
-rework display for onclick node expansion, currently display does not work.
-add loading circle between prompt entering and initial graph
-rework so when program loads, a prompt says something like "generate thought graph about: " instead of current prompt method.
-optimize ??? app takes 3 minutes to start??