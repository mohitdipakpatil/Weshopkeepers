const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// GET /api/admin/dashboard-stats
const getDashboardStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [totalOrders, monthOrders, lastMonthOrders, totalUsers, totalProducts, lowStockProducts, revenueData] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
    Order.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
    User.countDocuments({ role: 'user' }),
    Product.countDocuments({ isActive: true }),
    Product.find({ countInStock: { $lt: 10 }, isActive: true }).select('name countInStock category').limit(10),
    Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, revenue: { $sum: '$totalPrice' }, orders: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]),
  ]);

  const totalRevenue = await Order.aggregate([{ $match: { isPaid: true } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]);
  const topProducts = await Product.find({ isActive: true }).sort({ totalSold: -1 }).limit(5).select('name totalSold price category images');

  res.json({
    success: true,
    stats: {
      totalRevenue: totalRevenue[0]?.total || 0,
      totalOrders,
      monthOrders,
      lastMonthOrders,
      orderGrowth: lastMonthOrders > 0 ? (((monthOrders - lastMonthOrders) / lastMonthOrders) * 100).toFixed(1) : 0,
      totalUsers,
      totalProducts,
    },
    lowStockProducts,
    revenueData,
    topProducts,
  });
});

// GET /api/admin/orders
const getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, search } = req.query;
  const query = {};
  if (status) query.status = status;
  if (search) query.$or = [{ _id: search }];
  const [orders, total] = await Promise.all([
    Order.find(query).populate('user', 'name email').sort({ createdAt: -1 }).skip((+page - 1) * +limit).limit(+limit),
    Order.countDocuments(query),
  ]);
  res.json({ success: true, orders, total, page: +page, pages: Math.ceil(total / +limit) });
});

// GET /api/admin/users
const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const query = { role: 'user' };
  if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip((+page - 1) * +limit).limit(+limit).select('-password'),
    User.countDocuments(query),
  ]);
  res.json({ success: true, users, total, page: +page, pages: Math.ceil(total / +limit) });
});

// PUT /api/admin/users/:id/status
const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  if (user.role === 'admin') { res.status(403); throw new Error('Cannot deactivate admin'); }
  user.isActive = !user.isActive;
  await user.save();
  res.json({ success: true, user });
});

module.exports = { getDashboardStats, getAllOrders, getAllUsers, toggleUserStatus };
