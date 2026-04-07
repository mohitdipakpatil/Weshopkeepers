import { Link } from 'react-router-dom';
import { useCartStore, useWishlistStore } from '../../store';
import { Stars, Badge } from '../common';
import { formatPrice, calcDiscount } from '../../utils/helpers';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function ProductCard({ product }) {
  const addItem = useCartStore((s) => s.addItem);
  const { toggle, isWishlisted } = useWishlistStore();
  const [adding, setAdding] = useState(false);
  const wishlisted = isWishlisted(product._id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    setAdding(true);
    addItem(product);
    toast.success(`${product.name.split(' ').slice(0, 2).join(' ')} added to cart!`);
    setTimeout(() => setAdding(false), 1400);
  };

  const disc = calcDiscount(product.price, product.mrp);
  const img = product.images?.[0]?.url;

  return (
    <Link to={`/products/${product._id}`} className="glass card-hover rounded-2xl overflow-hidden block group">
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
        {img ? (
          <img src={img} alt={product.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">🛍️</div>
        )}
        {product.badge && (
          <div className="absolute top-2 left-2"><Badge label={product.badge} /></div>
        )}
        <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-1.5 py-0.5 rounded">
          -{disc}%
        </div>
        <button
          onClick={(e) => { e.preventDefault(); toggle(product); }}
          className="absolute bottom-2 right-2 w-8 h-8 glass rounded-full flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {wishlisted ? '❤️' : '🤍'}
        </button>
        {product.countInStock === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-bold text-sm">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-xs text-slate-500 mb-1">{product.brand}</p>
        <h3 className="text-sm font-semibold text-slate-100 mb-2 leading-snug line-clamp-2">{product.name}</h3>
        <div className="flex items-center gap-2 mb-3">
          <Stars rating={product.rating} />
          <span className="text-xs text-slate-500">({product.numReviews})</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-syne font-bold text-white text-base">{formatPrice(product.price)}</p>
            <p className="text-xs text-slate-600 line-through">{formatPrice(product.mrp)}</p>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.countInStock === 0 || adding}
            className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-all ${adding ? 'bg-green-600' : 'btn-primary'} disabled:opacity-50`}
          >
            {adding ? '✓' : '+'}
          </button>
        </div>
      </div>
    </Link>
  );
}
