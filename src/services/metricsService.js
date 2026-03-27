const { db, admin } = require('../config/firebase');

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeek(date) {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfYear(date) {
  return new Date(date.getFullYear(), 0, 1);
}

function buildMetrics(orders) {
  const now = new Date();
  const dailyStart = startOfDay(new Date(now));
  const weeklyStart = startOfWeek(new Date(now));
  const monthlyStart = startOfMonth(new Date(now));
  const annualStart = startOfYear(new Date(now));

  const metrics = {
    ingresos: {
      diario: 0,
      semanal: 0,
      mensual: 0,
      anual: 0
    },
    cantidadPedidos: orders.length
  };

  orders.forEach((order) => {
    const createdAt = order.createdAt && order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
    const amount = Number(order.price) || 0;

    if (createdAt >= dailyStart) metrics.ingresos.diario += amount;
    if (createdAt >= weeklyStart) metrics.ingresos.semanal += amount;
    if (createdAt >= monthlyStart) metrics.ingresos.mensual += amount;
    if (createdAt >= annualStart) metrics.ingresos.anual += amount;
  });

  return metrics;
}

async function computeMetrics() {
  const snapshot = await db.collection('orders').get();
  const orders = snapshot.docs.map((doc) => doc.data());
  return buildMetrics(orders);
}

module.exports = {
  computeMetrics
};
