import pdfplumber 
import csv

# Ruta al archivo PDF
pdf_file = r"C:\Users\jose.cardenas\Downloads\GRE - CARRO 2 - DESTRUCCION PT-ME 07-11-25.pdf"

# Ruta del archivo CSV de salida
csv_file_path = r"C:\Users\jose.cardenas\Downloads\tablas_extraidas.csv"

# Abrir el archivo PDF
with pdfplumber.open(pdf_file) as pdf:
    with open(csv_file_path, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)

        for i, page in enumerate(pdf.pages):
            # Extraer tablas de cada página
            tablas = page.extract_tables()
            for j, tabla in enumerate(tablas):
                print(f"Tabla {j+1} en la página {i+1}:")
                for fila in tabla:
                    print(fila)
                    # Escribir filas en el archivo CSV
                    writer.writerow(fila)
                print("\n")

print(f"✅ Tablas extraídas y guardadas en: {csv_file_path}")
