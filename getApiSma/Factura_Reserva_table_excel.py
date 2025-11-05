import json
import pandas as pd
import os

# Directorio del script
script_dir = os.path.dirname(os.path.abspath(__file__))

# Rutas
json_path = os.path.join(script_dir, "datos.json")
excel_dir = os.path.join(script_dir, "excelresult")
os.makedirs(excel_dir, exist_ok=True)
excel_path = os.path.join(excel_dir, "facturas_de_reserva.xlsx")

def extraer_campos_usuario(user_fields):
    return {campo["Name"]: campo["Value"] for campo in (user_fields or [])}

def procesar_documento(doc):
    campos_base = {
        "DocEntry": doc.get("DocEntry"),
        "DocNum": doc.get("DocNum"),
        "DocDate": doc.get("DocDate"),
        "DocDueDate": doc.get("DocDueDate"),
        "CardCode": doc.get("CardCode"),
        "NumAtCard": doc.get("NumAtCard"),
        "Comments": doc.get("Comments"),
        "TaxDate": doc.get("TaxDate"),
    }

    campos_usuario = extraer_campos_usuario(doc.get("UserFields"))
    filas = []

    for linea in doc.get("DocumentLines", []):
        fila = {
            **campos_base,
            "LineNum": linea.get("LineNum"),
            "ItemCode": linea.get("ItemCode"),
            "ItemDescription": linea.get("ItemDescription"),
            "Quantity": linea.get("Quantity"),
            "ShipDate": linea.get("ShipDate"),
            "Price": linea.get("Price"),
            "WarehouseCode": linea.get("WarehouseCode"),
            "BaseType": linea.get("BaseType"),
            "BaseEntry": linea.get("BaseEntry"),
            "BaseLine": linea.get("BaseLine"),
            "BaseRef": linea.get("BaseRef"),
            "TaxCode": linea.get("TaxCode"),
            "MeasureUnit": linea.get("MeasureUnit"),
            "MeasureUnit2": linea.get("MeasureUnit2"),
            "UomCode": linea.get("UomCode"),
            "UomCode2": linea.get("UomCode2"),
            "AlmacenWMS": linea.get("AlmacenWMS"),
        }
        fila.update(campos_usuario)
        filas.append(fila)

    return filas

def procesar_documentos(json_data):
    todas_las_filas = []
    for doc in json_data.get("Result", []):
        todas_las_filas.extend(procesar_documento(doc))
    return todas_las_filas

def guardar_excel(filas, nombre_archivo):
    if not filas:
        print("⚠️ No se encontraron datos para exportar.")
        return
    pd.DataFrame(filas).to_excel(nombre_archivo, index=False)
    print(f"✅ Excel generado con éxito: {nombre_archivo}")

if __name__ == "__main__":
    with open(json_path, "r", encoding="utf-8") as f:
        json_data = json.load(f)

    filas = procesar_documentos(json_data)
    guardar_excel(filas, excel_path)
