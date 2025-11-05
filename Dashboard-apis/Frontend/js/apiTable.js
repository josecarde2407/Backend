import { apis } from "./api.js";

const params = new URLSearchParams(window.location.search);
const apiId = params.get("id"); // Usamos "id" como query param
const api = apis.find(a => a.id === apiId);

const titleEl = document.getElementById("api-title");
const tableHead = document.querySelector("#api-table thead");
const tableBody = document.querySelector("#api-table tbody");
const sidebarLinks = document.getElementById("sidebar-links");
const toggleBtn = document.getElementById("toggleBtn");
const sidebar = document.getElementById("sidebar");
const content = document.querySelector(".main-content");

titleEl.textContent = api ? `Datos de ${api.title}` : "API no encontrada";

// Renderizamos todas las APIs en el sidebar
function renderSidebar() {
  apis.forEach(a => {
    // Evitamos duplicar el enlace del dashboard
    if (a.id !== apiId) {
      const li = document.createElement("li");
      li.innerHTML = `
        <a href="api.html?id=${a.id}">
          <span class="icon">${a.icon}</span>
          <span class="text">${a.title}</span>
        </a>
      `;
      sidebarLinks.appendChild(li);
    }
  });
}

// Toggle sidebar
toggleBtn.addEventListener("click", () => {
  sidebar.classList.toggle("active");
  content.classList.toggle("content-shift");
});

// Cerrar sidebar al hacer click fuera
document.body.addEventListener("click", (e) => {
  if (!sidebar.contains(e.target) && sidebar.classList.contains("active")) {
    sidebar.classList.remove("active");
    content.classList.remove("content-shift");
  }
});

// Cargar datos de la API
async function loadData() {
  if (!api) return;
  try {
    const res = await fetch(api.endpoint);
    const data = await res.json();

    let rows = [];
    if (Array.isArray(data)) {
      rows = data;
    } else {
      const arrayKey = Object.keys(data).find(k => Array.isArray(data[k]));
      rows = arrayKey ? data[arrayKey] : [data];
    }

    renderTable(rows);
    return rows;
  } catch (err) {
    console.error("❌ Error cargando datos:", err);
  }
}

// Render tabla
function renderTable(rows) {
  if (!rows.length) return;

  tableHead.innerHTML = "<tr>" + Object.keys(rows[0]).map(k => `<th>${k}</th>`).join("") + "</tr>";
  tableBody.innerHTML = rows.map(r =>
    "<tr>" + Object.values(r).map(v => `<td>${v}</td>`).join("") + "</tr>"
  ).join("");
}

// Export JSON
document.getElementById("btn-export-json").addEventListener("click", async () => {
  const rows = await loadData();
  const blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${api.title}.json`;
  link.click();
});

// Export Excel (CSV)
document.getElementById("btn-export-excel").addEventListener("click", async () => {
  const rows = await loadData();
  if (!rows.length) return;
  const headers = Object.keys(rows[0]).join(",");
  const csv = rows.map(r => Object.values(r).join(",")).join("\n");
  const blob = new Blob([headers + "\n" + csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${api.title}.csv`;
  link.click();
});

// Ejecutar
renderSidebar();
loadData();
