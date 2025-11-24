import pandas as pd
import requests
import json
import time
import os

# === CONFIGURACIÓN GENERAL ===
script_dir = os.path.dirname(os.path.abspath(__file__))

EXCEL_PATH = os.path.join(script_dir, "articulos.xlsx")
ERROR_LOG = os.path.join(script_dir, "errores.txt")

COLUMN_NAME = "articulos"
VALOR_ESTADO = "1"

TOKEN_URL = "http://192.168.5.10:8081/SMA_WEBAPI_WMS/WS/Services/Token"
PATCH_BASE_URL = "http://192.168.5.10:8081/SMA_WEBAPI_WMS/WS/Services/Items/1/"

USERNAME = "SAPWMS"
PASSWORD = "WMS23X"
GRANT_TYPE = "password"

# === UTILIDADES ===

def log_error(msg: str):
    with open(ERROR_LOG, "a") as f:
        f.write(msg + "\n")

def sleep(seconds: int):
    time.sleep(seconds)

# === TOKEN SERVICE ===

def get_token():
    payload = {
        "grant_type": GRANT_TYPE,
        "username": USERNAME,
        "password": PASSWORD
    }

    try:
        response = requests.post(TOKEN_URL, data=payload, timeout=10)
        response.raise_for_status()

        token = response.json().get("access_token")
        if token:
            print("🔑 Token obtenido correctamente.")
            return token

        print("⚠️ Respuesta sin token.")
        return None

    except Exception as e:
        print(f"❌ Error obteniendo token: {e}")
        log_error(f"TokenError | {e}")
        return None


# === SAP SERVICE ===

def patch_item(ItemCode: str, token: str, retries=3):
    payload = {
        "ItemCode": ItemCode,
        "UserFields": [{"Name": "U_SMA_WMS_EST", "Value": VALOR_ESTADO}]
    }

    url = f"{PATCH_BASE_URL}{ItemCode}"

    for attempt in range(1, retries + 1):

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}"
        }

        try:
            response = requests.patch(url, headers=headers, data=json.dumps(payload), timeout=30)

            if response.ok:
                print(f"   ✔️ Actualizado: {ItemCode}")
                return token

            if response.status_code == 401:
                print(f"   🔒 Token expirado en {ItemCode}. Renovando...")
                token = get_token()
                if not token:
                    log_error(f"{ItemCode} | Token no renovado")
                    return None
                continue

            if response.status_code == 400 and "-2028" in response.text:
                print(f"   🚫 ItemCode {ItemCode} no existe.")
                log_error(f"{ItemCode} | No existe SAP")
                return token

            if response.status_code == 400 and "already connected" in response.text:
                print(f"   🔁 Conexión ocupada (intento {attempt}/{retries})...")
                sleep(5)
                continue

            print(f"   ❌ Error {ItemCode}: {response.status_code} → {response.text}")
            log_error(f"{ItemCode} | {response.status_code} | {response.text}")
            return token

        except requests.exceptions.ReadTimeout:
            print(f"   ⏳ Timeout (intento {attempt}/{retries})...")
            if attempt == retries:
                log_error(f"{ItemCode} | Timeout definitivo")
            sleep(5)

        except Exception as e:
            print(f"   ⚠️ Excepción en {ItemCode}: {e}")
            log_error(f"{ItemCode} | Excepción: {e}")
            return token

    return token


# === EJECUCIÓN PRINCIPAL ===

def main():
    try:
        df = pd.read_excel(EXCEL_PATH, dtype={COLUMN_NAME: str})
    except Exception as e:
        print(f"❌ No se pudo leer Excel: {e}")
        return

    if COLUMN_NAME not in df.columns:
        print(f"❌ Falta la columna '{COLUMN_NAME}' en Excel.")
        return

    items = (
        df[COLUMN_NAME]
        .dropna()
        .astype(str)
        .str.strip()
        .tolist()
    )

    if not items:
        print("🚫 Lista vacía de artículos.")
        return

    total = len(items)
    print(f"\n📦 Total de registros a procesar: {total}\n")

    token = get_token()
    if not token:
        print("❌ No se pudo obtener token inicial.")
        return

    for index, item in enumerate(items, start=1):
        print(f"➡️ Procesando {index}/{total} | ItemCode: {item}")
        token = patch_item(item, token) or token
        sleep(2)

    print("\n✅ Proceso completado.")
    log_error(">>> Proceso completado correctamente <<<")


if __name__ == "__main__":
    main()