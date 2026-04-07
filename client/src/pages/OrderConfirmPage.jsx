// OrderConfirmPage.jsx
import { Link, useParams } from 'react-router-dom';
import { useOrder } from '../hooks/useQueries';
import { formatPrice } from '../utils/helpers';
import { StatusBadge, LoadingPage } from '../components/common';

export function OrderConfirmPage() {
  const { id } = useParams();
  const { data, isLoading } = useOrder(id);
  const order = data?.order;
  if (isLoading) return <LoadingPage />;
  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center animate-fade-up">
      <div className="w-24 h-24 btn-primary rounded-full flex items-center justify-center text-5xl mx-auto mb-6 animate-bounce-in" style={{ boxShadow: '0 0 60px rgba(59,130,246,0.4)' }}>✓</div>
      <h1 className="font-syne text-4xl font-extrabold text-white mb-2">Order Placed!</h1>
      <p className="text-slate-400 mb-6">Thank you for shopping with WeShopkeepers 🎉</p>
      <div className="glass inline-block px-6 py-3 rounded-2xl mb-8">
        <p className="text-xs text-slate-500">Order ID</p>
        <p className="font-syne text-xl font-extrabold text-electric">#{order?._id?.slice(-8).toUpperCase()}</p>
      </div>
      {order && (
        <div className="glass rounded-2xl p-5 mb-8 text-left">
          <h3 className="font-syne font-bold text-white text-sm mb-4">What happens next?</h3>
          {[['✅', 'Confirmation sent to ' + (order.user?.email || 'your email')], ['📦', 'Your order is being prepared'], ['🚚', 'Expected in 3–5 business days']].map(([ic, t]) => (
            <div key={t} className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-navy-800 flex items-center justify-center text-sm shrink-0">{ic}</div>
              <p className="text-slate-300 text-sm">{t}</p>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-3 justify-center">
        <Link to="/account?tab=orders" className="px-6 py-3 rounded-2xl border border-slate-700 text-slate-300 text-sm hover:border-electric/50 transition-colors">Track Order</Link>
        <Link to="/" className="btn-primary px-6 py-3 rounded-2xl font-syne font-bold text-sm">Continue Shopping</Link>
      </div>
    </div>
  );
}
