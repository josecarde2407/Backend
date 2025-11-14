//import { cache } from "react";
import { apis } from "./api.js";
import { renderSidebar } from "./sidebar.js";
const cardsContainer = document.getElementById("cards-container");
const btnRefresh = document.getElementById("btn-refresh");
const lblUltimaAct = document.getElementById("lbl-ultima-act");
const msg = document.getElementById("msg");
const sidebarLinks = document.getElementById("sidebar-links");

renderSidebar(null, sidebarLinks); // index no tiene apiId

async function fetchData(api) {
  try {
    const res = await fetch(api.endpoint, {
      cache: "no-store"
    });

    if (!res.ok) throw new Error(`Error ${res.status}`);
    const data = await res.json();

    // 👀 Log para inspeccionar la respuesta
    console.log(`📌 Respuesta de ${api.title}:`, data);

    // Detectamos si es array directo o si viene dentro de un objeto
    let cantidad = 0;
    if (Array.isArray(data)) {
      cantidad = data.length;
    } else if (data && typeof data === "object") {
      // buscamos si tiene alguna propiedad tipo array
      const claves = Object.keys(data);
      const arrayKey = claves.find(k => Array.isArray(data[k]));
      if (arrayKey) {
        cantidad = data[arrayKey].length;
      } else {
        cantidad = 1; // al menos un objeto
      }
    }

    return { title: api.title, cantidad };
  } catch (error) {
    console.error(`❌ Error en ${api.title}:`, error);
    return { title: api.title, cantidad: "Error" };
  }
}
// 🔹 Actualizar solo una card individual
async function updateSingleCard(api, card) {
  card.classList.add("loading");
  const cantidadEl = card.querySelector(".cantidad");
  const labelEl = card.querySelector(".update-label");

  cantidadEl.textContent = "⏳";

  const result = await fetchData(api);

  if (typeof result.cantidad === "number") {
    animateCount(cantidadEl, result.cantidad);
  } else {
    cantidadEl.textContent = result.cantidad;
  }

  // ⏱ actualizar label de la card
  const fecha = new Date();
  const hora = fecha.toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
  });

  labelEl.textContent = `Actualizado: ${hora}`;

  card.classList.remove("loading");
}


function renderCards(resultados) {
  cardsContainer.innerHTML = ""; // limpiar antes de renderizar

  resultados.forEach((r, index) => {
    const api = apis[index]; // 🧩 relación entre card y API

    const card = document.createElement("div");
    card.className = "card";
    card.setAttribute("data-api", api.id); // 🧩 atributo para identificar la API

    card.innerHTML = `
      <h3>${r.title}</h3>
      <p class="cantidad">0</p>
      <span class="update-label">Actualizado: --</span>
    `;

    // 🔹 EVENTO CLICK PARA CONSULTAR SOLO ESA API
  card.addEventListener("click", () => updateSingleCard(api, card));

    cardsContainer.appendChild(card);
    
    // Animar número
    const cantidadEl = card.querySelector(".cantidad");
    if (typeof r.cantidad === "number") {
      animateCount(cantidadEl, r.cantidad);
    } else {
      cantidadEl.textContent = r.cantidad; // en caso de error
    }
  });
}
// 🔹 Animar conteo de números en cards
function animateCount(element, target) {
  let current = 0;
  const increment = Math.max(1, Math.ceil(target / 50)); // 🔹 mínimo 1
  const interval = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(interval);
    }
    element.textContent = current;
  }, 20);
}

async function actualizarDashboard() {
  msg.textContent = "🔄 Consultando APIs...";
  const resultados = await Promise.all(apis.map(api => fetchData(api)));
  renderCards(resultados);
  msg.textContent = "✅ Datos actualizados correctamente";

  // ⏱ Actualizar hora última actualización
  const ahora = new Date();
  const hora = ahora.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  lblUltimaAct.textContent = `Última actualización: ${hora}`;
}


// Inicializar
document.addEventListener("DOMContentLoaded", () => {
  msg.textContent = "🔄 Cargando datos...";
  actualizarDashboard();
});

btnRefresh.addEventListener("click", actualizarDashboard); // <--- vuelve a añadir esto