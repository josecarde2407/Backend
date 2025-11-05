// frontend/js/table.js

let table;
let cachedRows = [];

// === EXPANSOR DINÁMICO ===
function expandDocuments(data) {
  const filas = [];

  (data || []).forEach(doc => {
    // 1. Extraer campos de cabecera simples
    const baseFields = {};
    for (const key in doc) {
      const val = doc[key];
      if (typeof val !== "object" || val === null) {
        baseFields[key] = val;
      }
    }

    // 2. Extraer userFields
    const userFields = {};
    if (Array.isArray(doc.UserFields)) {
      doc.UserFields.forEach(f => {
        userFields[f.Name] = f.Value;
      });
    } else if (typeof doc.UserFields === "object" && doc.UserFields !== null) {
      Object.assign(userFields, doc.UserFields);
    }

    // 3. Expandir DocumentLines si existen
    if (Array.isArray(doc.DocumentLines) && doc.DocumentLines.length) {
      doc.DocumentLines.forEach(line => {
        const fila = { ...baseFields, ...userFields };
        for (const key in line) {
          const val = line[key];
          if (typeof val !== "object") {
            fila[key] = val;
          } else {
            Object.keys(val).forEach(subKey => {
              fila[`${key}_${subKey}`] = val[subKey];
            });
          }
        }
        filas.push(fila);
      });
    } else {
      // 4. Si no hay DocumentLines, solo cabecera + userFields
      filas.push({ ...baseFields, ...userFields });
    }
  });

  return filas;
}

// === LOAD DATA ===
export async function loadData(api) {
  if (!api) return [];

  if (cachedRows.length) return cachedRows;

  try {
    const res = await fetch(api.endpoint);
    const data = await res.json();

    let rows = [];
    if (Array.isArray(data)) {
      rows = expandDocuments(data);
    } else {
      const arrayKey = Object.keys(data).find(k => Array.isArray(data[k]));
      rows = expandDocuments(data[arrayKey] || [data]);
    }

    cachedRows = rows;
    return rows;
  } catch (err) {
    console.error("❌ Error cargando datos:", err);
    return [];
  }
}

// === RENDER DATATABLE ===
export function renderDataTable(rows, extraOptions = {}) {
  if (!rows.length) return;

  const sample = rows[0];
  const columns = Object.keys(sample).map(key => ({
    title: key,
    data: key
  }));

  const defaultOptions = {
    data: rows,
    columns,
    destroy: true,
    paging: true,
    searching: true,
    ordering: true,
    responsive: true,
    language: {
      url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json"
    }
  };

  // Fusionar las opciones base con las extras (ej. botones)
  table = $("#api-table").DataTable({
    ...defaultOptions,
    ...extraOptions
  });
}
