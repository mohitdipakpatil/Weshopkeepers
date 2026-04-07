require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');
const Coupon = require('../models/Coupon');

const products = [
  { name: 'Wireless Earbuds Pro', slug: 'wireless-earbuds-pro', description: 'Premium wireless earbuds with active noise cancellation, 30hr battery life, and crystal-clear audio.', shortDescription: 'ANC earbuds with 30hr battery', brand: 'SoundWave', category: 'Electronics', price: 2499, mrp: 3999, countInStock: 45, rating: 4.5, numReviews: 234, totalSold: 1200, isFeatured: true, tags: ['earbuds', 'wireless', 'anc'], features: ['Active Noise Cancellation', '30hr battery', 'IPX5 waterproof', 'Fast charge'], images: [{ url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400', alt: 'Earbuds' }] },
  { name: 'Smart Watch Series 5', slug: 'smart-watch-series-5', description: 'Track your fitness, receive notifications and monitor health metrics with this premium smartwatch.', shortDescription: 'Health & fitness smartwatch', brand: 'TechFit', category: 'Electronics', price: 8999, mrp: 12999, countInStock: 23, rating: 4.3, numReviews: 189, totalSold: 890, isFeatured: true, tags: ['smartwatch', 'fitness', 'health'], features: ['Heart rate monitor', 'GPS', 'Sleep tracking', '7-day battery'], images: [{ url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', alt: 'Watch' }] },
  { name: 'Running Shoes X9', slug: 'running-shoes-x9', description: 'Lightweight, responsive running shoes with superior cushioning for long-distance performance.', shortDescription: 'Lightweight performance running shoes', brand: 'SpeedRun', category: 'Footwear', price: 3499, mrp: 4999, countInStock: 67, rating: 4.7, numReviews: 456, totalSold: 2300, isFeatured: true, tags: ['shoes', 'running', 'sports'], features: ['Memory foam insole', 'Breathable mesh', 'Anti-slip sole', 'Reflective strips'], images: [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', alt: 'Shoes' }] },
  { name: 'Organic Green Tea 100g', slug: 'organic-green-tea-100g', description: 'Premium Darjeeling first flush organic green tea. Rich in antioxidants and naturally refreshing.', shortDescription: 'Premium organic Darjeeling green tea', brand: 'NatureLeaf', category: 'Groceries', price: 299, mrp: 399, countInStock: 200, rating: 4.4, numReviews: 892, totalSold: 5400, tags: ['tea', 'organic', 'health'], features: ['USDA Organic certified', 'Single estate', 'Rich in antioxidants'], images: [{ url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', alt: 'Green Tea' }] },
  { name: 'Yoga Mat Premium', slug: 'yoga-mat-premium', description: '6mm thick premium eco-friendly yoga mat with alignment lines and superior grip.', shortDescription: 'Eco-friendly 6mm yoga mat', brand: 'FlexZone', category: 'Sports', price: 1299, mrp: 1799, countInStock: 89, rating: 4.6, numReviews: 321, totalSold: 1800, isFeatured: true, tags: ['yoga', 'fitness', 'mat'], features: ['6mm cushioning', 'Non-slip surface', 'Eco-friendly TPE', 'Carrying strap'], images: [{ url: 'https://images.unsplash.com/photo-1601925228518-f569a1c3b0b7?w=400', alt: 'Yoga Mat' }] },
  { name: 'Noise Cancelling Headphones', slug: 'noise-cancelling-headphones', description: 'Over-ear headphones with industry-leading 40dB noise cancellation and Hi-Res audio support.', shortDescription: '40dB ANC over-ear headphones', brand: 'SoundWave', category: 'Electronics', price: 5999, mrp: 8999, countInStock: 12, rating: 4.8, numReviews: 543, totalSold: 3100, isFeatured: true, tags: ['headphones', 'anc', 'hifi'], features: ['40dB noise cancellation', 'Hi-Res audio', '25hr playback', 'Foldable design'], images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', alt: 'Headphones' }] },
  { name: 'Protein Powder Chocolate', slug: 'protein-powder-chocolate', description: '25g protein per serving whey concentrate with rich chocolate flavour and zero added sugar.', shortDescription: '25g protein whey concentrate', brand: 'MuscleMax', category: 'Sports', price: 1999, mrp: 2499, countInStock: 93, rating: 4.6, numReviews: 589, totalSold: 4200, tags: ['protein', 'fitness', 'supplement'], features: ['25g protein/serving', 'Zero added sugar', 'Informed Sport certified', 'Fast absorbing'], images: [{ url: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400', alt: 'Protein' }] },
  { name: 'Bluetooth Speaker', slug: 'bluetooth-speaker', description: '360° immersive sound with deep bass, 20hr playtime, waterproof body perfect for outdoor use.', shortDescription: '360° sound, 20hr waterproof speaker', brand: 'SoundWave', category: 'Electronics', price: 1899, mrp: 2499, countInStock: 78, rating: 4.4, numReviews: 298, totalSold: 2100, isFeatured: false, tags: ['speaker', 'bluetooth', 'outdoor'], features: ['360° sound', '20hr battery', 'IPX7 waterproof', 'True wireless stereo'], images: [{ url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400', alt: 'Speaker' }] },
];

const coupons = [
  { code: 'WSKDEAL40', description: '40% off on all orders', discountType: 'percentage', discountValue: 40, minOrderAmount: 999, maxDiscountAmount: 500, validUntil: new Date('2026-12-31') },
  { code: 'WELCOME10', description: '10% off for new users', discountType: 'percentage', discountValue: 10, minOrderAmount: 0, validUntil: new Date('2026-12-31') },
  { code: 'FLAT100', description: '₹100 off on orders above ₹999', discountType: 'flat', discountValue: 100, minOrderAmount: 999, validUntil: new Date('2026-12-31') },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Product.deleteMany();
    await Coupon.deleteMany();
    await User.deleteMany({ role: { $ne: 'admin' } });

    await Product.insertMany(products.map(p => ({ ...p, sku: 'WSK-' + Math.random().toString(36).substr(2, 9).toUpperCase() })));
    await Coupon.insertMany(coupons);

    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create({ name: 'Admin User', email: 'admin@weshopkeepers.com', password: 'Admin@123', role: 'admin', isVerified: true });
      console.log('Admin created: admin@weshopkeepers.com / Admin@123');
    }

    console.log(`Seeded: ${products.length} products, ${coupons.length} coupons`);
    process.exit(0);
  } catch (err) {
    console.error('Seeder error:', err.message);
    process.exit(1);
  }
};

seedDB();
