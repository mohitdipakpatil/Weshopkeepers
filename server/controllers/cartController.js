const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const { getRedis } = require('../config/redis');

const getCartKey = (userId) => `cart:${userId}`;
const CART_TTL = 7 * 24 * 60 * 60;

const getCart = asyncHandler(async (req, res) => {
  const redis = getRedis();
  const key = getCartKey(req.user._id);
  const data = redis ? await redis.get(key) : null;
  const cart = data ? JSON.parse(data) : { items: [], updatedAt: new Date() };
  res.json({ success: true, cart });
});

const addToCart = asyncHandler(async (req, res) => {
  const { productId, qty = 1, variant } = req.body;
  const product = await Product.findById(productId).select('name price mrp images brand countInStock');
  if (!product || !product.isActive) { res.status(404); throw new Error('Product not found'); }
  if (product.countInStock < qty) { res.status(400); throw new Error(`Only ${product.countInStock} units available`); }

  const redis = getRedis();
  const key = getCartKey(req.user._id);
  const data = redis ? await redis.get(key) : null;
  const cart = data ? JSON.parse(data) : { items: [] };

  const idx = cart.items.findIndex((i) => i.productId === productId && i.variant === variant);
  if (idx > -1) {
    const newQty = cart.items[idx].qty + qty;
    if (newQty > product.countInStock) { res.status(400); throw new Error('Not enough stock'); }
    cart.items[idx].qty = newQty;
  } else {
    cart.items.push({
      productId,
      name: product.name,
      brand: product.brand,
      price: product.price,
      mrp: product.mrp,
      image: product.images[0]?.url || '',
      qty,
      variant: variant || null,
      maxQty: product.countInStock,
    });
  }
  cart.updatedAt = new Date();
  if (redis) await redis.setex(key, CART_TTL, JSON.stringify(cart));
  res.json({ success: true, cart });
});

const updateCartItem = asyncHandler(async (req, res) => {
  const { productId, qty, variant } = req.body;
  if (qty < 1) { res.status(400); throw new Error('Quantity must be at least 1'); }
  const product = await Product.findById(productId).select('countInStock');
  if (!product) { res.status(404); throw new Error('Product not found'); }
  if (qty > product.countInStock) { res.status(400); throw new Error('Not enough stock'); }

  const redis = getRedis();
  const key = getCartKey(req.user._id);
  const data = redis ? await redis.get(key) : null;
  if (!data) { res.status(404); throw new Error('Cart not found'); }
  const cart = JSON.parse(data);
  const idx = cart.items.findIndex((i) => i.productId === productId && i.variant === variant);
  if (idx === -1) { res.status(404); throw new Error('Item not in cart'); }
  cart.items[idx].qty = qty;
  cart.updatedAt = new Date();
  if (redis) await redis.setex(key, CART_TTL, JSON.stringify(cart));
  res.json({ success: true, cart });
});

const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { variant } = req.query;
  const redis = getRedis();
  const key = getCartKey(req.user._id);
  const data = redis ? await redis.get(key) : null;
  if (!data) return res.json({ success: true, cart: { items: [] } });
  const cart = JSON.parse(data);
  cart.items = cart.items.filter((i) => !(i.productId === productId && i.variant === (variant || null)));
  cart.updatedAt = new Date();
  if (redis) await redis.setex(key, CART_TTL, JSON.stringify(cart));
  res.json({ success: true, cart });
});

const clearCart = asyncHandler(async (req, res) => {
  const redis = getRedis();
  if (redis) await redis.del(getCartKey(req.user._id));
  res.json({ success: true, message: 'Cart cleared' });
});

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
