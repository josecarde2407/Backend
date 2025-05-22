let token = null;
let tokenExpiration = 0;

// 🔹 Función para obtener configuración desde localStorage
function obtenerConfiguracion() {
    return {
        apiUrl: localStorage.getItem("apiUrl") || "http://192.168.5.10:8081/SMA_WEBAPI_WMS/WS/Services/Token",
        grantType: localStorage.getItem("grantType") || "password",
        username: localStorage.getItem("authUsername") || "SAPWMS",
        password: localStorage.getItem("authPassword") || "WMS23X"
    };
}

// 🔹 Función para obtener un nuevo token
async function obtenerToken() {
    try {
        const { apiUrl, grantType, username, password } = obtenerConfiguracion();

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                grant_type: grantType,
                username: username,
                password: password
            })
        });

        const data = await response.json();
        console.log("🔹 Respuesta API (Token):", data);

        if (!response.ok) throw new Error(`Error ${response.status}: ${data.error_description || data.message}`);

        token = data.access_token || data.token || data.Token;
        tokenExpiration = data.expires_in ? Date.now() + (data.expires_in * 1000) : Date.now() + 29000;

        console.log("✅ Token obtenido:", token);
    } catch (error) {
        console.error("⚠️ Error en la autenticación:", error);
    }
}

// 🔹 Función para obtener token actualizado
async function getToken() {
    if (!token || Date.now() > tokenExpiration) {
        await obtenerToken();
    }
    return token;
}

// 🔹 Exponer `getToken()` globalmente
window.getToken = getToken;

// 🔹 Renovar token automáticamente cada 30 segundos
setInterval(obtenerToken, 29000);

// ============================================
// 🔹 Manejo de Login Modal
// ============================================

document.addEventListener("DOMContentLoaded", function () {
    const loginModal = document.getElementById("loginModal");
    const loginForm = document.getElementById("loginForm");
    const loginStatus = document.getElementById("loginStatus");
    const logoutBtn = document.getElementById("logoutBtn");

    // 🔹 Mostrar modal si no está autenticado
    if (localStorage.getItem("auth") !== "true") {
        loginModal.style.display = "flex";
    } else {
        logoutBtn.style.display = "block";
    }

    // 🔹 Manejar el login
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const username = document.getElementById("loginUser").value.trim();
        const password = document.getElementById("loginPass").value.trim();

        // Guardar usuario y contraseña en localStorage
        localStorage.setItem("authUsername", username);
        localStorage.setItem("authPassword", password);

        // Validar usuario temporalmente (luego se puede conectar con la API)
        if (username === "admin" && password === "1234") {
            localStorage.setItem("auth", "true");  
            loginModal.style.display = "none";
            logoutBtn.style.display = "block";
        } else {
            loginStatus.textContent = "⚠️ Usuario o contraseña incorrectos.";
            loginStatus.style.color = "red";
        }
    });

    // 🔹 Cerrar sesión
    logoutBtn.addEventListener("click", function () {
        localStorage.removeItem("auth");
        loginModal.style.display = "flex";
        logoutBtn.style.display = "none";
    });
});
