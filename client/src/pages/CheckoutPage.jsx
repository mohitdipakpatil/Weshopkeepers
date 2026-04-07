import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCartStore, useAuthStore } from '../store';
import { formatPrice, getDeliveryPrice } from '../utils/helpers';
import { useCreateOrder } from '../hooks/useQueries';
import toast from 'react-hot-toast';

const STEPS = ['Address', 'Delivery', 'Payment', 'Review'];

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { state: navState } = useLocation();
  const createOrder = useCreateOrder();

  const [step, setStep] = useState(1);
  const [addr, setAddr] = useState(user?.addresses?.[0] || { name: user?.name || '', phone: user?.phone || '', line1: '', city: '', state: '', pincode: '' });
  const [delivery, setDelivery] = useState('standard');
  const [payMethod, setPayMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '' });

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const discAmt = navState?.discount || 0;
  const deliveryAmt = getDeliveryPrice(delivery, subtotal);
  const tax = Math.round((subtotal - discAmt) * 0.05);
  const total = subtotal - discAmt + deliveryAmt + tax;

  const placeOrder = async () => {
    try {
      const res = await createOrder.mutateAsync({
        orderItems: items.map((i) => ({ productId: i.productId, qty: i.qty, variant: i.variant })),
        shippingAddress: addr,
        paymentMethod: payMethod,
        deliveryOption: delivery,
        couponCode: navState?.coupon || undefined,
        paymentResult: payMethod !== 'cod' ? { status: 'succeeded', id: 'pi_' + Date.now() } : undefined,
      });
      clearCart();
      navigate(`/order-confirm/${res.order._id}`);
    } catch (e) {
      toast.error(e.message || 'Order placement failed');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-up">
      <button onClick={() => navigate('/cart')} className="text-slate-500 text-sm flex items-center gap-2 mb-6 hover:text-white transition-colors">← Back to Cart</button>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-1 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${i + 1 < step ? 'bg-green-600 text-white' : i + 1 === step ? 'bg-electric text-white' : 'bg-navy-800 text-slate-500'}`}>
                {i + 1 < step ? '✓' : i + 1}
              </div>
              <span className={`text-xs font-semibold ${i + 1 <= step ? 'text-white' : 'text-slate-600'}`}>{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`w-8 h-px mx-2 ${i + 1 < step ? 'bg-green-600' : 'bg-navy-800'}`} />}
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {step === 1 && (
            <div className="glass rounded-2xl p-6 animate-fade-up">
              <h2 className="font-syne text-lg font-bold text-white mb-5">📍 Delivery Address</h2>
              <div className="grid grid-cols-2 gap-4">
                {[['name', 'Full Name'], ['phone', 'Phone Number'], ['line1', 'Address Line 1'], ['city', 'City'], ['state', 'State'], ['pincode', 'PIN Code']].map(([k, l]) => (
                  <div key={k} className={k === 'line1' ? 'col-span-2' : ''}>
                    <label className="text-xs text-slate-500 uppercase tracking-widest font-semibold block mb-1.5">{l}</label>
                    <input className="input-field rounded-xl" value={addr[k] || ''} onChange={(e) => setAddr((a) => ({ ...a, [k]: e.target.value }))} />
                  </div>
                ))}
              </div>
              <button onClick={() => setStep(2)} className="btn-primary w-full py-3 rounded-xl font-syne font-bold mt-6">Continue to Delivery</button>
            </div>
          )}

          {step === 2 && (
            <div className="glass rounded-2xl p-6 animate-fade-up">
              <h2 className="font-syne text-lg font-bold text-white mb-5">🚚 Delivery Options</h2>
              {[['standard', 'Standard Delivery', '3–5 business days', subtotal >= 499 ? 'FREE' : '₹49'], ['express', 'Express Delivery', 'Next day by 6 PM', '₹99'], ['same_day', 'Same Day Delivery', 'By 9 PM today', '₹199']].map(([id, label, sub, price]) => (
                <label key={id} className={`flex items-center gap-4 rounded-xl p-4 mb-3 cursor-pointer border transition-colors ${delivery === id ? 'border-electric bg-electric/8' : 'border-slate-700 bg-navy-800/40'}`}>
                  <input type="radio" name="del" checked={delivery === id} onChange={() => setDelivery(id)} className="accent-electric" />
                  <div className="flex-1"><p className="text-white font-semibold text-sm">{label}</p><p className="text-slate-500 text-xs">{sub}</p></div>
                  <span className={`font-syne font-bold text-sm ${price === 'FREE' ? 'text-green-400' : 'text-white'}`}>{price}</span>
                </label>
              ))}
              <div className="flex gap-3 mt-2">
                <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-400 text-sm hover:border-slate-500 transition-colors">Back</button>
                <button onClick={() => setStep(3)} className="flex-1 btn-primary py-3 rounded-xl font-syne font-bold text-sm">Continue</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="glass rounded-2xl p-6 animate-fade-up">
              <h2 className="font-syne text-lg font-bold text-white mb-5">💳 Payment Method</h2>
              {[['card', '💳 Credit / Debit Card'], ['upi', '📱 UPI Payment'], ['cod', '💵 Cash on Delivery']].map(([id, label]) => (
                <label key={id} className={`flex items-center gap-3 rounded-xl p-4 mb-3 cursor-pointer border transition-colors ${payMethod === id ? 'border-electric bg-electric/8' : 'border-slate-700 bg-navy-800/40'}`}>
                  <input type="radio" name="pay" checked={payMethod === id} onChange={() => setPayMethod(id)} className="accent-electric" />
                  <span className="text-white font-semibold text-sm">{label}</span>
                </label>
              ))}
              {payMethod === 'card' && (
                <div className="space-y-3 mt-4">
                  <input className="input-field rounded-xl" placeholder="Card Number (4242 4242 4242 4242)" value={cardDetails.number} onChange={(e) => setCardDetails((c) => ({ ...c, number: e.target.value }))} />
                  <div className="grid grid-cols-2 gap-3">
                    <input className="input-field rounded-xl" placeholder="MM / YY" value={cardDetails.expiry} onChange={(e) => setCardDetails((c) => ({ ...c, expiry: e.target.value }))} />
                    <input className="input-field rounded-xl" placeholder="CVV" type="password" value={cardDetails.cvv} onChange={(e) => setCardDetails((c) => ({ ...c, cvv: e.target.value }))} />
                  </div>
                </div>
              )}
              {payMethod === 'upi' && <input className="input-field rounded-xl mt-4" placeholder="Enter UPI ID (e.g. name@upi)" />}
              <div className="flex gap-3 mt-4">
                <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-400 text-sm hover:border-slate-500 transition-colors">Back</button>
                <button onClick={() => setStep(4)} className="flex-1 btn-primary py-3 rounded-xl font-syne font-bold text-sm">Review Order</button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 animate-fade-up">
              <div className="glass rounded-2xl p-5">
                <h3 className="font-syne font-bold text-white text-sm mb-3">📍 Delivering to</h3>
                <p className="font-semibold text-white mb-1">{addr.name}</p>
                <p className="text-slate-400 text-sm">{addr.line1}, {addr.city}, {addr.state} - {addr.pincode}</p>
                <p className="text-slate-400 text-sm">📞 {addr.phone}</p>
              </div>
              <div className="glass rounded-2xl p-5">
                <h3 className="font-syne font-bold text-white text-sm mb-3">Order Items ({items.length})</h3>
                {items.map((i) => (
                  <div key={i.productId} className="flex items-center gap-3 py-2 border-b border-navy-700 last:border-0">
                    <span className="text-lg">{i.image ? <img src={i.image} alt="" className="w-8 h-8 rounded object-cover" /> : '🛍️'}</span>
                    <div className="flex-1 min-w-0"><p className="text-white text-sm truncate">{i.name}</p><p className="text-slate-500 text-xs">Qty: {i.qty}</p></div>
                    <p className="text-white font-bold text-sm">{formatPrice(i.price * i.qty)}</p>
                  </div>
                ))}
              </div>
              <button onClick={placeOrder} disabled={createOrder.isPending} className={`w-full py-4 rounded-2xl font-syne font-bold text-base flex items-center justify-center gap-3 transition-all ${createOrder.isPending ? 'bg-slate-700 text-slate-400' : 'btn-primary'}`}>
                {createOrder.isPending ? (<><span className="animate-spin-custom inline-block">⟳</span> Processing...</>) : `💳 Place Order · ${formatPrice(total)}`}
              </button>
            </div>
          )}
        </div>

        {/* Summary sidebar */}
        <div className="glass rounded-2xl p-4 h-fit sticky top-20">
          <h3 className="font-syne font-bold text-white text-sm mb-4">Price Summary</h3>
          {items.map((i) => (
            <div key={i.productId} className="flex justify-between text-xs mb-2">
              <span className="text-slate-400 truncate max-w-32">{i.name} ×{i.qty}</span>
              <span className="text-white ml-2 shrink-0">{formatPrice(i.price * i.qty)}</span>
            </div>
          ))}
          <div className="border-t border-navy-700 mt-3 pt-3 space-y-2 text-sm">
            {discAmt > 0 && <div className="flex justify-between"><span className="text-green-400">Discount</span><span className="text-green-400">-{formatPrice(discAmt)}</span></div>}
            <div className="flex justify-between"><span className="text-slate-400">Delivery</span><span className={deliveryAmt === 0 ? 'text-green-400' : 'text-white'}>{deliveryAmt === 0 ? 'FREE' : formatPrice(deliveryAmt)}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Tax (5%)</span><span className="text-white">{formatPrice(tax)}</span></div>
            <div className="flex justify-between border-t border-navy-700 pt-2">
              <span className="font-syne font-bold text-white">Total</span>
              <span className="font-syne font-bold text-electric text-lg">{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
