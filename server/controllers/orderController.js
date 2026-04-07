const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { getRedis } = require('../config/redis');
const generateInvoice = require('../utils/invoiceGenerator');

// POST /api/orders/create
const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, deliveryOption, couponCode, paymentResult } = req.body;
  if (!orderItems || orderItems.length === 0) { res.status(400); throw new Error('No order items'); }

  let itemsPrice = 0;
  const validatedItems = [];
  for (const item of orderItems) {
    const product = await Product.findById(item.productId);
    if (!product) { res.status(404); throw new Error(`Product ${item.productId} not found`); }
    if (product.countInStock < item.qty) { res.status(400); throw new Error(`${product.name}: insufficient stock`); }
    itemsPrice += product.price * item.qty;
    validatedItems.push({ product: product._id, name: product.name, image: product.images[0]?.url, price: product.price, qty: item.qty, variant: item.variant });
  }

  let discountAmount = 0;
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (coupon) {
      const validity = coupon.isValid(req.user._id, itemsPrice);
      if (validity.valid) {
        discountAmount = coupon.calculateDiscount(itemsPrice);
        coupon.usedCount += 1;
        coupon.usedBy.push(req.user._id);
        await coupon.save();
      }
    }
  }

  const deliveryPrices = { standard: itemsPrice >= 499 ? 0 : 49, express: 99, same_day: 199 };
  const deliveryPrice = deliveryPrices[deliveryOption] || 0;
  const taxPrice = Math.round((itemsPrice - discountAmount) * 0.05);
  const totalPrice = itemsPrice - discountAmount + deliveryPrice + taxPrice;

  const order = await Order.create({
    user: req.user._id,
    orderItems: validatedItems,
    shippingAddress,
    paymentMethod,
    deliveryOption,
    couponCode,
    itemsPrice,
    discountAmount,
    deliveryPrice,
    taxPrice,
    totalPrice,
    paymentResult,
    isPaid: paymentMethod !== 'cod',
    paidAt: paymentMethod !== 'cod' ? new Date() : undefined,
    status: paymentMethod !== 'cod' ? 'confirmed' : 'pending',
  });

  for (const item of validatedItems) {
    await Product.findByIdAndUpdate(item.product, { $inc: { countInStock: -item.qty, totalSold: item.qty } });
  }

  const redis = getRedis();
  if (redis) await redis.del(`cart:${req.user._id}`);

  const populated = await Order.findById(order._id).populate('user', 'name email');
  res.status(201).json({ success: true, order: populated });
});

// GET /api/orders/my-orders
const getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).skip((+page - 1) * +limit).limit(+limit);
  const total = await Order.countDocuments({ user: req.user._id });
  res.json({ success: true, orders, total, page: +page, pages: Math.ceil(total / +limit) });
});

// GET /api/orders/:id
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email phone');
  if (!order) { res.status(404); throw new Error('Order not found'); }
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorized to view this order');
  }
  res.json({ success: true, order });
});

// PUT /api/orders/:id/status (admin)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note, trackingNumber } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error('Order not found'); }
  order.status = status;
  if (note) order.statusHistory[order.statusHistory.length - 1].note = note;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (status === 'delivered') { order.isDelivered = true; order.deliveredAt = new Date(); }
  await order.save();
  res.json({ success: true, order });
});

// POST /api/orders/:id/cancel
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error('Order not found'); }
  if (order.user.toString() !== req.user._id.toString()) { res.status(403); throw new Error('Not authorized'); }
  if (['shipped', 'delivered'].includes(order.status)) { res.status(400); throw new Error('Cannot cancel after shipment'); }
  order.status = 'cancelled';
  await order.save();
  for (const item of order.orderItems) {
    await Product.findByIdAndUpdate(item.product, { $inc: { countInStock: item.qty, totalSold: -item.qty } });
  }
  res.json({ success: true, order });
});

module.exports = { createOrder, getMyOrders, getOrderById, updateOrderStatus, cancelOrder };
