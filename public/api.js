export const API_BASE = "https://saaslavaderia.onrender.com";

function renderErrorScreen(details) {
  const app = document.getElementById('app');

  app.innerHTML = `
    <div style="
      font-family: monospace;
      padding: 20px;
      background: #0f172a;
      color: #e2e8f0;
      min-height: 100vh;
    ">
      <h1 style="color:#ef4444;">🚨 Error de Conexión</h1>

      <div style="margin-top:20px;">
        <strong>Endpoint:</strong>
        <pre>${details.path}</pre>
      </div>

      <div>
        <strong>Status:</strong>
        <pre>${details.status || 'N/A'}</pre>
      </div>

      <div>
        <strong>Mensaje:</strong>
        <pre>${details.message}</pre>
      </div>

      <div>
        <strong>Respuesta del servidor:</strong>
        <pre style="white-space: pre-wrap;">${details.raw || 'Sin respuesta'}</pre>
      </div>

      <div>
        <strong>Error completo:</strong>
        <pre style="white-space: pre-wrap;">${details.stack || 'Sin stack'}</pre>
      </div>

      <button onclick="location.reload()" style="
        margin-top:20px;
        padding:10px 20px;
        background:#22c55e;
        border:none;
        color:white;
        cursor:pointer;
      ">
        🔄 Reintentar
      </button>
    </div>
  `;
}

export async function api(path, options = {}) {
  try {
    console.log("CALL:", path);

    const res = await fetch(`${API_BASE}${path}`, options);

    const status = res.status;

    const text = await res.text();

    console.log("STATUS:", status);
    console.log("RAW RESPONSE:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("La respuesta no es JSON válido");
    }

    if (!res.ok) {
      throw new Error(data.error || data.message || `Error HTTP ${status}`);
    }

    return data;

  } catch (e) {
    console.error("ERROR REAL:", e);

    renderErrorScreen({
      path: `${API_BASE}${path}`,
      status: e.status || 'FETCH ERROR',
      message: e.message,
      raw: e.raw || 'No disponible',
      stack: e.stack
    });

    return null;
  }
        }
