import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';

import { api } from './api.js';
import { login, register, logout } from './auth.js';
import { renderAdmin, loadAdminData } from './admin.js';
import { renderEmployee, loadEmployeeData } from './employee.js';
import { renderLayout } from './ui.js';

const appRoot = document.getElementById('app');

const state = {
  auth: null,
  user: null,
  profile: null,
  orders: [],
  metrics: {},
  initialized: false
};

function setState(newState) {
  Object.assign(state, newState);
  render();
}

// ================= INIT =================
async function init() {
  const config = await fetch('/api/config').then(r => r.json());

  const app = initializeApp(config);
  const auth = getAuth(app);

  state.auth = auth;

  onAuthStateChanged(auth, async (user) => {

    if (!user) {
      renderLogin();
      return;
    }

    setState({ user });

    const profile = await api('/api/users/me');

    if (!profile) {
      alert("Error perfil");
      return;
    }

    setState({ profile });

    if (profile.role === 'admin') {
      await loadAdminData(state, setState);
    } else {
      await loadEmployeeData(state, setState);
    }

    setState({ initialized: true });
  });
}

// ================= RENDER =================
function render() {
  if (!state.initialized) {
    appRoot.innerHTML = `<p>Cargando...</p>`;
    return;
  }

  let content = '';

  if (state.profile.role === 'admin') {
    content = renderAdmin(state);
  } else {
    content = renderEmployee(state);
  }

  appRoot.innerHTML = renderLayout(content, state.profile);

  bindEvents();
}

// ================= LOGIN =================
function renderLogin() {
  appRoot.innerHTML = `
    <h2>Login</h2>
    <input id="email"/>
    <input id="pass" type="password"/>
    <button id="btnLogin">Entrar</button>
  `;

  document.getElementById('btnLogin').onclick = async () => {
    await login(
      state.auth,
      email.value,
      pass.value
    );
  };
}

// ================= EVENTS =================
function bindEvents() {
  appRoot.onclick = async (e) => {
    const t = e.target;

    if (t.dataset.action === 'logout') {
      logout(state.auth);
    }

    if (t.dataset.action === 'cancelOrder') {
      await api(`/api/orders/${t.dataset.id}/cancel`, { method: 'PUT' });
      location.reload();
    }

    if (t.dataset.action === 'payOrder') {
      await api(`/api/orders/${t.dataset.id}/pay`, { method: 'PUT' });
      location.reload();
    }

    if (t.dataset.action === 'takeOrder') {
      await api(`/api/orders/${t.dataset.id}/take`, { method: 'PUT' });
      location.reload();
    }

    if (t.dataset.action === 'closeCash') {
      await api(`/api/cash/close`, { method: 'POST' });
      alert("Caja cerrada");
    }
  };
}

init();
