const express = require('express');
const router = express.Router();
const { getDashboardStats, getAllOrders, getAllUsers, toggleUserStatus } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect, admin);

router.get('/dashboard-stats', getDashboardStats);
router.get('/orders', getAllOrders);
router.get('/users', getAllUsers);
router.put('/users/:id/status', toggleUserStatus);

module.exports = router;
