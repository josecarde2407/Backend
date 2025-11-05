import json
import pandas as pd

# Cambia esta ruta si tu archivo JSON tiene otro nombre o ubicación
archivo_json = "datos.json"

# Cargar JSON
with open(archivo_json, "r", encoding="utf-8") as f:
    datos = json.load(f)

# Verificar que hay contenido en "Result"
if "Result" not in datos or not datos["Result"]:
    print("⚠️ No se encontraron datos en el campo 'Result'")
    exit()

# Procesar registros
filas = []
for entrada in datos["Result"]:
    item = entrada.copy()
    user_fields = item.pop("UserFields", [])

    # Extraer campos personalizados de "UserFields"
    campos_user = {campo["Name"]: campo["Value"] for campo in user_fields}

    # Combinar todos los datos planos con los campos adicionales
    fila_completa = {**item, **campos_user}
    filas.append(fila_completa)

# Convertir a DataFrame
df = pd.DataFrame(filas)

# Opcional: Formatear fechas si lo deseas como texto más legible
columnas_fecha = ["AddmisionDate", "ExpirationDate", "ManufacturingDate"]
for col in columnas_fecha:
    if col in df.columns:
        df[col] = pd.to_datetime(df[col]).dt.date

# Exportar a Excel
nombre_excel = "lotes.xlsx"
df.to_excel(nombre_excel, index=False)

print(f"✅ Archivo '{nombre_excel}' creado con éxito.")
