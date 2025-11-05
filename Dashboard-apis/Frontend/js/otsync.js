const btn = document.getElementById('syncBtn');
const input = document.getElementById('orderInput');
const popup = document.getElementById('popup');
const popupContent = document.getElementById('popupContent');

// Función para abrir popup
function showPopup(message) {
  popupContent.innerHTML = message;
  popup.style.display = "flex";
}

// Función para cerrar popup, limpiar input y enfocar
function closePopup() {
  popup.style.display = "none";
  input.value = "";
  input.focus();
  btn.disabled = true; // volver a deshabilitar hasta que escriba algo
}

// Habilitar/deshabilitar botón según input
input.addEventListener('input', () => {
  btn.disabled = input.value.trim() === "";
});

// Evento botón
btn.addEventListener('click', async () => {
  const numeroOrden = input.value.trim();
  if (!numeroOrden) {
    showPopup("<p class='error'>⚠️ Ingrese un número de orden.</p>");
    return;
  }

  showPopup("<p class='loading'>⏳ Sincronizando orden...</p>");

  try {
    // Llamada al API real
    const response = await fetch(
      `http://192.168.5.7:8200/accuracy/WMS/api/v1/Configuration/OrderSyncWMS?id_almacen=FOOD1&numero_orden=${numeroOrden}`
    );

    if (!response.ok) {
      throw new Error("Respuesta no válida del servidor");
    }

    const data = await response.json();

    // Verificamos si es un array con message
    if (Array.isArray(data) && data.length > 0 && data[0].message) {
      showPopup(`
          <h2>Resultado de Sincronización</h2>
          <p class="order">Orden: ${numeroOrden}</p>
          <div class="message">${data[0].message}</div>
  `);
    } else {
      showPopup("<p class='error'>❌ No se recibió un mensaje válido del servidor.</p>");
    }
  } catch (error) {
    showPopup("<p class='error'>❌ Error al sincronizar la orden.</p>");
  }
});

// Cerrar popup al hacer click afuera
popup.addEventListener('click', (e) => {
  if (e.target === popup) {
    closePopup();
  }
});

// Cerrar popup al presionar Enter o Escape
document.addEventListener('keydown', (e) => {
  if (popup.style.display === "flex" && (e.key === "Enter" || e.key === "Escape")) {
    closePopup();
  }
});

// Mantener focus inicial en el input y deshabilitar botón
window.onload = () => {
  input.focus();
  btn.disabled = true;
};
