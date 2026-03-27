const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { createNewOrder, getOrders, changeOrderState, notifyOrder } = require('../controllers/orderController');
const router = express.Router();

router.use(authMiddleware);
router.get('/', getOrders);
router.post('/', createNewOrder);
router.patch('/:orderId/state', changeOrderState);
router.post('/:orderId/notify', notifyOrder);

module.exports = router;
