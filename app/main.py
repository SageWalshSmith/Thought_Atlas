# main.py
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.routes import router

app = FastAPI(title="ThoughtAtlas")

# ✅ Use /api prefix to avoid conflict
app.include_router(router, prefix="/api")

# ✅ Serve the static HTML
app.mount("/", StaticFiles(directory="static", html=True), name="static")