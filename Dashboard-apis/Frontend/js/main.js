import { apis } from "./api.js";

const cardsContainer = document.getElementById("cards-container");
const btnRefresh = document.getElementById("btn-refresh");
const msg = document.getElementById("msg");

async function fetchData(api) {
  try {
    const res = await fetch(api.endpoint);
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

function renderCards(resultados) {
  cardsContainer.innerHTML = ""; // limpiar antes de renderizar

  resultados.forEach(r => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h3>${r.title}</h3>
      <p class="cantidad">0</p>
    `;

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
}

// Inicializar
document.addEventListener("DOMContentLoaded", () => {
  msg.textContent = "🔄 Cargando datos...";
  actualizarDashboard();
});

btnRefresh.addEventListener("click", actualizarDashboard);