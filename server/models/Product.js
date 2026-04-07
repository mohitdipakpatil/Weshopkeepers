const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    avatar: String,
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const variantSchema = new mongoose.Schema({
  type: { type: String, enum: ['size', 'color', 'storage', 'material'] },
  options: [{ label: String, value: String, priceModifier: { type: Number, default: 0 }, stock: { type: Number, default: 0 } }],
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    shortDescription: String,
    brand: { type: String, required: true },
    category: { type: String, required: true },
    subcategory: String,
    images: [{ url: String, publicId: String, alt: String }],
    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number, required: true, min: 0 },
    costPrice: { type: Number, min: 0 },
    countInStock: { type: Number, required: true, default: 0, min: 0 },
    variants: [variantSchema],
    reviews: [reviewSchema],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    tags: [String],
    features: [String],
    specifications: { type: Map, of: String },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    sku: { type: String, unique: true },
    weight: Number,
    dimensions: { length: Number, width: Number, height: Number },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    totalSold: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', brand: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ slug: 1 });

productSchema.methods.updateRating = function () {
  if (this.reviews.length === 0) { this.rating = 0; this.numReviews = 0; return; }
  this.numReviews = this.reviews.length;
  this.rating = this.reviews.reduce((acc, r) => acc + r.rating, 0) / this.reviews.length;
};

module.exports = mongoose.model('Product', productSchema);
