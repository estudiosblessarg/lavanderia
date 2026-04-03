import { api } from './api.js';

export async function loadAdminData(state, setState) {
  const [orders, metrics] = await Promise.all([
    api('/api/orders'),
    api('/api/metrics')
  ]);

  setState({ orders: orders || [], metrics: metrics || {} });
}

export function renderAdmin(state) {
  return `
    <h2>📊 Panel Administrador</h2>

    <div class="cards">
      <div class="card">Hoy: $${state.metrics?.daily || 0}</div>
      <div class="card">Semana: $${state.metrics?.weekly || 0}</div>
      <div class="card">Mes: $${state.metrics?.monthly || 0}</div>
      <div class="card">Año: $${state.metrics?.yearly || 0}</div>
    </div>

    <h3>Pedidos</h3>
    ${state.orders.map(o => `
      <div class="card">
        <strong>${o.clientName}</strong>
        <p>${o.status}</p>
        <p>$${o.price}</p>

        <button data-action="cancelOrder" data-id="${o.id}">❌ Cancelar</button>
        <button data-action="viewOrder" data-id="${o.id}">🔍 Ver</button>
      </div>
    `).join('')}
  `;
}
