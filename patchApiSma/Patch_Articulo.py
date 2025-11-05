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
    """Obtiene un nuevo token de acceso."""
    payload = {"grant_type": GRANT_TYPE, "username": USERNAME, "password": PASSWORD}
    try:
        response = requests.post(TOKEN_URL, data=payload, timeout=10)
        response.raise_for_status()
        token = response.json().get("access_token")
        if token:
            print("🔑 Token obtenido correctamente.")
            return token
        else:
            print("⚠️ No se encontró 'access_token' en la respuesta del servidor.")
            return None
    except Exception as e:
        print(f"❌ Error al obtener token: {e}")
        return None


def patch_ItemCode(ItemCode, token, retries=3):
    """Actualiza el campo U_SMA_WMS_EST de un ItemCode en SAP, con renovación de token si expira."""
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

            # ✅ Éxito
            if response.status_code in [200, 202]:
                print(f"✅ ItemCode {ItemCode} actualizado con éxito.")
                return token

            # 🔒 Token expirado o inválido → renovar y reintentar
            elif response.status_code == 401:
                print(f"🔒 Token expirado o no autorizado para ItemCode {ItemCode}. Renovando token...")
                new_token = get_token()
                if new_token:
                    print("🔁 Token renovado. Reintentando operación...")
                    return patch_ItemCode(ItemCode, new_token)  # Reintenta con nuevo token
                else:
                    print("🚫 No se pudo renovar el token. Se aborta este ItemCode.")
                    with open("errores.txt", "a") as file:
                        file.write(f"{ItemCode} | Token expirado y no renovado.\n")
                    return None

            # 🚫 Item no existe
            elif response.status_code == 400 and "-2028" in response.text:
                print(f"🚫 ItemCode {ItemCode} no existe en SAP. Se omite.")
                with open("errores.txt", "a") as file:
                    file.write(f"{ItemCode} | No existe en SAP.\n")
                return token

            # 🔁 Conexión ocupada
            elif response.status_code == 400 and "already connected to a company" in response.text:
                print(f"🔁 Conexión SAP ocupada para {ItemCode}. Intento {attempt} de {retries}.")
                if attempt < retries:
                    time.sleep(5)
                else:
                    print(f"🚫 ItemCode {ItemCode} falló por conexión ocupada tras {retries} intentos.")
                    with open("errores.txt", "a") as file:
                        file.write(f"{ItemCode} | Error conexión ocupada.\n")
                continue

            # ❌ Otro error
            else:
                print(f"❌ Error al actualizar {ItemCode}. Código: {response.status_code} | Respuesta: {response.text}")
                with open("errores.txt", "a") as file:
                    file.write(f"{ItemCode} | Código: {response.status_code} | Respuesta: {response.text}\n")
                return token

        except requests.exceptions.ReadTimeout:
            print(f"⏳ Timeout en ItemCode {ItemCode}. Intento {attempt} de {retries}.")
            if attempt < retries:
                time.sleep(5)
            else:
                print(f"🚫 Timeout definitivo tras {retries} intentos para {ItemCode}.")
                with open("errores.txt", "a") as file:
                    file.write(f"{ItemCode} | Timeout tras {retries} intentos.\n")

        except Exception as e:
            print(f"⚠️ Excepción inesperada para {ItemCode}: {e}")
            with open("errores.txt", "a") as file:
                file.write(f"{ItemCode} | Excepción: {e}\n")
            return token

    return token


# === EJECUCIÓN PRINCIPAL ===

try:
    df = pd.read_excel(EXCEL_PATH, dtype={COLUMN_NAME: str})
except Exception as e:
    print(f"❌ Error al leer el archivo Excel: {e}")
    exit()

if COLUMN_NAME not in df.columns:
    print(f"❌ La columna '{COLUMN_NAME}' no existe en el archivo.")
    exit()

# Limpiar lista de ItemCodes
docentries = df[COLUMN_NAME].dropna().astype(str).str.strip().tolist()

if not docentries:
    print("🚫 No hay datos válidos para procesar.")
    exit()

# Obtener token inicial
token = get_token()
if not token:
    print("🚫 No se pudo obtener el token inicial. Proceso abortado.")
    exit()

# Procesar cada artículo
for ItemCode in docentries:
    token = patch_ItemCode(ItemCode, token) or token
    time.sleep(2)  # Pausa para evitar saturación del servidor

print("✅ Proceso completado.")
with open("errores.txt", "a") as file:
    file.write("Proceso completado correctamente.\n")
