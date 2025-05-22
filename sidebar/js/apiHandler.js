document.addEventListener("DOMContentLoaded", function () {
    const savedApisTable = document.getElementById("saved-apis");
    const aliasInput = document.getElementById("alias-api");
    const apiInput = document.getElementById("new-api");
    const saveApiButton = document.getElementById("save-api");
    const fetchDataButton = document.getElementById("fetch-data");
    const clearResultsButton = document.getElementById("clear-results");
    const consultaApiInput = document.getElementById("consulta-api-input");
    const resultsBody = document.getElementById("results-body");

    let savedApis = [];

    function loadSavedApis() {
        savedApis = JSON.parse(localStorage.getItem("savedApis")) || [];
        renderSavedApis();
    }

    function renderSavedApis() {
        savedApisTable.innerHTML = "";
        savedApis.forEach((api, Get) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td class="border px-2 py-1 text-center">
                    <input type="radio" name="selected-api" value="${Get}">
                </td>
                <td class="border px-2 py-1">${api.alias}</td>
                <td class="border px-2 py-1">${api.url}</td>
                <td class="border px-2 py-1 text-center">
                    <button class="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600 delete-api" data-Get="${Get}">🗑</button>
                </td>
            `;
            savedApisTable.appendChild(row);
        });

        document.querySelectorAll("input[name='selected-api']").forEach(radio => {
            radio.addEventListener("change", function () {
                const selectedApi = savedApis[this.value];
                consultaApiInput.value = selectedApi.url;
            });
        });

        document.querySelectorAll(".delete-api").forEach(button => {
            button.addEventListener("click", function () {
                const Get = this.getAttribute("data-Get");
                savedApis.splice(Get, 1);
                localStorage.setItem("savedApis", JSON.stringify(savedApis));
                renderSavedApis();
            });
        });
    }

    saveApiButton.addEventListener("click", function () {
        const alias = aliasInput.value.trim();
        const url = apiInput.value.trim();
        
        if (!alias || !url) {
            alert("Alias y URL son obligatorios.");
            return;
        }
        
        if (savedApis.some(api => api.url === url)) {
            alert("Esta API ya está guardada.");
            return;
        }
        
        savedApis.push({ alias, url });
        localStorage.setItem("savedApis", JSON.stringify(savedApis));
        renderSavedApis();
        aliasInput.value = "";
        apiInput.value = "";
    });

    fetchDataButton.addEventListener("click", async function () {
        const url = consultaApiInput.value.trim();
        if (!url) {
            alert("Por favor, ingrese una URL válida.");
            return;
        }
    
        const token = await getToken();
    
        if (!token) {
            alert("No se pudo obtener el token. Verifica la autenticación.");
            return;
        }
    
        fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            renderResults(Array.isArray(data) ? data : [data]);
        })
        .catch(error => {
            console.error("Error al obtener los datos:", error);
            alert("Hubo un error al consultar la API.");
        });
    });

    function renderResults(results) {
        resultsBody.innerHTML = "";

        results.forEach((item, Get) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                
                <td class="border px-4 py-2 text-left"><pre>${JSON.stringify(item, null, 2)}</pre></td>
            `;
            resultsBody.appendChild(row);
        });
    }

    clearResultsButton.addEventListener("click", function () {
        resultsBody.innerHTML = "";
        consultaApiInput.value = "";
        document.querySelectorAll("input[name='selected-api']").forEach(radio => {
            radio.checked = false;
        });
    });

    loadSavedApis();
});
