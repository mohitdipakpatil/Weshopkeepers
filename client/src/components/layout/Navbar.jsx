import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore, useCartStore } from '../../store';
import { debounce } from '../../utils/helpers';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const cartCount = useCartStore((s) => s.items.reduce((a, i) => a + i.qty, 0));
  const [query, setQuery] = useState('');
  const [userMenu, setUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setUserMenu(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = debounce((q) => {
    if (q.trim()) navigate(`/products?keyword=${encodeURIComponent(q.trim())}`);
  }, 400);

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-navy-900/98 shadow-2xl shadow-black/30' : 'bg-navy-900/95'} backdrop-blur-xl border-b border-navy-800`}>
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-xl btn-primary flex items-center justify-center text-base">🏪</div>
          <span className="font-syne font-extrabold text-lg text-white">
            We<span className="text-electric">Shopkeepers</span>
          </span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-xl relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search products, brands, categories..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); handleSearch(e.target.value); }}
            onKeyDown={(e) => e.key === 'Enter' && query.trim() && navigate(`/products?keyword=${encodeURIComponent(query.trim())}`)}
            className="input-field pl-9 rounded-full text-sm"
          />
        </div>

        {/* Nav links */}
        <div className="flex items-center gap-2 ml-auto">
          <Link to="/products" className="hidden md:block px-4 py-2 rounded-full border border-slate-700 text-slate-300 text-sm hover:border-electric hover:text-electric transition-colors">
            Shop
          </Link>

          {/* Cart */}
          <Link to="/cart" className="relative p-2 text-xl">
            🛒
            {cartCount > 0 && (
              <span className="animate-bounce-in absolute -top-1 -right-1 w-5 h-5 bg-electric rounded-full text-xs font-bold text-white flex items-center justify-center">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>

          {/* Auth */}
          {isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              <button onClick={() => setUserMenu(!userMenu)} className="flex items-center gap-2 px-3 py-2 bg-navy-800 border border-slate-700 rounded-full hover:border-electric transition-colors">
                <div className="w-6 h-6 rounded-full bg-electric flex items-center justify-center text-white text-xs font-bold">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm text-slate-200 hidden md:block">{user?.name?.split(' ')[0]}</span>
                <span className="text-slate-500 text-xs">▾</span>
              </button>

              {userMenu && (
                <div className="absolute right-0 top-full mt-2 w-52 glass rounded-2xl py-2 shadow-2xl shadow-black/50 animate-fade-up">
                  <div className="px-4 py-3 border-b border-navy-700">
                    <p className="font-semibold text-white text-sm">{user?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  </div>
                  {[['👤 My Account', '/account'], ['📦 My Orders', '/account?tab=orders'], user?.role === 'admin' && ['⚙️ Admin Panel', '/admin']].filter(Boolean).map(([label, path]) => (
                    <Link key={path} to={path} onClick={() => setUserMenu(false)} className="block px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-navy-700 transition-colors">
                      {label}
                    </Link>
                  ))}
                  <div className="border-t border-navy-700 mt-1 pt-1">
                    <button onClick={() => { logout(); setUserMenu(false); navigate('/'); }} className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                      🚪 Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn-primary px-4 py-2 rounded-full font-syne text-sm font-bold">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
