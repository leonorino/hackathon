from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pathlib import Path
import uvicorn
import json
from calc import router

app = FastAPI()

# Пути к шаблонам и статике
templates_path = Path(__file__).parent.parent / "frontend" / "templates"
static_path = Path(__file__).parent.parent / "frontend" / "static"

templates = Jinja2Templates(directory=templates_path)

# Подключение статики
if static_path.exists():
    app.mount("/static", StaticFiles(directory=static_path), name="static")
    app.mount("/static_back", StaticFiles(directory=Path(__file__).parent / "static"), name="static_back")

app.include_router(router)

# Эндпоинты
@app.get("/")
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/calc")
async def calculator_alloy(request: Request):
    return templates.TemplateResponse("alloy_calc.html", {"request": request})

# ✅ НАДЕЖНЫЙ ЭНДПОИНТ ДЛЯ СПЛАВОВ — КЛЮЧЕВОЕ ИЗМЕНЕНИЕ
ALLOYS_PATH = Path(__file__).parent / "static" / "data" / "alloys.json"

@app.get("/api/alloys")
async def get_alloys():
    try:
        # Проверяем существование файла
        if not ALLOYS_PATH.exists():
            return {
                "error": "Файл сплавов не найден",
                "expected_path": str(ALLOYS_PATH.resolve()),
                "cwd": str(Path.cwd())
            }
        # Читаем с явной кодировкой UTF-8
        with open(ALLOYS_PATH, encoding="utf-8") as f:
            data = json.load(f)
            return data
    except json.JSONDecodeError as e:
        return {"error": "Некорректный JSON", "details": str(e)}
    except Exception as e:
        return {"error": "Внутренняя ошибка", "details": str(e)}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)