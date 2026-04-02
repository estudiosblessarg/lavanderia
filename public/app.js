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
    const token = state.user ? await state.user.getIdToken() : null;

    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });

    let data = {};
    try { data = await res.json(); } catch (_) {}

    if (!res.ok) throw new Error(data.message || 'Error API');

    return data;
  } catch (e) {
    console.error("API ERROR:", e);
    alert("Error de conexión con el servidor");
    throw e;
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
    alert(e.message);
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
      body: JSON.stringify({ email: cred.user.email, role: 'employee' })
    });

    setState({ user: cred.user });

  } catch (e) {
    alert(e.message);
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
  setState({ profile });
}

async function loadOrders() {
  const orders = await api('/api/orders');
  setState({ orders });
}

async function loadMetrics() {
  if (!isAdmin()) return;
  const metrics = await api('/api/metrics');
  setState({ metrics });
}

// ================= UI =================
function renderApp() {

  // LOADING
  if (!state.initialized) {
    appRoot.innerHTML = `<div class="center"><p>Cargando...</p></div>`;
    return;
  }

  // LOGIN / REGISTER
  if (!state.user) {
    appRoot.innerHTML = `
      <div class="main">
        ${state.view === 'register' ? renderRegister() : renderLogin()}
      </div>
    `;
    bindGlobalEvents();
    return;
  }

  // APP
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

// ================= AUTH VIEWS =================
function renderLogin() {
  return `
    <h2>Iniciar Sesión</h2>
    <form>
      <div class="form-group">
        <label>Email</label>
        <input type="email" id="email" />
      </div>
      <div class="form-group">
        <label>Contraseña</label>
        <input type="password" id="pass" />
      </div>
      <button type="button" data-action="login">Iniciar Sesión</button>
      <p style="margin-top:10px;cursor:pointer" data-nav="register">Crear cuenta</p>
    </form>
  `;
}

function renderRegister() {
  return `
    <h2>Registrarse</h2>
    <form>
      <div class="form-group">
        <label>Email</label>
        <input type="email" id="email" />
      </div>
      <div class="form-group">
        <label>Contraseña</label>
        <input type="password" id="pass" />
      </div>
      <button type="button" data-action="register">Registrarse</button>
      <p style="margin-top:10px;cursor:pointer" data-nav="login">Volver</p>
    </form>
  `;
}

// ================= VIEWS =================
function renderView() {
  if (state.view === 'orders') return renderOrders();
  if (state.view === 'profile') return renderProfile();
  if (state.view === 'cash') return renderCash();
  if (state.view === 'metrics') return renderMetrics();
  return renderDashboard();
}

// ================= DASHBOARD =================
function renderDashboard() {
  if (isAdmin()) {
    return `
      <h2>Admin Dashboard</h2>
      <div class="cards">
        <div class="card">Pedidos: ${state.orders.length}</div>
        <div class="card">Hoy: $${state.metrics?.daily || 0}</div>
        <div class="card">Semana: $${state.metrics?.weekly || 0}</div>
        <div class="card">Mes: $${state.metrics?.monthly || 0}</div>
      </div>
    `;
  }

  return `
    <h2>Empleado</h2>
    <div class="card">Pedidos activos: ${state.orders.length}</div>
  `;
}

// ================= ORDERS =================
function renderOrders() {
  return `
    <h2>Pedidos</h2>
    ${state.orders.map(o => `
      <div class="card">
        <strong>${o.clientName}</strong>
        <p>${o.status}</p>
        <p>$${o.price}</p>

        ${isEmployee() ? `
          <button data-action="status" data-id="${o.id}" data-status="done">Finalizar</button>
          <button data-action="pay" data-id="${o.id}">Cobrar</button>
        ` : ''}
      </div>
    `).join('')}
  `;
}

// ================= CASH =================
function renderCash() {
  return `
    <h2>Caja</h2>
    ${isAdmin() ? `<button data-action="closeCash">Cerrar Caja</button>` : '<p>Solo visualización</p>'}
  `;
}

// ================= METRICS =================
function renderMetrics() {
  if (!isAdmin()) return '';
  return `
    <h2>Métricas</h2>
    <div class="cards">
      <div class="card">Día: $${state.metrics?.daily}</div>
      <div class="card">Semana: $${state.metrics?.weekly}</div>
      <div class="card">Mes: $${state.metrics?.monthly}</div>
    </div>
  `;
}

// ================= PROFILE =================
function renderProfile() {
  return `
    <h2>Perfil</h2>
    <p>Email: ${state.profile?.email}</p>
    <p>Rol: ${state.profile?.role}</p>

    <input id="newPassword" type="password" placeholder="Nueva contraseña"/>
    <button data-action="updatePassword">Actualizar</button>
  `;
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
    if (t.dataset.action === 'closeCash') alert("Caja cerrada (demo)");

    if (t.dataset.action === 'toggleMenu') {
      setState({ menuOpen: !state.menuOpen });
    }
  };
}

// ================= INIT =================
async function init() {
  try {
    const config = await fetch(`${API_BASE}/api/config`).then(r => r.json());

    const app = initializeApp(config);
    const auth = getAuth(app);

    state.auth = auth;

    onAuthStateChanged(auth, async (user) => {

      if (!user) {
        setState({ user: null, initialized: true, view: 'login' });
        return;
      }

      await user.getIdToken(true);

      setState({ user });

      await loadProfile();
      await loadOrders();
      await loadMetrics();

      setState({ initialized: true, view: 'dashboard' });
    });

  } catch (e) {
    console.error(e);
    appRoot.innerHTML = `<p>Error cargando app</p>`;
  }
}


  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
    
      .then(reg => alert('SW registrado', reg))
      .catch(err => alert('SW error', err));
  });


init();