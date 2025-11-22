from fastapi import APIRouter, Request

router = APIRouter()

@router.post("/api/update-values")
async def update_values(request: Request):
    data = await request.json()
    current = data.get("current")
    voltage = data.get("voltage")
    temperature = data.get("temperature")
    concentration = data.get("concentration")
    
    print(f"Updated values - Current: {current}A, Voltage: {voltage}V, Temperature: {temperature}K, Concentration: {concentration}")
    
    return {"status": "success", "values": data}
