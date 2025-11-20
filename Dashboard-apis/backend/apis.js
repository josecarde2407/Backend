const fetch = require("node-fetch");

// ⚙️ Configuración WMS
const BASE_URL = process.env.BASE_URL;
const USERNAME = process.env.USER_NAME;
const PASSWORD = process.env.PASS_WORD;
const DEBUG = process.env.NODE_ENV !== "production";
//console.log("🔍 BASE_URL:", BASE_URL);

// Variables internas para caché
let cachedToken = null;
let tokenExpiresAt = 0; // timestamp en ms

async function getToken() {
  const now = Date.now();

  // ⏳ Si el token aún es válido → reutilizar
  if (cachedToken && now < tokenExpiresAt) {
    if (DEBUG) console.log("🔁 Reutilizando token en caché");
    return cachedToken;
  }

  // ❌ Token venció o no existe → solicitar uno nuevo
  if (DEBUG) console.log("🔐 Token expirado. Solicitando uno nuevo...");

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
  if (!token) throw new Error("Token vacío");

   // ⏱️ Guardar token nuevo
  cachedToken = token; 

  // 30 segundos de duración - recomendamos restar 2s como margen
  tokenExpiresAt = now + (30 * 1000) - 2000;

  if (DEBUG) console.log("✅ Token OK y guardado en caché:", token?.slice(0, 20) + "...[oculto]");
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