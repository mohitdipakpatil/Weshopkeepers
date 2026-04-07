const express = require('express');
const router = express.Router();
const { createPaymentIntent, handleWebhook, createRefund, validateCoupon } = require('../controllers/paymentController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/create-intent', protect, createPaymentIntent);
router.post('/webhook', handleWebhook);
router.post('/refund', protect, admin, createRefund);
router.post('/validate-coupon', protect, validateCoupon);

module.exports = router;
