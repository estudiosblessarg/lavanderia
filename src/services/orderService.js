const { db, admin } = require('../config/firebase');

const COUNTER_PATH = 'counters/orders';

function formatOrderId(number) {
  return `LAV-${String(number).padStart(4, '0')}`;
}

async function getNextOrderId() {
  const counterRef = db.doc(COUNTER_PATH);

  const orderId = await db.runTransaction(async (transaction) => {
    const counterDoc = await transaction.get(counterRef);
    let nextNumber = 1;
    if (counterDoc.exists && counterDoc.data().lastOrderNumber) {
      nextNumber = counterDoc.data().lastOrderNumber + 1;
    }
    transaction.set(counterRef, { lastOrderNumber: nextNumber }, { merge: true });
    return formatOrderId(nextNumber);
  });

  return orderId;
}

async function createOrder({ clientName, whatsapp, price, createdBy }) {
  const orderId = await getNextOrderId();
  const newOrder = {
    orderId,
    clientName,
    whatsapp,
    price: Number(price),
    createdBy,
    status: 'sucio',
    notificado: false,
    createdAt: admin.firestore.Timestamp.fromDate(new Date())
  };
  await db.collection('orders').add(newOrder);
  console.log('[ORDER SERVICE] Pedido creado:', orderId);
  return newOrder;
}

async function getOrderById(orderId) {
  const snapshot = await db.collection('orders').where('orderId', '==', orderId).limit(1).get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
}

async function getOrdersForUser(uid, role) {
  if (role === 'admin') {
    const snapshot = await db.collection('orders').orderBy('createdAt', 'desc').get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }
  const snapshot = await db.collection('orders').where('createdBy', '==', uid).orderBy('createdAt', 'desc').get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function updateOrderState(orderId, status) {
  const order = await getOrderById(orderId);
  if (!order) return null;
  const orderRef = db.collection('orders').doc(order.id);
  await orderRef.update({ status });
  console.log('[ORDER SERVICE] Estado actualizado:', orderId, status);
  return { ...order, status };
}

function buildWhatsAppLink(whatsapp) {
  const phone = whatsapp.replace(/[^0-9]/g, '');
  const message = encodeURIComponent('Tu ropa ya está lista para retirar. Atte: Lavandería');
  return `https://wa.me/${phone}?text=${message}`;
}

module.exports = {
  createOrder,
  getOrdersForUser,
  getOrderById,
  updateOrderState,
  buildWhatsAppLink
};
