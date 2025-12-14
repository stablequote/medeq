const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');

router.post('/create', orderController.createOrder);
router.get('/list', orderController.getOrders);
router.get('/:id', orderController.getOrderById);
router.put('/:id', orderController.updateOrder);
router.delete('/:id', orderController.deleteOrder);
router.put('/:id/cancel', orderController.cancelOrder);
router.put('/add-to-inventory/:id', orderController.addOrderToInventory);
router.post("/:id/pay", orderController.addPayment);
router.get("/:id/payments", orderController.getOrderPayments);

module.exports = router;