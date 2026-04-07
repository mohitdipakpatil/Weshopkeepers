import { Link } from 'react-router-dom';
import { useProducts, useCategories } from '../hooks/useQueries';
import ProductCard from '../components/product/ProductCard';
import { SectionHeader, LoadingPage } from '../components/common';

const CATEGORY_ICONS = { Electronics: '⚡', Footwear: '👟', Groceries: '🛒', Sports: '⚽', Fashion: '👗', 'Home & Kitchen': '🏠', Books: '📚' };

export default function HomePage() {
  const { data: featuredData, isLoading } = useProducts({ isFeatured: true, limit: 8 });
  const { data: catData } = useCategories();
  const categories = catData?.categories || [];
  const products = featuredData?.products || [];

  return (
    <div className="animate-fade-up">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-slate-900 to-navy-900 py-16 px-4">
        <div className="absolute top-10 right-10 w-80 h-80 rounded-full bg-electric/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-blue-800/10 blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-electric/30 bg-electric/8 text-electric-light text-xs font-semibold mb-6">
              ⚡ Now live in 200+ cities across India
            </div>
            <h1 className="font-syne text-5xl md:text-6xl font-extrabold text-white leading-tight mb-4">
              Your{' '}
              <span className="gradient-text">Neighbourhood</span>
              <br />Store, Online.
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-md mb-8">
              Shop local brands, trusted sellers, and everyday essentials — all in one place. Fast delivery, great prices.
            </p>
            <div className="flex gap-3 mb-10 flex-wrap">
              <Link to="/products" className="btn-primary px-7 py-3.5 rounded-2xl font-syne font-bold text-base flex items-center gap-2">
                Shop Now <span>→</span>
              </Link>
              <Link to="/products?sort=newest" className="px-7 py-3.5 rounded-2xl border border-slate-700 text-slate-300 text-base hover:border-electric/50 transition-colors">
                New Arrivals
              </Link>
            </div>
            <div className="flex gap-8">
              {[['50K+', 'Products'], ['200+', 'Cities'], ['2M+', 'Customers'], ['4.8★', 'Rating']].map(([n, l]) => (
                <div key={l}>
                  <p className="font-syne text-2xl font-extrabold text-white">{n}</p>
                  <p className="text-slate-500 text-xs">{l}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="hidden md:grid grid-cols-2 gap-3">
            {products.slice(0, 4).map((p) => (
              <Link key={p._id} to={`/products/${p._id}`} className="glass rounded-2xl p-4 card-hover">
                <div className="h-20 flex items-center justify-center text-4xl mb-2 overflow-hidden rounded-xl">
                  {p.images?.[0]?.url ? <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover rounded-xl" /> : '🛍️'}
                </div>
                <p className="text-xs font-semibold text-slate-200 line-clamp-2 mb-1">{p.name}</p>
                <p className="text-electric text-sm font-bold font-syne">₹{p.price.toLocaleString('en-IN')}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-y border-navy-800 bg-navy-800/40">
        <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[['🚚', 'Free Delivery', 'On orders above ₹499'], ['🔄', 'Easy Returns', '7-day return policy'], ['🔒', 'Secure Payment', '256-bit SSL'], ['🏆', 'Genuine Products', '100% authentic']].map(([ic, t, s]) => (
            <div key={t} className="flex items-center gap-3">
              <div className="w-9 h-9 btn-primary rounded-xl flex items-center justify-center text-base shrink-0">{ic}</div>
              <div>
                <p className="font-syne text-xs font-bold text-white">{t}</p>
                <p className="text-slate-500 text-xs">{s}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <SectionHeader title="Browse Categories" action={<Link to="/products" className="text-electric text-sm hover:underline">View all →</Link>} />
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {(categories.length ? categories : ['Electronics', 'Footwear', 'Groceries', 'Sports', 'Home & Kitchen', 'Fashion']).map((cat) => (
            <Link key={cat} to={`/products?category=${encodeURIComponent(cat)}`} className="glass rounded-2xl py-5 px-3 flex flex-col items-center gap-2 hover:border-electric/40 transition-colors group">
              <span className="text-3xl">{CATEGORY_ICONS[cat] || '🏷️'}</span>
              <p className="text-xs font-semibold text-slate-200 text-center group-hover:text-electric transition-colors">{cat}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Promo banner */}
      <section className="max-w-7xl mx-auto px-4 pb-8">
        <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 p-8 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/5" />
          <div>
            <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-2">🏷️ Limited Time Offer</p>
            <h3 className="font-syne text-3xl font-extrabold text-white mb-2">Up to 40% OFF</h3>
            <p className="text-blue-200 text-sm">Use code <code className="bg-black/30 px-2 py-0.5 rounded text-white font-mono">WSKDEAL40</code> at checkout</p>
          </div>
          <Link to="/products" className="bg-white text-blue-900 font-syne font-bold px-7 py-3.5 rounded-2xl text-sm whitespace-nowrap hover:bg-blue-50 transition-colors shrink-0">
            Grab the Deal
          </Link>
        </div>
      </section>

      {/* Featured products */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <SectionHeader title="Featured Products" subtitle="Handpicked for you" action={<Link to="/products" className="text-electric text-sm hover:underline">See all →</Link>} />
        {isLoading ? <LoadingPage /> : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}
