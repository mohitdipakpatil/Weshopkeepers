import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-navy-800 bg-navy-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg btn-primary flex items-center justify-center text-sm">🏪</div>
              <span className="font-syne font-extrabold text-white">We<span className="text-electric">Shopkeepers</span></span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">Your Neighbourhood. Your Store. Online.</p>
            <div className="flex gap-3 mt-4">
              {['📘', '📸', '🐦', '▶️'].map((icon, i) => (
                <button key={i} className="w-8 h-8 glass rounded-lg flex items-center justify-center text-sm hover:border-electric/40 transition-colors">{icon}</button>
              ))}
            </div>
          </div>
          {[
            { title: 'Shop', links: [['Electronics', '/products?category=Electronics'], ['Fashion', '/products?category=Fashion'], ['Groceries', '/products?category=Groceries'], ['Sports', '/products?category=Sports']] },
            { title: 'Account', links: [['My Profile', '/account'], ['My Orders', '/account?tab=orders'], ['Wishlist', '/account?tab=wishlist'], ['Addresses', '/account?tab=addresses']] },
            { title: 'Support', links: [['Help Center', '#'], ['Returns', '#'], ['Track Order', '#'], ['Contact Us', '#']] },
          ].map(({ title, links }) => (
            <div key={title}>
              <h4 className="font-syne font-bold text-white text-sm mb-3">{title}</h4>
              <ul className="space-y-2">
                {links.map(([label, href]) => (
                  <li key={label}><Link to={href} className="text-slate-500 text-sm hover:text-electric transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-navy-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-slate-600 text-xs">© {new Date().getFullYear()} WeShopkeepers. All rights reserved.</p>
          <div className="flex gap-4">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((l) => (
              <a key={l} href="#" className="text-slate-600 text-xs hover:text-slate-400 transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
