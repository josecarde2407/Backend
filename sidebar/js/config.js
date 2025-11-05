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

    loginModal.style.display = "flex";
    container.style.filter = "blur(5px)";
    loginUser.focus();

    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const user = loginUser.value.trim();
        const pass = loginPass.value.trim();

        if (user === "admin" && pass === "1234") {
            loginModal.style.display = "none";
            container.style.filter = "none";
            loadStoredConfig();
        } else {
            loginStatus.innerText = "Credenciales incorrectas";
            loginStatus.style.color = "red";
            loginUser.focus();
        }
    });

    togglePassword.addEventListener("click", function () {
        const type = loginPass.getAttribute("type") === "password" ? "text" : "password";
        loginPass.setAttribute("type", type);
        this.classList.toggle("fa-eye-slash");
    });

    cancelBtn.addEventListener("click", function () {
        window.location.href = "../index.html";
    });

    // ==================== BLOQUE DE CONFIGURACIÓN ====================
    const authForm = document.getElementById("authForm");
    if (authForm) {
        const apiUrlInput = document.getElementById("apiUrl");
        const usernameInput = document.getElementById("username");
        const passwordInput = document.getElementById("password");

        function loadStoredConfig() {
            const storedConfig = JSON.parse(localStorage.getItem("config")) || {};
            apiUrlInput.value = storedConfig.tokenUrl || "";
            usernameInput.value = storedConfig.username || "";
            passwordInput.value = storedConfig.password || "";

            updateCurrentConfig();
        }

        function saveConfig() {
            const tokenUrl = apiUrlInput.value.trim(); // ← este input es para token
            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();

            const apiUrl = prompt("🔗 Ingrese la URL base para las consultas GET:", "");

            if (!tokenUrl || !username || !password || !apiUrl) {
                document.getElementById("status").innerText = "❌ Todos los campos son obligatorios.";
                document.getElementById("status").style.color = "red";
                return;
            }

            const configData = {
                tokenUrl,
                username,
                password,
                apiUrl
            };

            localStorage.setItem("config", JSON.stringify(configData));
            updateCurrentConfig();

            document.getElementById("status").innerText = "✅ Configuración guardada correctamente.";
            document.getElementById("status").style.color = "green";

            authForm.reset();
        }

        const togglePasswordConfig = document.getElementById("togglePasswordConfig");
        if (togglePasswordConfig && passwordInput) {
            togglePasswordConfig.addEventListener("click", function () {
                const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
                passwordInput.setAttribute("type", type);
                this.classList.toggle("fa-eye-slash");
            });
        }

        authForm.addEventListener("submit", function (event) {
            event.preventDefault();
            saveConfig();
        });

        loadStoredConfig();
    }

    function updateCurrentConfig() {
        const storedConfig = JSON.parse(localStorage.getItem("config")) || {};
        const currentConfigEl = document.getElementById("currentConfig");
        if (currentConfigEl) {
            currentConfigEl.innerHTML = `<strong>Configuración Actual:</strong>
                <div><em>Token URL:</em> ${storedConfig.tokenUrl || "No definida"}</div>
                <div><em>Usuario:</em> ${storedConfig.username || "No definido"}</div>
                <div><em>API URL:</em> ${storedConfig.apiUrl || "No definida"}</div>`;
        }
    }
});
