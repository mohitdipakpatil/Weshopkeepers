import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProduct, useAddReview } from '../hooks/useQueries';
import { useCartStore, useWishlistStore, useAuthStore } from '../store';
import { Stars, LoadingPage, Badge } from '../components/common';
import { formatPrice, calcDiscount } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { data, isLoading } = useProduct(id);
  const product = data?.product;

  const addItem = useCartStore((s) => s.addItem);
  const { toggle, isWishlisted } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();

  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);
  const [tab, setTab] = useState('description');
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [added, setAdded] = useState(false);
  const addReview = useAddReview(id);

  if (isLoading) return <LoadingPage />;
  if (!product) return <div className="text-center py-20 text-slate-400">Product not found.</div>;

  const disc = calcDiscount(product.price, product.mrp);
  const mainImg = product.images?.[imgIdx]?.url;
  const wishlisted = isWishlisted(product._id);

  const handleAddToCart = () => {
    addItem(product, qty);
    setAdded(true);
    toast.success(`${product.name.split(' ').slice(0, 3).join(' ')} added to cart!`);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleReview = (e) => {
    e.preventDefault();
    if (!isAuthenticated) return toast.error('Please sign in to review');
    addReview.mutate(review);
    setReview({ rating: 5, comment: '' });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-up">
      {/* Breadcrumb */}
      <nav className="flex gap-2 text-xs text-slate-500 mb-6">
        <Link to="/" className="hover:text-electric transition-colors">Home</Link>
        <span>/</span>
        <Link to={`/products?category=${product.category}`} className="hover:text-electric transition-colors">{product.category}</Link>
        <span>/</span>
        <span className="text-slate-300">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10 mb-12">
        {/* Images */}
        <div>
          <div className="glass rounded-2xl h-72 flex items-center justify-center overflow-hidden mb-3 relative">
            {mainImg ? <img src={mainImg} alt={product.name} className="w-full h-full object-contain p-4" /> : <div className="text-8xl">🛍️</div>}
            {product.countInStock < 10 && product.countInStock > 0 && (
              <div className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded">Only {product.countInStock} left</div>
            )}
          </div>
          <div className="flex gap-2">
            {product.images?.map((img, i) => (
              <button key={i} onClick={() => setImgIdx(i)} className={`w-16 h-16 glass rounded-xl overflow-hidden border-2 transition-colors ${i === imgIdx ? 'border-electric' : 'border-transparent'}`}>
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <p className="text-electric text-sm font-semibold mb-2">{product.brand}</p>
          <h1 className="font-syne text-3xl font-extrabold text-white mb-3">{product.name}</h1>
          <div className="flex items-center gap-3 mb-5">
            <Stars rating={product.rating} size="md" />
            <span className="text-white font-semibold">{product.rating?.toFixed(1)}</span>
            <span className="text-slate-500 text-sm">({product.numReviews} reviews)</span>
          </div>

          <div className="glass rounded-2xl p-4 mb-5">
            <div className="flex items-baseline gap-3 mb-1">
              <span className="font-syne text-4xl font-extrabold text-white">{formatPrice(product.price)}</span>
              <span className="text-slate-500 line-through text-lg">{formatPrice(product.mrp)}</span>
              <span className="bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded">-{disc}% OFF</span>
            </div>
            <p className="text-xs text-slate-500">Inclusive of all taxes</p>
          </div>

          <div className="flex items-center gap-2 mb-5">
            <div className={`w-2 h-2 rounded-full ${product.countInStock > 20 ? 'bg-green-500' : product.countInStock > 0 ? 'bg-amber-500' : 'bg-red-500'}`} />
            <span className={`text-sm font-semibold ${product.countInStock > 20 ? 'text-green-400' : product.countInStock > 0 ? 'text-amber-400' : 'text-red-400'}`}>
              {product.countInStock > 20 ? 'In Stock' : product.countInStock > 0 ? `Only ${product.countInStock} left` : 'Out of Stock'}
            </span>
          </div>

          {/* Qty + Add to cart */}
          <div className="flex gap-3 mb-4 items-center">
            <div className="glass flex items-center gap-4 px-4 py-2.5 rounded-xl">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="text-slate-300 hover:text-white transition-colors text-lg">−</button>
              <span className="font-syne font-bold text-white w-5 text-center">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(product.countInStock, q + 1))} className="text-slate-300 hover:text-white transition-colors text-lg">+</button>
            </div>
            <button onClick={handleAddToCart} disabled={product.countInStock === 0} className={`flex-1 py-3 rounded-xl font-syne font-bold text-sm transition-all flex items-center justify-center gap-2 ${added ? 'bg-green-600 text-white' : 'btn-primary'}`}>
              {added ? '✓ Added to Cart!' : '🛒 Add to Cart'}
            </button>
            <button onClick={() => toggle(product)} className="glass p-3 rounded-xl text-lg hover:border-red-500/40 transition-colors">
              {wishlisted ? '❤️' : '🤍'}
            </button>
          </div>

          <Link to="/checkout" onClick={() => addItem(product, qty)} className="block w-full py-3 rounded-xl border-2 border-electric text-electric text-center font-syne font-bold text-sm hover:bg-electric/10 transition-colors mb-5">
            ⚡ Buy Now
          </Link>

          <div className="grid grid-cols-2 gap-2">
            {[['🚚', 'Free Delivery above ₹499'], ['🔄', '7-Day Easy Returns'], ['🛡️', '1 Year Warranty'], ['✅', '100% Genuine']].map(([ic, t]) => (
              <div key={t} className="flex items-center gap-2">
                <span className="text-sm">{ic}</span>
                <span className="text-xs text-slate-400">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-navy-800 flex gap-1 mb-6">
        {['description', 'reviews', 'shipping'].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-5 py-3 font-syne font-semibold text-sm capitalize transition-all border-b-2 -mb-px ${tab === t ? 'text-electric border-electric' : 'text-slate-500 border-transparent hover:text-white'}`}>
            {t}{t === 'reviews' && ` (${product.numReviews})`}
          </button>
        ))}
      </div>

      {tab === 'description' && (
        <div className="glass rounded-2xl p-6">
          <p className="text-slate-300 leading-relaxed mb-4">{product.description}</p>
          {product.features?.length > 0 && (
            <ul className="space-y-2">{product.features.map((f) => <li key={f} className="flex items-center gap-3 text-sm text-slate-300"><span className="text-green-500 font-bold">✓</span>{f}</li>)}</ul>
          )}
        </div>
      )}

      {tab === 'reviews' && (
        <div className="space-y-4">
          {product.reviews?.map((r) => (
            <div key={r._id} className="glass rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-electric flex items-center justify-center text-white font-bold">{r.name?.[0]}</div>
                <div>
                  <p className="font-semibold text-white text-sm">{r.name}</p>
                  <Stars rating={r.rating} />
                </div>
                <span className="ml-auto text-xs text-slate-500">{new Date(r.createdAt).toLocaleDateString('en-IN')}</span>
              </div>
              <p className="text-slate-300 text-sm">{r.comment}</p>
            </div>
          ))}
          {isAuthenticated && (
            <form onSubmit={handleReview} className="glass rounded-2xl p-5">
              <h3 className="font-syne font-bold text-white mb-4">Write a Review</h3>
              <div className="flex gap-1 mb-4">{[1,2,3,4,5].map((s) => <button key={s} type="button" onClick={() => setReview((r) => ({ ...r, rating: s }))} className={`text-2xl ${s <= review.rating ? 'text-amber-400' : 'text-slate-700'}`}>★</button>)}</div>
              <textarea className="input-field rounded-xl mb-3 resize-none" rows={3} placeholder="Share your experience..." value={review.comment} onChange={(e) => setReview((r) => ({ ...r, comment: e.target.value }))} required />
              <button type="submit" className="btn-primary px-6 py-2.5 rounded-xl font-syne font-bold text-sm" disabled={addReview.isPending}>
                {addReview.isPending ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}
        </div>
      )}

      {tab === 'shipping' && (
        <div className="glass rounded-2xl p-6 space-y-3">
          {[['🚚', 'Standard Delivery', '3–5 business days', 'Free above ₹499'], ['⚡', 'Express Delivery', 'Next day by 6 PM', '₹99'], ['🔄', 'Easy Returns', '7-day hassle-free', 'Free pickup']].map(([ic, t, s, p]) => (
            <div key={t} className="flex items-center gap-4 bg-navy-800/50 rounded-xl p-4">
              <span className="text-xl">{ic}</span>
              <div className="flex-1"><p className="text-white font-semibold text-sm">{t}</p><p className="text-slate-500 text-xs">{s}</p></div>
              <span className="text-electric text-sm font-bold">{p}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
