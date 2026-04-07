const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const { getRedis } = require('../config/redis');

const CACHE_TTL = 300;

// GET /api/products
const getProducts = asyncHandler(async (req, res) => {
  const { keyword, category, brand, minPrice, maxPrice, rating, sort, page = 1, limit = 12 } = req.query;
  const redis = getRedis();
  const cacheKey = `products:${JSON.stringify(req.query)}`;

  if (redis) {
    const cached = await redis.get(cacheKey);
    if (cached) return res.json(JSON.parse(cached));
  }

  const query = { isActive: true };
  if (keyword) query.$text = { $search: keyword };
  if (category) query.category = { $regex: category, $options: 'i' };
  if (brand) query.brand = { $regex: brand, $options: 'i' };
  if (minPrice || maxPrice) query.price = { ...(minPrice && { $gte: +minPrice }), ...(maxPrice && { $lte: +maxPrice }) };
  if (rating) query.rating = { $gte: +rating };

  const sortOptions = {
    popular: { totalSold: -1 },
    newest: { createdAt: -1 },
    'price-asc': { price: 1 },
    'price-desc': { price: -1 },
    rating: { rating: -1 },
  };
  const sortBy = sortOptions[sort] || sortOptions.popular;

  const count = await Product.countDocuments(query);
  const products = await Product.find(query).sort(sortBy).skip((+page - 1) * +limit).limit(+limit).select('-reviews -__v');

  const result = { success: true, products, page: +page, pages: Math.ceil(count / +limit), total: count };
  if (redis) await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result));
  res.json(result);
});

// GET /api/products/:id
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { slug: req.params.id }] }).populate('reviews.user', 'name avatar');
  if (!product || !product.isActive) { res.status(404); throw new Error('Product not found'); }
  res.json({ success: true, product });
});

// POST /api/products (admin)
const createProduct = asyncHandler(async (req, res) => {
  const { name, description, brand, category, price, mrp, countInStock, images, features, specifications, tags, variants } = req.body;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
  const sku = 'WSK-' + Date.now();
  const product = await Product.create({ name, slug, description, brand, category, price, mrp, countInStock, images: images || [], features, specifications, tags, variants, sku, seller: req.user._id });
  const redis = getRedis();
  if (redis) { const keys = await redis.keys('products:*'); if (keys.length) await redis.del(...keys); }
  res.status(201).json({ success: true, product });
});

// PUT /api/products/:id (admin)
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }
  Object.assign(product, req.body);
  const updated = await product.save();
  const redis = getRedis();
  if (redis) { const keys = await redis.keys('products:*'); if (keys.length) await redis.del(...keys); }
  res.json({ success: true, product: updated });
});

// DELETE /api/products/:id (admin)
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }
  product.isActive = false;
  await product.save();
  res.json({ success: true, message: 'Product removed' });
});

// POST /api/products/:id/reviews
const createReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }
  const already = product.reviews.find((r) => r.user.toString() === req.user._id.toString());
  if (already) { res.status(400); throw new Error('Product already reviewed'); }
  product.reviews.push({ user: req.user._id, name: req.user.name, avatar: req.user.avatar, rating: +rating, comment });
  product.updateRating();
  await product.save();
  res.status(201).json({ success: true, message: 'Review added' });
});

// GET /api/products/categories
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct('category', { isActive: true });
  res.json({ success: true, categories });
});

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct, createReview, getCategories };
