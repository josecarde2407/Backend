import { apis } from "./api.js";

const sidebarNav = document.querySelector(".sidebar-nav ul");
sidebarNav.innerHTML = "";

// Generamos ítems
apis.forEach(api => {
  const li = document.createElement("li");
  li.setAttribute("data-label", api.title);

  li.innerHTML = `
    <a href="api.html?id=${api.id}">
      <span class="icon">${api.icon}</span>
      <span class="text">${api.title}</span>
    </a>
  `;

  sidebarNav.appendChild(li);
});

// Resaltamos activo
const params = new URLSearchParams(window.location.search);
const currentId = params.get("id");

if (currentId) {
  const activeItem = Array.from(sidebarNav.children).find(li =>
    li.querySelector("a").href.includes(`id=${currentId}`)
  );
  if (activeItem) activeItem.classList.add("active");
} else {
  sidebarNav.children[0]?.classList.add("active");
}
