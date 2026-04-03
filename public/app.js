import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';

const API_BASE = "https://saaslavaderia.onrender.com";
const appRoot = document.getElementById('app');

// ================= STATE =================
const state = {
  auth: null,
  user: null,
  profile: null,
  orders: [],
  metrics: null,
  view: 'login',
  loading: false,
  initialized: false,
  menuOpen: false
};

function setState(newState) {
  Object.assign(state, newState);
  renderApp();
}

// ================= HELPERS =================
const isAdmin = () => state.profile?.role === 'admin';
const isEmployee = () => state.profile?.role === 'employee';

// ================= API =================
async function api(path, options = {}) {
  try {
    console.log("API CALL:", path);

    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    let data = {};
    try {
      data = await res.json();
    } catch (_) {
      console.warn("Respuesta sin JSON");
    }

    console.log("API RESPONSE:", res.status, data);

    if (!res.ok) {
      throw new Error(data.message || `Error ${res.status}`);
    }

    return data;

  } catch (e) {
    console.error("API ERROR DETALLADO:", e.message);

    alert(`Error real: ${e.message}`);
    return null; // ⚠️ no rompe la app
  }
}

// ================= AUTH =================
async function login(email, password) {
  if (!email || !password) return alert('Completa email y contraseña');

  try {
    setState({ loading: true });

    const cred = await signInWithEmailAndPassword(state.auth, email, password);

    setState({ user: cred.user });

  } catch (e) {
    alert("Login error: " + e.message);
  } finally {
    setState({ loading: false });
  }
}

async function register(email, password) {
  if (!email || !password) return alert('Completa los campos');
  if (password.length < 6) return alert('Minimo 6 caracteres');

  try {
    setState({ loading: true });

    const cred = await createUserWithEmailAndPassword(state.auth, email, password);

    await api('/api/users/register', {
      method: 'POST',
      body: JSON.stringify({
        email: cred.user.email,
        role: 'employee'
      })
    });

    setState({ user: cred.user });

  } catch (e) {
    alert("Registro error: " + e.message);
  } finally {
    setState({ loading: false });
  }
}

async function logout() {
  await signOut(state.auth);

  setState({
    user: null,
    profile: null,
    orders: [],
    view: 'login'
  });
}

// ================= DATA =================
async function loadProfile() {
  const profile = await api('/api/users/me');

  if (!profile) return;

  setState({ profile });
}

async function loadOrders() {
  const orders = await api('/api/orders');

  if (!orders) return;

  setState({ orders });
}

async function loadMetrics() {
  if (!isAdmin()) return;

  const metrics = await api('/api/metrics');

  if (!metrics) return;

  setState({ metrics });
}

// ================= UI =================
function renderApp() {

  if (!state.initialized) {
    appRoot.innerHTML = `<div class="center"><p>Cargando...</p></div>`;
    return;
  }

  if (!state.user) {
    appRoot.innerHTML = `
      <div class="main">
        ${state.view === 'register' ? renderRegister() : renderLogin()}
      </div>
    `;
    bindGlobalEvents();
    return;
  }

  appRoot.innerHTML = `
    <div class="app-shell">

      <div class="sidebar ${state.menuOpen ? 'open' : ''}">
        <div class="logo">🧺 Lavandería</div>

        <button data-nav="dashboard">🏠 Dashboard</button>
        <button data-nav="orders">📦 Pedidos</button>
        <button data-nav="cash">💰 Caja</button>

        ${isAdmin() ? `<button data-nav="metrics">📊 Métricas</button>` : ''}

        <button data-nav="profile">👤 Perfil</button>
        <button data-action="logout">🚪 Salir</button>
      </div>

      <div class="main">
        <div class="header">
          <button data-action="toggleMenu">☰</button>
          <span>${state.profile?.email || ''}</span>
        </div>

        <div class="content">
          ${renderView()}
        </div>
      </div>
    </div>
  `;

  bindGlobalEvents();
}

// ================= INIT =================
async function init() {
  try {
    console.log("Inicializando app...");

    const configRes = await fetch(`${API_BASE}/api/config`);

    if (!configRes.ok) {
      throw new Error("No se pudo cargar config");
    }

    const config = await configRes.json();

    const app = initializeApp(config);
    const auth = getAuth(app);

    state.auth = auth;

    onAuthStateChanged(auth, async (user) => {
      console.log("Auth changed:", user);

      if (!user) {
        setState({
          user: null,
          initialized: true,
          view: 'login'
        });
        return;
      }

      setState({ user });

      // ⚠️ No rompemos si algo falla
      await loadProfile();
      await loadOrders();
      await loadMetrics();

      setState({
        initialized: true,
        view: 'dashboard'
      });
    });

  } catch (e) {
    console.error("INIT ERROR:", e);
    appRoot.innerHTML = `<p>Error cargando app: ${e.message}</p>`;
  }
}

// ================= EVENTS =================
function bindGlobalEvents() {
  appRoot.onclick = async (e) => {
    const t = e.target;

    if (t.dataset.nav) return setState({ view: t.dataset.nav, menuOpen: false });

    if (t.dataset.action === 'login') {
      await login(
        document.getElementById('email').value,
        document.getElementById('pass').value
      );
    }

    if (t.dataset.action === 'register') {
      await register(
        document.getElementById('email').value,
        document.getElementById('pass').value
      );
    }

    if (t.dataset.action === 'logout') logout();

    if (t.dataset.action === 'toggleMenu') {
      setState({ menuOpen: !state.menuOpen });
    }
  };
}

// ================= SW =================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registrado', reg))
      .catch(err => console.error('Error SW', err));
  });
}

init();
