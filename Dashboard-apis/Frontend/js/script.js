document.addEventListener("DOMContentLoaded", function () {
  const sidebar = document.getElementById("sidebar");
  const toggleBtn = document.getElementById("toggle-btn");
  const toggleThemeBtn = document.querySelector(".theme-toggle");

  // --- Toggle Sidebar ---
  toggleBtn.addEventListener("click", () => {
    if (window.innerWidth > 768) {
      sidebar.classList.toggle("collapsed");
    } else {
      sidebar.classList.toggle("active");
      document.body.classList.toggle("sidebar-open"); // overlay
    }
    toggleBtn.classList.toggle("active"); // animación hamburguesa → X
  });

  // --- Cierra el sidebar si se hace click fuera (solo mobile) ---
  document.body.addEventListener("click", (e) => {
    if (
      window.innerWidth <= 768 &&
      sidebar.classList.contains("active") &&
      !sidebar.contains(e.target) &&
      !toggleBtn.contains(e.target)
    ) {
      sidebar.classList.remove("active");
      toggleBtn.classList.remove("active");
      document.body.classList.remove("sidebar-open"); // quitar overlay
    }
  });

  // --- Ajusta clases si se cambia el tamaño de pantalla ---
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      sidebar.classList.remove("active");
      toggleBtn.classList.remove("active");
      document.body.classList.remove("sidebar-open"); // 👈 importante
    }
  });

  // --- Toggle Tema Oscuro ---
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    toggleThemeBtn.textContent = "☀️";
  }

  toggleThemeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    if (document.body.classList.contains("dark")) {
      toggleThemeBtn.textContent = "☀️";
      localStorage.setItem("theme", "dark");
    } else {
      toggleThemeBtn.textContent = "🌙";
      localStorage.setItem("theme", "light");
    }
  });
});
