import json
import os
import pandas as pd

# Directorio del script
script_dir = os.path.dirname(os.path.abspath(__file__))

# Ruta del archivo JSON en la misma carpeta del script
json_path = os.path.join(script_dir, "datos.json")

# Ruta de la carpeta de resultados
excel_dir = os.path.join(script_dir, "excelresult")
os.makedirs(excel_dir, exist_ok=True)

# Ruta del archivo Excel de salida
excel_path = os.path.join(excel_dir, "ordenes_de_fabricacion.xlsx")

# Cargar JSON desde archivo
with open(json_path, "r", encoding="utf-8") as f:
    json_data = json.load(f)

# Obtener resultados
resultados = json_data.get("Result", [])

# Lista para almacenar filas planas
filas = []

for doc in resultados:
    doc_entry = doc.get("AbsoluteEntry")
    doc_num = doc.get("DocumentNumber")
    doc_date = doc.get("PostingDate")
    item_no = doc.get("ItemNo")   # Renombrado para mayor claridad
    comments = doc.get("Remarks")
    status = doc.get("ProductionOrderStatus")

    # Extraer campos de usuario (filtrando vacíos)
    campos_usuario = {
        campo.get("Name"): campo.get("Value")
        for campo in (doc.get("UserFields") or [])
        if campo.get("Name")
    }

    for linea in doc.get("ProductionOrders_Lines", []):
        fila = {
            "DocEntry": doc_entry,
            "DocNum": doc_num,
            "DocDate": doc_date,
            "ItemNo": item_no,
            "Comments": comments,
            "Status": status,
            "LineNum": linea.get("LineNumber"),
            "ItemCode": linea.get("ItemNo"),
            "ItemDescription": linea.get("ItemName"),
            "Quantity": linea.get("PlannedQuantity"),
            "IssuedQuantity": linea.get("IssuedQuantity"),
            "WarehouseCode": linea.get("Warehouse"),
            "StageCode": linea.get("StageCode"),
            "StageName": linea.get("StageName"),
            "AlmacenWMS": linea.get("AlmacenWMS"),
            "MeasureUnit": linea.get("UomCode"),
        }

        # Agregar los campos de usuario
        fila.update(campos_usuario)
        filas.append(fila)

# Validar antes de exportar
if filas:
    df = pd.DataFrame(filas)
    df.to_excel(excel_path, index=False)
    print(f"✅ Excel generado con éxito: {excel_path}")
else:
    print("⚠️ No se encontraron datos en el JSON.")
