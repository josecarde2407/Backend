const fetch = require("node-fetch");

// ⚙️ Configuración WMS
const BASE_URL = "http://192.168.5.10:8081/SMA_WEBAPI_WMS/WS/Services";
const USERNAME = "SAPWMS";
const PASSWORD = "WMS23X";
const DEBUG = true;

async function getToken() {
  const resp = await fetch(`${BASE_URL}/Token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: new URLSearchParams({ grant_type: "password", username: USERNAME, password: PASSWORD }),
  });

  const text = await resp.text();
  let data;
  try { data = JSON.parse(text); } catch { throw new Error(`No se pudo parsear respuesta de token: ${text}`); }

  if (!resp.ok) throw new Error(data.error_description || data.error || `HTTP ${resp.status}`);

  const token = data.access_token || data.token || data.Token;
  if (DEBUG) console.log("✅ Token OK (parcial):", token?.slice(0, 20) + "...[oculto]");
  if (!token) throw new Error("Token vacío");
  return token;
}

async function callWMS(endpoint) {
  const token = await getToken();
  const url = `${BASE_URL}/${endpoint}`;
  if (DEBUG) console.log(`🌐 Llamando a WMS: ${url}`);

  const upstream = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json", "User-Agent": "PostmanRuntime/7.32.2" },
  });

  const raw = await upstream.text();
  if (DEBUG) console.log("📦 Respuesta WMS:", raw);

  try { return { status: upstream.status, json: JSON.parse(raw) }; }
  catch { return { status: upstream.status, text: raw }; }
}

function registerAPIs(app) {
  const endpoints = [
    { route: "/api/FR", wms: "PurchaseInvoices/1/0/1" },
    { route: "/api/OC", wms: "PurchaseOrders/1/0/1" },
    { route: "/api/OT", wms: "ProductionOrders/1/0/1" },
    { route: "/api/ITEMS", wms: "Items/1/0/1" },
    { route: "/api/OV", wms: "Orders/1/0/1" },
    { route: "/api/BP", wms: "BusinessPartners/1/0/1" },
    { route: "/api/LO", wms: "BatchNumberDetail/1/0/1" },
    { route: "/api/NC", wms: "CreditNotes/1/0/1" },
    { route: "/api/DEV", wms: "PurchaseReturnsRequest/1/0/1" },
    // Aquí puedes agregar más endpoints según sea necesario
  ];

  endpoints.forEach(ep => {
    app.get(ep.route, async (_req, res) => {
      try {
        const result = await callWMS(ep.wms);
        if (result.json) res.status(result.status).json(result.json);
        else res.status(result.status).type("text/plain").send(result.text);
      } catch (err) {
        console.error(`❌ ${ep.route} error:`, err);
        res.status(500).json({ ok: false, error: String(err) });
      }
    });
  });
}

module.exports = { registerAPIs }; 