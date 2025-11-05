import pandas as pd
import requests
import json
import time
import os

# === CONFIGURACIÓN ===
script_dir = os.path.dirname(os.path.abspath(__file__))
EXCEL_PATH = os.path.join(script_dir, "articulos.xlsx")
COLUMN_NAME = "articulos"

TOKEN_URL = "http://192.168.5.10:8081/SMA_WEBAPI_WMS/WS/Services/Token"
PATCH_BASE_URL = "http://192.168.5.10:8081/SMA_WEBAPI_WMS/WS/Services/Items/1/"

USERNAME = "SAPWMS"
PASSWORD = "WMS23X"
GRANT_TYPE = "password"

VALOR_ESTADO = "1"

# === FUNCIONES ===

def get_token():
    payload = {"grant_type": GRANT_TYPE, "username": USERNAME, "password": PASSWORD}
    try:
        response = requests.post(TOKEN_URL, data=payload, timeout=10)
        response.raise_for_status()
        return response.json().get("access_token")
    except Exception as e:
        print(f"❌ Error al obtener token: {e}")
        return None

def patch_ItemCode(ItemCode, token, retries=3):
    url = f"{PATCH_BASE_URL}{ItemCode}"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }
    payload = {
        "ItemCode": ItemCode,
        "UserFields": [
            {"Name": "U_SMA_WMS_EST", "Value": VALOR_ESTADO},
        ]
    }

    for attempt in range(1, retries + 1):
        try:
            response = requests.patch(url, headers=headers, data=json.dumps(payload), timeout=30)
            
            if response.status_code in [200, 202]:
                print(f"✅ ItemCode {ItemCode} actualizado con éxito.")
                return
            
            # Token expirado
            elif response.status_code == 401:
                print(f"🔒 Token expirado o no autorizado para ItemCode {ItemCode}.")
                with open("errores.txt", "a") as file:
                    file.write(f"{ItemCode} | Token expirado o no autorizado.\n")
                return
            
            # Artículo no encontrado
            elif response.status_code == 400 and "-2028" in response.text:
                print(f"🚫 ItemCode {ItemCode} no existe en SAP. Se omite.")
                with open("errores.txt", "a") as file:
                    file.write(f"{ItemCode} | No existe en SAP.\n")
                return
            
            # Error de conexión a la compañía
            elif response.status_code == 400 and "already connected to a company" in response.text:
                print(f"🔁 Conexión SAP ocupada para ItemCode {ItemCode}. Intento {attempt} de {retries}.")
                if attempt < retries:
                    time.sleep(5)  # Esperar antes de reintentar
                else:
                    print(f"🚫 ItemCode {ItemCode} falló por conexión ocupada tras {retries} intentos.")
                    with open("errores.txt", "a") as file:
                        file.write(f"{ItemCode} | Error de conexión ocupada en SAP.\n")
                continue  # Intentar nuevamente

            # Otro error desconocido
            else:
                print(f"❌ Error ItemCode {ItemCode}. Código: {response.status_code} | Respuesta: {response.text}")
                with open("errores.txt", "a") as file:
                    file.write(f"{ItemCode} | Código: {response.status_code} | Respuesta: {response.text}\n")
                return
        
        except requests.exceptions.ReadTimeout:
            print(f"⏳ Timeout en ItemCode {ItemCode}. Intento {attempt} de {retries}.")
            if attempt < retries:
                time.sleep(5)  # Esperar antes de reintentar
            else:
                print(f"🚫 ItemCode {ItemCode} falló por timeout tras {retries} intentos.")
                with open("errores.txt", "a") as file:
                    file.write(f"{ItemCode} | Timeout tras {retries} intentos.\n")
        
        except Exception as e:
            print(f"⚠️ Excepción al actualizar ItemCode {ItemCode}: {e}")
            with open("errores.txt", "a") as file:
                file.write(f"{ItemCode} | Excepción: {e}\n")
            return

# === EJECUCIÓN ===

try:
    df = pd.read_excel(EXCEL_PATH, dtype={COLUMN_NAME: str})
except Exception as e:
    print(f"❌ Error al leer el archivo Excel: {e}")
    exit()

if COLUMN_NAME not in df.columns:
    print(f"❌ La columna '{COLUMN_NAME}' no existe en el archivo.")
    exit()

# Preparar lista de ItemCodes como string, eliminar espacios
docentries = df[COLUMN_NAME].dropna().astype(str).str.strip().tolist()

if not docentries:
    print("🚫 No hay datos válidos para procesar.")
    exit()

token = get_token()
if not token:
    print("🚫 No se pudo obtener el token. Proceso abortado.")
    exit()

for ItemCode in docentries:
    patch_ItemCode(ItemCode, token)
    time.sleep(2)  # Esperar 2 segundos entre cada llamada para evitar saturación
print("✅ Proceso completado.")
with open("errores.txt", "a") as file:
    file.write("Proceso completado.\n")