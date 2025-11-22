from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pathlib import Path
import uvicorn
import json
from calc import calc_router
from database import init_db, save_experiment, get_all_experiments, get_experiment

app = FastAPI()
init_db()

# Пути к шаблонам и статике
templates_path = Path(__file__).parent.parent / "frontend" / "templates"
static_path = Path(__file__).parent.parent / "frontend" / "static"
alloys_path = Path(__file__).parent / "static" / "data" / "alloys.json"

templates = Jinja2Templates(directory=templates_path)

# Подключение статики
if static_path.exists():
    app.mount("/static", StaticFiles(directory=static_path), name="static")
    app.mount("/static_back", StaticFiles(directory=Path(__file__).parent / "static"), name="static_back")

app.include_router(calc_router)

# Эндпоинты
@app.get("/")
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/calc")
async def calculator_alloy(request: Request):
    return templates.TemplateResponse("alloy_calc.html", {"request": request})



@app.get("/api/alloys")
async def get_alloys():
    try:
        # Проверяем существование файла
        if not alloys_path.exists():
            return {
                "error": "Файл сплавов не найден",
                "expected_path": str(alloys_path.resolve()),
                "cwd": str(Path.cwd())
            }
        # Читаем с явной кодировкой UTF-8
        with open(alloys_path, encoding="utf-8") as f:
            data = json.load(f)
            return data
    except json.JSONDecodeError as e:
        return {"error": "Некорректный JSON", "details": str(e)}
    except Exception as e:
        return {"error": "Внутренняя ошибка", "details": str(e)}

@app.post("/api/save-experiment")
async def save_experiment_endpoint(request: Request):
    try:
        data = await request.json()
        experiment_id = save_experiment(data)
        return {"success": True, "experiment_id": experiment_id}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.get("/api/experiments")
async def get_experiments_list():
    try:
        experiment_ids = get_all_experiments()
        return {"experiments": experiment_ids}
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/experiment/{experiment_id}")
async def get_experiment_endpoint(experiment_id: int):
    try:
        experiment = get_experiment(experiment_id)
        if experiment:
            return experiment
        else:
            return {"error": "Experiment not found"}
    except Exception as e:
        return {"error": str(e)}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)