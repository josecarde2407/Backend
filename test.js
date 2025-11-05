async function getToken() {
  try {
    const response = await fetch("http://192.168.5.10:8081/SMA_WEBAPI_WMS/WS/Services/Token", {
      method: "POST",
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
      },
      body: new URLSearchParams({
        grant_type: "password",
        username: "SAPWMS",
        password: "WMS23X"
      })
    });

    if (!response.ok) {
      throw new Error(`Error al obtener token: ${response.status}`);
    }

    const data = await response.json();
    console.log("🔑 Token obtenido:", data.access_token);

    return data.access_token;

  } catch (error) {
    console.error("❌ Error en login:", error);
    return null;
  }
}

async function getInvoices() {
  const token = await getToken();
  if (!token) return;

  try {
    const response = await fetch("http://192.168.5.10:8081/SMA_WEBAPI_WMS/WS/Services/PurchaseInvoices/1/0/1", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json"
      }
    });

    const text = await response.text(); // primero crudo para ver qué responde
    console.log("📦 Respuesta Invoices:\n", text);

  } catch (error) {
    console.error("❌ Error en consulta de facturas:", error);
  }
}

getInvoices();
