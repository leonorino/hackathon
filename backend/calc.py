from fastapi import APIRouter, Request

calc_router = APIRouter()

def calculate_metrics(current, voltage, temperature, concentration):
    eta0 = 90.0

    temperature_warning = None
    if temperature <= 950:
        eta = 70.0
        temperature_warning = "Опасность застывания электролита!"
    elif concentration < 3.0:
        eta = 60.0
        temperature_warning = "Анодный Эффект! Срочно подать глинозём!"
    else:
        
        if temperature == 960:
            d_eta_T = 0
        elif 950 < temperature < 960:
            d_eta_T = -0.3 * (960 - temperature)
        else:  
            d_eta_T = -0.5 * (temperature - 960)

        
        if 3.5 <= concentration <= 4.5:
            d_eta_C = 0
        elif 3.0 <= concentration < 3.5:
            d_eta_C = -0.5 * (3.5 - concentration)
        else:
            d_eta_C = 0  

        eta = eta0 + d_eta_T + d_eta_C
        eta = max(60.0, min(95.0, eta))

    voltage_warning = None
    if voltage < 4.0:
        voltage_warning = "Опасность короткого замыкания!"

    g_Al = 0.3356  
    E_ud = (voltage * 1000) / (g_Al * (eta / 100))
    anode_consumption = 334 / (eta / 100)

    return {
        "eta": round(eta, 2),
        "E_ud": round(E_ud, 1),
        "anode_consumption": round(anode_consumption, 1),
        "temperature_warning": temperature_warning,
        "voltage_warning": voltage_warning
    }

@calc_router.post("/api/update-values")
async def update_values(request: Request):
    data = await request.json()
    current = float(data.get("current"))
    voltage = float(data.get("voltage"))
    temperature = float(data.get("temperature"))
    concentration = float(data.get("concentration"))

    metrics = calculate_metrics(current, voltage, temperature, concentration)

    return metrics