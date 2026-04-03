import { api } from './api.js';

export async function loadEmployeeData(state, setState) {
  const orders = await api('/api/orders');
  setState({ orders: orders || [] });
}

export function renderEmployee(state) {
  return `
    <h2>👷 Panel Empleado</h2>

    <button data-action="newOrder">➕ Nuevo Pedido</button>

    <h3>Pedidos</h3>
    ${state.orders.map(o => `
      <div class="card">
        <strong>${o.clientName}</strong>
        <p>${o.status}</p>
        <p>$${o.price}</p>

        <button data-action="takeOrder" data-id="${o.id}">Tomar</button>
        <button data-action="payOrder" data-id="${o.id}">Cobrar</button>
      </div>
    `).join('')}

    <h3>Caja</h3>
    <button data-action="closeCash">Cerrar Caja</button>
  `;
}
