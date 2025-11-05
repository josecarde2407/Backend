import os
import json
import pandas as pd

# Directorio del script
script_dir = os.path.dirname(os.path.abspath(__file__))

# Ruta del archivo JSON en la misma carpeta del script
json_path = os.path.join(script_dir, "datos.json")

# Ruta de la carpeta de resultados
excel_dir = os.path.join(script_dir, "excelresult")
os.makedirs(excel_dir, exist_ok=True)  # Crea la carpeta si no existe

# Ruta del archivo Excel de salida
excel_path = os.path.join(excel_dir, "ordenes_de_compra.xlsx")

# Cargar JSON desde archivo
with open(json_path, "r", encoding="utf-8") as f:
    json_data = json.load(f)

# Obtener resultados
resultados = json_data.get("Result", [])

# Lista para almacenar filas planas
filas = []

for doc in resultados:
    doc_entry = doc.get("DocEntry")
    doc_num = doc.get("DocNum")
    doc_date = doc.get("DocDate")
    doc_due_date = doc.get("DocDueDate")
    card_code = doc.get("CardCode")
    num_at_card = doc.get("NumAtCard")
    comments = doc.get("Comments")
    tax_date = doc.get("TaxDate")
    status = doc.get("Status")
    canceled = doc.get("CANCELED")

    # Extraer campos de usuario
    campos_usuario = {campo["Name"]: campo["Value"] for campo in doc.get("UserFields", [])}

    for linea in doc.get("DocumentLines", []):
        fila = {
            "DocEntry": doc_entry,
            "DocNum": doc_num,
            "DocDate": doc_date,
            "DocDueDate": doc_due_date,
            "CardCode": card_code,
            "NumAtCard": num_at_card,
            "Comments": comments,
            "TaxDate": tax_date,
            "Status": status,
            "Canceled": canceled,
            "LineNum": linea.get("LineNum"),
            "ItemCode": linea.get("ItemCode"),
            "ItemDescription": linea.get("ItemDescription"),
            "Quantity": linea.get("Quantity"),
            "ShipDate": linea.get("ShipDate"),
            "Price": linea.get("Price"),
            "WarehouseCode": linea.get("WarehouseCode"),
            "UseBaseUnits": linea.get("UseBaseUnits"),
            "TaxCode": linea.get("TaxCode"),
            "LinManClsd": linea.get("LinManClsd"),
            "MeasureUnit": linea.get("MeasureUnit"),
            "MeasureUnit2": linea.get("MeasureUnit2"),
            "LineStatus": linea.get("LineStatus"),
            "UomCode": linea.get("UomCode"),
            "UomCode2": linea.get("UomCode2"),
            "OpenCreQty": linea.get("OpenCreQty"),
            "AlmacenWMS": linea.get("AlmacenWMS")
        }

        # Agregar los campos de usuario del documento
        fila.update(campos_usuario)

        filas.append(fila)

# Convertir a DataFrame y exportar
df = pd.DataFrame(filas)
df.to_excel(excel_path, index=False)

print(f"✅ Excel generado con éxito: {excel_path}")
