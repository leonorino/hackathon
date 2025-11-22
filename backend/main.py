from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pathlib import Path
import uvicorn
from routes import router

app = FastAPI()

templates_path = Path(__file__).parent.parent / "frontend" / "templates"
static_path = Path(__file__).parent.parent / "frontend" / "static"

templates = Jinja2Templates(directory=templates_path)

if static_path.exists():
    app.mount("/static", StaticFiles(directory=static_path), name="static")

app.include_router(router)

@app.get("/")
async def read_root(request: Request):
    return templates.TemplateResponse(request, "index.html", {})

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)