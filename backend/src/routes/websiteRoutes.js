const express = require('express');
const router = express.Router();
const websiteController = require('../controllers/websiteController');

// Reviews
router.get('/reviews', websiteController.getAllReviews);
router.post('/reviews', websiteController.createReview);

// Reservations
router.post('/reservations', websiteController.createReservation);

module.exports = router;
