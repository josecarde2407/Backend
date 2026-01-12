import pandas as pd
import requests
import os
import time

# ================= CONFIGURACIÓN =================
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
EXCEL_PATH = os.path.join(SCRIPT_DIR, "docentry.xlsx")
COLUMN_NAME = "DocEntry"

BASE_URL = "http://192.168.5.7:8200/accuracy/WMS/api/v1/Configuration/OrderSyncWMS"
ID_ALMACEN = "FOOD1"
TIMEOUT = 20  # segundos

# ================= FUNCIONES =================

def sincronizar_orden(numero_orden):
    params = {
        "id_almacen": ID_ALMACEN,
        "numero_orden": numero_orden
    }

    try:
        response = requests.get(BASE_URL, params=params, timeout=TIMEOUT)

        if response.status_code != 200:
            print(f"❌ Orden {numero_orden} | HTTP {response.status_code}")
            return False

        data = response.json()

        if isinstance(data, list) and len(data) > 0 and "message" in data[0]:
            print(f"✅ Orden {numero_orden} | {data[0]['message']}")
            return True
        else:
            print(f"❌ Orden {numero_orden} | Respuesta inválida")
            return False

    except requests.exceptions.Timeout:
        print(f"⏰ Orden {numero_orden} | Timeout")
    except requests.exceptions.ConnectionError:
        print(f"🌐 Orden {numero_orden} | Error de conexión")
    except Exception as e:
        print(f"⚠️ Orden {numero_orden} | Error: {e}")

    return False

# ================= EJECUCIÓN =================

def main():
    print("=== SINCRONIZACIÓN MASIVA DE ÓRDENES WMS ===\n")

    try:
        df = pd.read_excel(EXCEL_PATH)
    except Exception as e:
        print(f"❌ Error leyendo Excel: {e}")
        return

    if COLUMN_NAME not in df.columns:
        print(f"❌ La columna '{COLUMN_NAME}' no existe en el Excel")
        return

    ordenes = df[COLUMN_NAME].dropna().astype(str).tolist()

    print(f"📄 Órdenes encontradas: {len(ordenes)}\n")

    exitos = 0
    errores = 0

    for orden in ordenes:
        ok = sincronizar_orden(orden)
        if ok:
            exitos += 1
        else:
            errores += 1

        time.sleep(0.5)  # evita saturar el API

    print("\n=== RESUMEN ===")
    print(f"✅ Órdenes exitosas: {exitos}")
    print(f"❌ Órdenes con error: {errores}")

if __name__ == "__main__":
    main()
