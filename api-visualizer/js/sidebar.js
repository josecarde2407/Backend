function toggleSidebar(event) {
    event.stopPropagation();
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("-translate-x-full");
    console.log("Sidebar toggled");
}

function closeSidebar(event) {
    const sidebar = document.getElementById("sidebar");
    if (!sidebar.contains(event.target) && event.target.tagName !== "BUTTON") {
        sidebar.classList.add("-translate-x-full");
        console.log("Sidebar cerrado");
    }
}

document.addEventListener("DOMContentLoaded", function () {
    console.log("sidebar.js se está ejecutando en:", window.location.pathname);

    const sidebar = document.getElementById("sidebar");
    const toggleButton = document.querySelector("button[onclick*='toggleSidebar']");

    if (!sidebar || !toggleButton) {
        console.error("No se encontró el sidebar o el botón.");
        return;
    }

    toggleButton.addEventListener("click", toggleSidebar);
    document.body.addEventListener("click", closeSidebar);
});
