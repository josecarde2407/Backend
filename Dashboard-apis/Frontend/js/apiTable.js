// frontend/js/apiTable.js
import { apis } from "./api.js";
import { renderSidebar } from "./sidebar.js";
import { loadData, renderDataTable } from "./table.js";
import { exportJSON, exportCSV } from "./export.js";

const params = new URLSearchParams(window.location.search);
const apiId = params.get("id");
const api = apis.find(a => a.id === apiId);

const titleEl = document.getElementById("api-title");
const sidebarLinks = document.getElementById("sidebar-links");
const toggleBtn = document.getElementById("toggle-btn");
const sidebar = document.getElementById("sidebar");
const content = document.querySelector(".content");

titleEl.textContent = api ? `Datos de ${api.title}` : "API no encontrada";

// Sidebar
renderSidebar(apiId, sidebarLinks);

// Toggle sidebar
toggleBtn.addEventListener("click", () => {
  sidebar.classList.toggle("active");
  content.classList.toggle("content-shift");
});

// Cerrar sidebar si se hace click fuera
document.body.addEventListener("click", e => {
  if (!sidebar.contains(e.target) && sidebar.classList.contains("active") && !toggleBtn.contains(e.target)) {
    sidebar.classList.remove("active");
    content.classList.remove("content-shift");
  }
});

// Render tabla
loadData(api).then(rows => renderDataTable(rows));

// Exportaciones
document.getElementById("btn-export-json").addEventListener("click", () => exportJSON(api));
document.getElementById("btn-export-excel").addEventListener("click", () => exportCSV(api));
