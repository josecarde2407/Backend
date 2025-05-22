document.addEventListener("DOMContentLoaded", function () {
    const sidebar = document.getElementById("sidebar");
    const content = document.getElementById("content");
    const toggleBtn = document.querySelector(".toggle-btn");
    const menuItems = document.querySelectorAll(".menu-item > a");

    function toggleSidebar(event) {
        event.stopPropagation();
        sidebar.classList.toggle("active");
        content.classList.toggle("content-shift");

        if (!sidebar.classList.contains("active")) {
            document.querySelectorAll(".submenu").forEach(submenu => {
                submenu.classList.remove("open");
            });
        }
    }

    function closeSidebar(event) {
        const sidebar = document.getElementById("sidebar");
        const content = document.getElementById("content");

        if (!sidebar.contains(event.target) && sidebar.classList.contains("active")) {
            sidebar.classList.remove("active");
            content.classList.remove("content-shift");

            document.querySelectorAll(".submenu").forEach(submenu => {
                submenu.classList.remove("open");
            });
        }
    }
    
    console.log("script.js cargado correctamente");

    function toggleSubmenu(event, url) {
        event.preventDefault();
        event.stopPropagation();

        // Solo permitir la navegación si el sidebar está abierto
        if (sidebar.classList.contains("active")) {
            window.location.href = url;
        }
    }

    toggleBtn.addEventListener("click", toggleSidebar);
    document.body.addEventListener("click", closeSidebar);

    menuItems.forEach(item => {
        item.addEventListener("click", function (event) {
            // Se obtiene la URL desde el atributo "href"
            const url = this.getAttribute("href");
            if (url) {
                toggleSubmenu(event, url);
            }
        });
    });
});



