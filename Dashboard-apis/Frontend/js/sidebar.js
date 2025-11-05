// frontend/js/sidebar.js
import { apis } from "./api.js";

export function renderSidebar(currentId, sidebarNav) {
  if (!sidebarNav) return;

  // ⚡ Eliminamos solo APIs (dejamos Dashboard y OtSync fijos)
  sidebarNav.querySelectorAll("li:not([data-label='Dashboard']):not([data-label='OtSync'])").forEach(li => li.remove());

  // ⚡ Insertamos APIs dinámicas
  apis.forEach(api => {
    const li = document.createElement("li");
    li.setAttribute("data-label", api.title);

    li.innerHTML = `
      <a href="api.html?id=${api.id}" class="${api.id === currentId ? "active" : ""}">
        <span class="icon">${api.icon}</span>
        <span class="text">${api.title}</span>
      </a>
    `;

    sidebarNav.appendChild(li);
  });

  // ⚡ Marcar activo (Dashboard u OtSync si corresponde)
  if (!currentId) {
    const currentPath = window.location.pathname.split("/").pop();
    const activeLi = sidebarNav.querySelector(`a[href="${currentPath}"]`)?.parentElement;
    if (activeLi) activeLi.classList.add("active");
  }
}
