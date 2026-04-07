import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts, useCategories } from '../hooks/useQueries';
import ProductCard from '../components/product/ProductCard';
import { LoadingPage, EmptyState } from '../components/common';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    category: searchParams.get('category') || '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    rating: '',
    sort: 'popular',
    page: 1,
  });

  useEffect(() => {
    const kw = searchParams.get('keyword') || '';
    const cat = searchParams.get('category') || '';
    setFilters((f) => ({ ...f, keyword: kw, category: cat, page: 1 }));
  }, [searchParams.toString()]);

  const { data, isLoading, isFetching } = useProducts(filters);
  const { data: catData } = useCategories();
  const products = data?.products || [];
  const totalPages = data?.pages || 1;
  const categories = catData?.categories || ['Electronics', 'Footwear', 'Groceries', 'Sports', 'Home & Kitchen', 'Fashion'];
  const brands = [...new Set(products.map((p) => p.brand))];

  const setFilter = (key, val) => setFilters((f) => ({ ...f, [key]: val, page: 1 }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex gap-6 animate-fade-up">
      {/* Sidebar */}
      <aside className="hidden md:block w-56 shrink-0">
        <div className="glass rounded-2xl p-5 sticky top-20">
          <h3 className="font-syne text-sm font-bold text-white mb-5">⚙️ Filters</h3>

          {/* Category */}
          <div className="mb-5">
            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-3">Category</p>
            {['', ...categories].map((c) => (
              <label key={c} className="flex items-center gap-2 mb-2 cursor-pointer group">
                <input type="radio" name="cat" checked={filters.category === c} onChange={() => setFilter('category', c)} className="accent-electric" />
                <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{c || 'All Categories'}</span>
              </label>
            ))}
          </div>

          {/* Price range */}
          <div className="mb-5">
            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-3">Max Price</p>
            <input type="range" min="0" max="50000" step="500" value={filters.maxPrice || 50000} onChange={(e) => setFilter('maxPrice', e.target.value)} className="w-full accent-electric" />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>₹0</span>
              <span>₹{(filters.maxPrice || 50000).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Rating */}
          <div className="mb-5">
            <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-3">Min Rating</p>
            {[[4.5, '4.5+'], [4, '4+'], [3, '3+'], ['', 'All']].map(([v, l]) => (
              <label key={l} className="flex items-center gap-2 mb-2 cursor-pointer group">
                <input type="radio" name="rat" checked={String(filters.rating) === String(v)} onChange={() => setFilter('rating', v)} className="accent-electric" />
                <span className="text-sm text-slate-300 group-hover:text-white">{l}</span>
              </label>
            ))}
          </div>

          <button onClick={() => setFilters({ keyword: '', category: '', brand: '', minPrice: '', maxPrice: '', rating: '', sort: 'popular', page: 1 })} className="w-full py-2 rounded-xl border border-slate-700 text-slate-400 text-xs hover:border-electric/50 transition-colors">
            Clear Filters
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="font-syne text-xl font-extrabold text-white">{filters.category || 'All Products'}</h2>
            <p className="text-slate-500 text-xs mt-0.5">{data?.total ?? 0} products found {isFetching && '· Updating...'}</p>
          </div>
          <select value={filters.sort} onChange={(e) => setFilter('sort', e.target.value)} className="bg-navy-800 border border-slate-700 text-slate-300 rounded-xl px-3 py-2 text-sm outline-none hover:border-electric/50 transition-colors">
            <option value="popular">Popularity</option>
            <option value="newest">Newest First</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        {isLoading ? <LoadingPage /> : products.length === 0 ? (
          <EmptyState icon="🔍" title="No products found" subtitle="Try adjusting your filters or search terms" />
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                  <button key={pg} onClick={() => setFilters((f) => ({ ...f, page: pg }))} className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${filters.page === pg ? 'btn-primary' : 'glass text-slate-400 hover:text-white'}`}>
                    {pg}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
