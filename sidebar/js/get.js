document.addEventListener("DOMContentLoaded", function () {
    const getForm = document.getElementById("getForm");
    const resultTable = document.getElementById("resultTable").getElementsByTagName("tbody")[0];
    const statusMessage = document.createElement("p");
    
    document.getElementById("resultContainer").appendChild(statusMessage);

    function getStoredConfig() {
        return JSON.parse(localStorage.getItem("config")) || {};
    }

    function fetchData(param) {
        const config = getStoredConfig();
        const apiUrl = config.apiUrl || "";
        
        if (!apiUrl) {
            statusMessage.innerText = "⚠️ No se ha configurado una URL para la API.";
            statusMessage.style.color = "red";
            return;
        }

        const url = `${apiUrl}?param=${encodeURIComponent(param)}`;

        fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(response => response.json())
        .then(data => {
            resultTable.innerHTML = ""; // Limpiar la tabla antes de mostrar nuevos datos
            if (data.length > 0) {
                data.forEach(item => {
                    const row = resultTable.insertRow();
                    row.insertCell(0).innerText = item.id;
                    row.insertCell(1).innerText = item.name;
                    row.insertCell(2).innerText = item.description;
                });
                statusMessage.innerText = "✅ Datos cargados correctamente.";
                statusMessage.style.color = "green";
            } else {
                statusMessage.innerText = "⚠️ No se encontraron datos.";
                statusMessage.style.color = "orange";
            }
        })
        .catch(error => {
            console.error("Error al obtener los datos:", error);
            statusMessage.innerText = "❌ Error en la consulta.";
            statusMessage.style.color = "red";
        });
    }

    getForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const paramValue = document.getElementById("param").value.trim();
        if (paramValue) {
            fetchData(paramValue);
        } else {
            statusMessage.innerText = "⚠️ Ingrese un parámetro para la consulta.";
            statusMessage.style.color = "red";
        }
    });
});
