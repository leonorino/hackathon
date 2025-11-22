from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pathlib import Path
import uvicorn

# Create the FastAPI app
app = FastAPI()

# Define the path to the frontend templates
templates_path = Path(__file__).parent.parent / "frontend" / "templates"
static_path = Path(__file__).parent.parent / "frontend" / "static"

# Setup Jinja2 templates
templates = Jinja2Templates(directory=templates_path)

# Mount static files to serve CSS, JS, and other assets
if static_path.exists():
    app.mount("/static", StaticFiles(directory=static_path), name="static")

# Route to serve the index template
@app.get("/")
async def read_root(request: Request):
    return templates.TemplateResponse(request, "index.html", {})

# Basic health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)