import pandas as pd
import requests
import os

# === CONFIGURACIÓN ===
script_dir = os.path.dirname(os.path.abspath(__file__))
EXCEL_PATH = os.path.join(script_dir, "docentry.xlsx")
COLUMN_NAME = "DocEntry"

TOKEN_URL = "http://192.168.5.10:8081/SMA_WEBAPI_WMS/WS/Services/Token"
PATCH_BASE_URL = "http://192.168.5.10:8081/SMA_WEBAPI_WMS/WS/Services/BatchNumberDetail/1/"

USERNAME = "SAPWMS"
PASSWORD = "WMS23X"
GRANT_TYPE = "password"

VALOR_ESTADO = "1"

# === FUNCIONES ===

def get_token():
    payload = {
        "grant_type": GRANT_TYPE,
        "username": USERNAME,
        "password": PASSWORD
    }
    response = requests.post(TOKEN_URL, data=payload, timeout=10)
    response.raise_for_status()
    return response.json()["access_token"]

def patch_docentry(doc_entry, token):
    url = f"{PATCH_BASE_URL}{doc_entry}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    payload = {
        "DocEntry": str(doc_entry),
        "UserFields": [
            {"Name": "U_SMA_WMS_EST", "Value": VALOR_ESTADO}
        ]
    }

    response = requests.patch(url, headers=headers, json=payload, timeout=10)

    if response.status_code in (200, 202):
        print(f"✅ DocEntry {doc_entry} actualizado")
    else:
        print(f"❌ DocEntry {doc_entry} | {response.status_code} | {response.text}")

# === EJECUCIÓN ===

df = pd.read_excel(EXCEL_PATH)

if COLUMN_NAME not in df.columns:
    raise ValueError(f"La columna '{COLUMN_NAME}' no existe")

docentries = df[COLUMN_NAME].dropna().astype(int).tolist()

token = get_token()

for doc_entry in docentries:
    patch_docentry(doc_entry, token)
