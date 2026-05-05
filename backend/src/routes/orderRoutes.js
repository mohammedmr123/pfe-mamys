const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.post('/', orderController.createOrder);
router.get('/pending', orderController.getPendingOrders);
router.put('/:id/kitchen', orderController.updateKitchenStatus);
router.put('/pay-table/:table_id', orderController.payTableOrders);

module.exports = router;
