
import requests
import pandas as pd

# URL de la API
url = "http://192.168.5.7:8200/accuracy/WMS/api/v1/GetTransactionLog"

# Encabezados
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub21icmVzIjoiSk9TRSIsImFwZWxsaWRvX3BhdGVybm8iOiJDQVJERU5BUyIsImFwZWxsaWRvX21hdGVybm8iOiIgVkFMTEVKT1MiLCJjYXJnbyI6IkFOQUxJU1RBIEFMTUFDRU4iLCJ1c3VhcmlvIjoiamNhcmRlbmFzIiwibmFtZSI6IkpPU0UgQ0FSREVOQVMgIFZBTExFSk9TIiwic3ViIjoiYjgyYTc2MzktMzVkMC00MTkxLTgxMmQtY2RkYjU5NGM2YjA0IiwianRpIjoiOTAzYTJhNWMtZWE2NC00MWM1LWI4ZGYtOWI3ODNkZmMxODE3IiwiZXhwIjoxNzQ5Nzc1MTc0LCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjQyMDAiLCJhdWQiOiJodHRwOi8vd3d3LmNvbnRvc28uY29tIn0.SvQ5I3Jfnlul8aRq53amFdqTMy5cF-dfhPWkIt96IRk"
}

# Cuerpo (payload)
payload = {
    "id_almacen": "FOOD1",
    "fecha_inicial": "2025-05-28",
    "fecha_final": "2025-06-13",
    "id_cliente": "CE0000000001",
    "id_empleado": "",
    "id_ubicacion": "",
    "tipo_transaccion": "",
    "numero_control": "",
    "numero_item": ""
}

#solicitud POST
response = requests.post(url, headers=headers, json=payload)

#respuesta
if response.status_code == 200:
    data = response.json()
    # hay datos
    if isinstance(data, list) and data:
        df = pd.DataFrame(data)
        df.to_excel("log_transacciones.xlsx", index=False)
        print("✅ Tabla exportada correctamente.")
        print(df.head())
    else:
        print("⚠️ La respuesta está vacía o no tiene formato de lista.")
else:
    print(f"❌ Error al acceder a la API: {response.status_code}")
    print("Mensaje:", response.text)
