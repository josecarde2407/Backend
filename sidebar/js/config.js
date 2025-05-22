document.addEventListener("DOMContentLoaded", function () {
    // ==================== BLOQUE DE LOGIN MODAL ====================
    const loginModal = document.getElementById("loginModal");
    const loginForm = document.getElementById("loginForm");
    const loginStatus = document.getElementById("loginStatus");
    const loginUser = document.getElementById("loginUser");
    const loginPass = document.getElementById("loginPass");
    const togglePassword = document.getElementById("togglePassword");
    const cancelBtn = document.getElementById("cancelBtn");
    const container = document.querySelector(".container");

    // Mostrar el modal y difuminar el fondo
    loginModal.style.display = "flex";
    container.style.filter = "blur(5px)";

    // Enfocar el input de Usuario automáticamente en el modal
    loginUser.focus();

    // Manejo del formulario de login
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const user = loginUser.value.trim();
        const pass = loginPass.value.trim();

        if (user === "admin" && pass === "1234") {
            loginModal.style.display = "none";
            container.style.filter = "none";
            loadStoredConfig(); // Cargar configuración guardada
        } else {
            loginStatus.innerText = "Credenciales incorrectas";
            loginStatus.style.color = "red";
            loginUser.focus();
        }
    });

    // Alternar visibilidad de la contraseña en el modal de login
    togglePassword.addEventListener("click", function () {
        const type = loginPass.getAttribute("type") === "password" ? "text" : "password";
        loginPass.setAttribute("type", type);
        this.classList.toggle("fa-eye-slash");
    });

    // Botón Cancelar: redirige a index.html
    cancelBtn.addEventListener("click", function () {
        window.location.href = "../index.html";
    });

    // ==================== BLOQUE DEL FORMULARIO DE CONFIGURACIÓN ====================
    const authForm = document.getElementById("authForm");
    if (authForm) {
        const apiUrlInput = document.getElementById("apiUrl");
        const grantTypeInput = document.getElementById("grantType");
        const usernameInput = document.getElementById("username");
        const passwordInput = document.getElementById("password");

        // Cargar configuración almacenada en localStorage
        function loadStoredConfig() {
            const storedConfig = JSON.parse(localStorage.getItem("config")) || {};
            apiUrlInput.value = storedConfig.apiUrl || "";
            grantTypeInput.value = storedConfig.grantType || "";
            usernameInput.value = storedConfig.username || "";
            passwordInput.value = storedConfig.password || ""; // Puedes ocultar la contraseña si es necesario

            updateCurrentConfig(); // Actualiza la vista de la configuración actual
        }

        // Guardar configuración en localStorage y limpiar el formulario
        function saveConfig() {
            const configData = {
                apiUrl: apiUrlInput.value.trim(),
                grantType: grantTypeInput.value.trim(),
                username: usernameInput.value.trim(),
                password: passwordInput.value.trim(),
            };
            localStorage.setItem("config", JSON.stringify(configData));
            updateCurrentConfig();

            // Limpiar los campos del formulario
            authForm.reset();

            // Mensaje de éxito
            document.getElementById("status").innerText = "Configuración guardada correctamente.";
            document.getElementById("status").style.color = "green";
        }

        // Cargar configuración al iniciar la página
        loadStoredConfig();

        // Alternar visibilidad de la contraseña
        const togglePasswordConfig = document.getElementById("togglePasswordConfig");
        if (togglePasswordConfig && passwordInput) {
            togglePasswordConfig.addEventListener("click", function () {
                const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
                passwordInput.setAttribute("type", type);
                this.classList.toggle("fa-eye-slash");
            });
        }

        // Guardar configuración al enviar el formulario
        authForm.addEventListener("submit", function (event) {
            event.preventDefault();
            saveConfig();
        });
    }

    // ==================== BLOQUE: Mostrar Configuración Actual ====================
    function updateCurrentConfig() {
        const storedConfig = JSON.parse(localStorage.getItem("config")) || {};
        const currentConfigEl = document.getElementById("currentConfig");
        if (currentConfigEl) {
            currentConfigEl.innerHTML = `<strong>Configuración Actual:</strong>
                <div><em>API:</em> ${storedConfig.apiUrl || "No definida"}</div>
                <div><em>Grant Type:</em> ${storedConfig.grantType || "No definido"}</div>
                <div><em>Usuario:</em> ${storedConfig.username || "No definido"}</div>`;
        }
    }
});

