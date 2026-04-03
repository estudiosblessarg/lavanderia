export const API_BASE = "https://saaslavaderia.onrender.com";

export async function api(path, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || `Error ${res.status}`);
    }

    return data;

  } catch (e) {
    console.error("API ERROR:", e.message);
    return null;
  }
  }
