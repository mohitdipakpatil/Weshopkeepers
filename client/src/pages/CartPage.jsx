// CartPage.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store';
import { formatPrice } from '../utils/helpers';
import { EmptyState } from '../components/common';
import { paymentAPI } from '../services/api';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { items, updateQty, removeItem } = useCartStore();
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(null);
  const [couponApplied, setCouponApplied] = useState(null);
  const [validating, setValidating] = useState(false);
  const navigate = useNavigate();

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const discAmt = discount ? discount.discount : 0;
  const delivery = subtotal >= 499 ? 0 : 49;
  const total = subtotal - discAmt + delivery;

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    setValidating(true);
    try {
      const res = await paymentAPI.validateCoupon({ code: coupon, orderAmount: subtotal });
      setDiscount(res);
      setCouponApplied(coupon.toUpperCase());
      toast.success(`Coupon applied! ₹${res.discount} saved`);
    } catch (e) {
      toast.error(e.message || 'Invalid coupon');
      setDiscount(null);
      setCouponApplied(null);
    } finally {
      setValidating(false);
    }
  };

  if (items.length === 0) return (
    <EmptyState icon="🛒" title="Your cart is empty" subtitle="Looks like you haven't added anything yet."
      action={<Link to="/products" className="btn-primary px-7 py-3 rounded-2xl font-syne font-bold text-sm inline-block">Start Shopping</Link>}
    />
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-up">
      <h1 className="font-syne text-2xl font-extrabold text-white mb-6">Shopping Cart <span className="text-slate-500 text-lg font-normal">({items.reduce((a, i) => a + i.qty, 0)} items)</span></h1>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-3">
          {items.map((item) => (
            <div key={`${item.productId}-${item.variant}`} className="glass rounded-2xl p-4 flex gap-4">
              <div className="w-20 h-20 glass rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <span className="text-3xl">🛍️</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500">{item.brand}</p>
                <p className="font-semibold text-slate-100 text-sm leading-snug mb-1">{item.name}</p>
                {item.variant && <p className="text-xs text-slate-500 mb-2">Variant: {item.variant}</p>}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 bg-navy-900 rounded-xl px-3 py-1.5">
                    <button onClick={() => updateQty(item.productId, item.qty - 1, item.variant)} className="text-slate-400 hover:text-white text-sm">−</button>
                    <span className="font-bold text-white text-sm w-4 text-center">{item.qty}</span>
                    <button onClick={() => updateQty(item.productId, item.qty + 1, item.variant)} className="text-slate-400 hover:text-white text-sm">+</button>
                  </div>
                  <div className="text-right">
                    <p className="font-syne font-bold text-white">{formatPrice(item.price * item.qty)}</p>
                    <p className="text-xs text-slate-500">{formatPrice(item.price)} each</p>
                  </div>
                </div>
              </div>
              <button onClick={() => removeItem(item.productId, item.variant)} className="text-slate-500 hover:text-red-400 transition-colors text-lg self-start">×</button>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="glass rounded-2xl p-4">
            <h3 className="font-syne font-bold text-white text-sm mb-3">🏷️ Apply Coupon</h3>
            <div className="flex gap-2 mb-2">
              <input className="input-field flex-1 text-sm rounded-xl" placeholder="Coupon code" value={coupon} onChange={(e) => setCoupon(e.target.value)} />
              <button onClick={applyCoupon} disabled={validating} className="btn-primary px-4 rounded-xl text-sm font-bold">
                {validating ? '...' : 'Apply'}
              </button>
            </div>
            {couponApplied && <p className="text-green-400 text-xs">✓ {couponApplied} applied — ₹{discAmt} off!</p>}
            <div className="flex gap-2 mt-2 flex-wrap">
              {['WSKDEAL40', 'WELCOME10'].map((c) => (
                <button key={c} onClick={() => setCoupon(c)} className="text-xs border border-electric/30 text-electric px-2 py-0.5 rounded font-mono bg-electric/8 hover:bg-electric/15 transition-colors">{c}</button>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-4">
            <h3 className="font-syne font-bold text-white text-sm mb-4">Order Summary</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between"><span className="text-slate-400">Subtotal</span><span className="text-white">{formatPrice(subtotal)}</span></div>
              {discAmt > 0 && <div className="flex justify-between"><span className="text-green-400">Discount</span><span className="text-green-400">-{formatPrice(discAmt)}</span></div>}
              <div className="flex justify-between"><span className="text-slate-400">Delivery</span><span className={delivery === 0 ? 'text-green-400' : 'text-white'}>{delivery === 0 ? 'FREE' : formatPrice(delivery)}</span></div>
              <div className="border-t border-navy-700 pt-2.5 flex justify-between">
                <span className="font-syne font-bold text-white">Total</span>
                <span className="font-syne font-bold text-white text-lg">{formatPrice(total)}</span>
              </div>
            </div>
            <button onClick={() => navigate('/checkout', { state: { discount: discAmt, coupon: couponApplied } })} className="btn-primary w-full py-3 rounded-xl font-syne font-bold text-sm mt-4">
              Proceed to Checkout →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
