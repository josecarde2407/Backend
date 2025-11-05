document.addEventListener("DOMContentLoaded", function () {
    const getForm = document.getElementById("getForm");
const resultTable = document.getElementById("resultTable");
const resultTableHead = resultTable.querySelector("thead") || resultTable.createTHead();
const resultTableBody = resultTable.querySelector("tbody") || resultTable.createTBody();
    
    const statusMessage = document.createElement("p");
    document.getElementById("resultContainer").appendChild(statusMessage);

    function showMessage(message, color = "black") {
        statusMessage.innerText = message;
        statusMessage.style.color = color;
    }

    function clearTable() {
        resultTableHead.innerHTML = "";
        resultTableBody.innerHTML = "";
    }

    function getStoredConfig() {
        return JSON.parse(localStorage.getItem("config")) || {};
    }

    async function getToken() {
        const { tokenUrl, username, password } = getStoredConfig();
        if (!tokenUrl || !username || !password) {
            throw new Error("⚠️ Faltan datos para autenticación.");
        }

        const params = new URLSearchParams();
        params.append("grant_type", "password");
        params.append("username", username);
        params.append("password", password);

        const response = await fetch(tokenUrl, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params.toString()
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`❌ Error al obtener token: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        return data.token || data.access_token || null;
    }

    async function fetchData(param) {
        const { apiUrl } = getStoredConfig();
        if (!apiUrl) return showMessage("⚠️ No se ha configurado la URL base para la API.", "red");
        if (!param) return showMessage("⚠️ Ingrese un parámetro para la consulta.", "red");

        const url = `${apiUrl}/${encodeURIComponent(param)}`;
        clearTable();
        showMessage("🔄 Cargando...", "blue");

        try {
            const token = await getToken();
            if (!token) throw new Error("❌ Token no recibido.");

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                let errorMsg = `❌ Error al consultar API: ${response.status}`;
                try {
                    const errorData = await response.json();
                    if (errorData?.Message) {
                        errorMsg += ` - ${errorData.Message}`;
                    } else {
                        const errorText = await response.text();
                        errorMsg += ` - ${errorText}`;
                    }
                } catch {}
                throw new Error(errorMsg);
            }

            const data = await response.json();
            const results = Array.isArray(data) ? data : data.data || [];

            if (results.length === 0) {
                return showMessage("⚠️ No se encontraron resultados.", "orange");
            }

            const keys = Object.keys(results[0]);

            // Crear encabezados dinámicos
            const headerRow = resultTableHead.insertRow();
            keys.forEach(key => {
                const th = document.createElement("th");
                th.textContent = key;
                headerRow.appendChild(th);
            });

            // Crear filas de datos
            results.forEach(item => {
                const row = resultTableBody.insertRow();
                keys.forEach(key => {
                    const cell = row.insertCell();
                    const value = item[key];

                    // Formateo opcional si es objeto
                    if (value && typeof value === "object") {
                        cell.innerText = JSON.stringify(value);
                    } else {
                        cell.innerText = value ?? "-";
                    }
                });
            });

            showMessage("✅ Datos cargados correctamente.", "green");

        } catch (error) {
            console.error(error);
            showMessage(error.message, "red");
        }
    }

    getForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const paramValue = document.getElementById("param").value.trim();
        if (paramValue) {
            fetchData(paramValue);
        } else {
            showMessage("⚠️ Ingrese un parámetro para la consulta.", "red");
        }
    });
});
