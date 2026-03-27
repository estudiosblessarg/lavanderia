const { createOrder, getOrdersForUser, getOrderById, updateOrderState, buildWhatsAppLink } = require('../services/orderService');

async function createNewOrder(req, res) {
  const { clientName, whatsapp, price } = req.body;
  const createdBy = req.user.uid;

  if (!clientName || !whatsapp || !price) {
    console.log('[ORDER] Datos incompletos:', req.body);
    return res.status(400).json({ error: 'clientName, whatsapp y price son obligatorios' });
  }

  try {
    const order = await createOrder({ clientName, whatsapp, price, createdBy });
    return res.status(201).json(order);
  } catch (error) {
    console.error('[ORDER] Error crear pedido:', error.message);
    return res.status(500).json({ error: 'Error al crear pedido' });
  }
}

async function getOrders(req, res) {
  try {
    const orders = await getOrdersForUser(req.user.uid, req.user.role);
    return res.json(orders);
  } catch (error) {
    console.error('[ORDER] Error obtener pedidos:', error.message);
    return res.status(500).json({ error: 'Error al obtener pedidos' });
  }
}

async function changeOrderState(req, res) {
  const { orderId } = req.params;
  const { status } = req.body;
  const allowed = ['sucio', 'proceso', 'listo'];

  if (!allowed.includes(status)) {
    console.log('[ORDER] Estado inválido:', status);
    return res.status(400).json({ error: 'Estado inválido' });
  }

  try {
    const order = await getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    if (req.user.role !== 'admin' && order.createdBy !== req.user.uid) {
      return res.status(403).json({ error: 'No autorizado para cambiar este pedido' });
    }

    const updated = await updateOrderState(orderId, status);
    return res.json(updated);
  } catch (error) {
    console.error('[ORDER] Error cambiar estado:', error.message);
    return res.status(500).json({ error: 'Error al actualizar estado' });
  }
}

async function notifyOrder(req, res) {
  const { orderId } = req.params;
  try {
    const order = await getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    if (req.user.role !== 'admin' && order.createdBy !== req.user.uid) {
      return res.status(403).json({ error: 'No autorizado para notificar este pedido' });
    }

    const whatsappUrl = buildWhatsAppLink(order.whatsapp);
    console.log('[ORDER] Enlace WhatsApp generado:', whatsappUrl);
    return res.json({ whatsappUrl });
  } catch (error) {
    console.error('[ORDER] Error notificar pedido:', error.message);
    return res.status(500).json({ error: 'Error al generar notificación' });
  }
}

module.exports = {
  createNewOrder,
  getOrders,
  changeOrderState,
  notifyOrder
};
