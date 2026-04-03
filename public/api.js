export const API_BASE = "https://saaslavaderia.onrender.com";

async function api(path, options = {}) {
  try {
    console.log("CALL:", path);

    const res = await fetch(`${API_BASE}${path}`, options);

    console.log("STATUS:", res.status);

    const text = await res.text();
    console.log("RAW RESPONSE:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("Respuesta no es JSON");
    }

    if (!res.ok) {
      throw new Error(data.error || data.message || "Error desconocido");
    }

    return data;

  } catch (e) {
    console.error("ERROR REAL:", e);
    alert("ERROR REAL: " + e.message);
    return null;
  }
}
