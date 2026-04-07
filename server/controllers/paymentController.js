const asyncHandler = require('express-async-handler');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');

// POST /api/payment/create-intent
const createPaymentIntent = asyncHandler(async (req, res) => {
  const { amount, currency = 'inr', orderId } = req.body;
  if (!amount || amount < 1) { res.status(400); throw new Error('Invalid amount'); }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency,
    automatic_payment_methods: { enabled: true },
    metadata: { orderId: orderId || '', userId: req.user._id.toString() },
  });

  res.json({ success: true, clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
});

// POST /api/payment/webhook
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object;
      if (pi.metadata.orderId) {
        await Order.findByIdAndUpdate(pi.metadata.orderId, {
          isPaid: true,
          paidAt: new Date(),
          status: 'confirmed',
          'paymentResult.status': 'succeeded',
          'paymentResult.paymentIntentId': pi.id,
          'paymentResult.updateTime': new Date().toISOString(),
        });
      }
      break;
    }
    case 'payment_intent.payment_failed': {
      const pi = event.data.object;
      if (pi.metadata.orderId) {
        await Order.findByIdAndUpdate(pi.metadata.orderId, { status: 'pending', 'paymentResult.status': 'failed' });
      }
      break;
    }
    case 'charge.refunded': {
      const charge = event.data.object;
      if (charge.metadata?.orderId) {
        await Order.findByIdAndUpdate(charge.metadata.orderId, { status: 'refunded' });
      }
      break;
    }
  }
  res.json({ received: true });
};

// POST /api/payment/refund
const createRefund = asyncHandler(async (req, res) => {
  const { orderId, reason = 'requested_by_customer' } = req.body;
  const order = await Order.findById(orderId);
  if (!order) { res.status(404); throw new Error('Order not found'); }
  if (!order.paymentResult?.paymentIntentId) { res.status(400); throw new Error('No payment found for this order'); }

  const refund = await stripe.refunds.create({
    payment_intent: order.paymentResult.paymentIntentId,
    reason,
  });

  order.status = 'refunded';
  await order.save();

  res.json({ success: true, refund });
});

// POST /api/payment/validate-coupon
const validateCoupon = asyncHandler(async (req, res) => {
  const { code, orderAmount } = req.body;
  const Coupon = require('../models/Coupon');
  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon) { res.status(404); throw new Error('Invalid coupon code'); }
  const validity = coupon.isValid(req.user._id, orderAmount);
  if (!validity.valid) { res.status(400); throw new Error(validity.message); }
  const discount = coupon.calculateDiscount(orderAmount);
  res.json({ success: true, discount, discountType: coupon.discountType, discountValue: coupon.discountValue, description: coupon.description });
});

module.exports = { createPaymentIntent, handleWebhook, createRefund, validateCoupon };
