from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.routes import router

app = FastAPI(title="ThoughtAtlas")

# Mount static AFTER including routes
app.include_router(router)

# Serve static files from /static
app.mount("/", StaticFiles(directory="static", html=True), name="static")