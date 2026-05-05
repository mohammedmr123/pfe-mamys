const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

router.get('/trend', statsController.getSalesTrend);
router.get('/servers', statsController.getServerPerformance);
router.get('/products', statsController.getTopProducts);
router.get('/payments', statsController.getPaymentStats);
router.get('/summary', statsController.getGlobalSummary);

module.exports = router;
