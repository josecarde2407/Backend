import pandas as pd
import requests
import json
import time
import os
from datetime import date

# === CONFIGURACIÓN ===
script_dir = os.path.dirname(os.path.abspath(__file__))
EXCEL_PATH = os.path.join(script_dir, "docentry.xlsx")
COLUMN_NAME = "DocEntry"

TOKEN_URL = "http://192.168.5.10:8081/SMA_WEBAPI_WMS/WS/Services/Token"
PATCH_BASE_URL = "http://192.168.5.10:8081/SMA_WEBAPI_WMS/WS/Services/ProductionOrders/1/"

# Credenciales
USERNAME = "SAPWMS"
PASSWORD = "WMS23X"
GRANT_TYPE = "password"

# Duración estimada del token en segundos
TOKEN_LIFETIME = 25  # un poco menos de 30s por seguridad

# Valores fijos
VALOR_ESTADO = "4"
VALOR_REGISTRO = "999"
VALOR_USUARIO = "wmsisl1"
VALOR_FECHA = str(date.today())  # Fecha actual en formato YYYY-MM-DD

# === FUNCIONES ===
def get_token():
    payload = {
        "grant_type": GRANT_TYPE,
        "username": USERNAME,
        "password": PASSWORD
    }
    try:
        response = requests.post(TOKEN_URL, data=payload)
        response.raise_for_status()
        token = response.json().get("access_token")
        if token:
            print("🔑 Token generado con éxito.")
            return token
        else:
            print("❌ No se encontró 'access_token' en la respuesta.")
            return None
    except Exception as e:
        print(f"❌ Error al obtener token: {e}")
        return None


def patch_docentry(doc_entry, token):
    url = f"{PATCH_BASE_URL}{doc_entry}"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }
    payload = {
        "DocEntry": str(doc_entry),
        "UserFields": [
            {"Name": "U_SMA_WMS_EST", "Value": VALOR_ESTADO},
            {"Name": "U_SMA_WMS_REG", "Value": VALOR_REGISTRO},
            {"Name": "U_SMA_WMS_USU", "Value": VALOR_USUARIO},
            {"Name": "U_SMA_WMS_FEC", "Value": VALOR_FECHA}
        ]
    }

    try:
        response = requests.patch(url, headers=headers, data=json.dumps(payload))
        if response.status_code in [200, 202]:
            message = response.json().get("Message", "Sin mensaje")
            print(f"✅ DocEntry {doc_entry} actualizado con éxito. Mensaje: {message}")
        else:
            print(f"❌ Error DocEntry {doc_entry}. Código: {response.status_code} | Respuesta: {response.text}")
    except Exception as e:
        print(f"⚠️ Excepción al actualizar DocEntry {doc_entry}: {e}")


# === EJECUCIÓN ===
try:
    df = pd.read_excel(EXCEL_PATH)
except Exception as e:
    print(f"❌ Error al leer el archivo Excel: {e}")
    exit()

if COLUMN_NAME not in df.columns:
    print(f"❌ La columna '{COLUMN_NAME}' no existe en el Excel.")
    exit()

docentries = df[COLUMN_NAME].dropna().astype(int).tolist()
print(f"📄 Se encontraron {len(docentries)} DocEntries en el Excel.")

# --- Token inicial
token = get_token()
if not token:
    print("🚫 No se pudo generar token inicial. Abortando.")
    exit()

token_time = time.time()

# --- Procesar DocEntries
for i, doc_entry in enumerate(docentries, start=1):
    # Verificar si el token ya expiró
    if time.time() - token_time > TOKEN_LIFETIME:
        token = get_token()
        token_time = time.time()
        if not token:
            print(f"🚫 No se pudo renovar token. Se salta DocEntry {doc_entry}.")
            continue

    print(f"➡️ [{i}/{len(docentries)}] Procesando DocEntry {doc_entry}...")
    patch_docentry(doc_entry, token)
