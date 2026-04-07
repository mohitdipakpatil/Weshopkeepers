import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore, useWishlistStore } from '../store';
import { authAPI } from '../services/api';
import { useMyOrders } from '../hooks/useQueries';
import { formatPrice } from '../utils/helpers';
import { StatusBadge, LoadingPage, EmptyState } from '../components/common';
import toast from 'react-hot-toast';

export function AccountPage() {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get('tab') || 'orders');
  const { user, updateUser } = useAuthStore();
  const { items: wishlist } = useWishlistStore();
  const { data: ordersData, isLoading } = useMyOrders();
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { const t = searchParams.get('tab'); if (t) setTab(t); }, [searchParams]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await authAPI.updateProfile(profile);
      updateUser(res.user);
      toast.success('Profile updated!');
    } catch (e) { toast.error(e.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-up">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 btn-primary rounded-2xl flex items-center justify-center text-2xl font-bold text-white shrink-0">{user?.name?.[0]?.toUpperCase()}</div>
        <div>
          <h1 className="font-syne text-xl font-extrabold text-white">{user?.name}</h1>
          <p className="text-slate-500 text-sm">{user?.email}</p>
        </div>
        {user?.role === 'admin' && <Link to="/admin" className="ml-auto btn-primary px-4 py-2 rounded-xl font-syne font-bold text-sm">⚙️ Admin</Link>}
      </div>

      <div className="flex gap-1 border-b border-navy-800 mb-6">
        {['orders', 'profile', 'addresses', 'wishlist'].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-5 py-3 font-syne font-semibold text-sm capitalize transition-all border-b-2 -mb-px ${tab === t ? 'text-electric border-electric' : 'text-slate-500 border-transparent hover:text-white'}`}>{t}</button>
        ))}
      </div>

      {tab === 'orders' && (
        isLoading ? <LoadingPage /> : ordersData?.orders?.length === 0 ? (
          <EmptyState icon="📦" title="No orders yet" subtitle="Your orders will appear here" action={<Link to="/products" className="btn-primary px-6 py-2.5 rounded-xl font-syne font-bold text-sm inline-block">Start Shopping</Link>} />
        ) : (
          <div className="space-y-3">
            {ordersData?.orders?.map((o) => (
              <div key={o._id} className="glass rounded-2xl p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-syne font-bold text-white">#{o._id.slice(-8).toUpperCase()}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{new Date(o.createdAt).toLocaleDateString('en-IN')} · {o.orderItems.length} items</p>
                  </div>
                  <StatusBadge status={o.status} />
                </div>
                <div className="flex justify-between items-center">
                  <p className="font-syne font-bold text-electric">{formatPrice(o.totalPrice)}</p>
                  <Link to={`/order-confirm/${o._id}`} className="text-electric text-sm hover:underline">View Details →</Link>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'profile' && (
        <div className="glass rounded-2xl p-6 max-w-md">
          {[['name', 'Full Name'], ['phone', 'Phone Number']].map(([k, l]) => (
            <div key={k} className="mb-4">
              <label className="text-xs text-slate-500 uppercase tracking-widest font-semibold block mb-1.5">{l}</label>
              <input className="input-field rounded-xl" value={profile[k] || ''} onChange={(e) => setProfile((p) => ({ ...p, [k]: e.target.value }))} />
            </div>
          ))}
          <div className="mb-4">
            <label className="text-xs text-slate-500 uppercase tracking-widest font-semibold block mb-1.5">Email</label>
            <input className="input-field rounded-xl opacity-60 cursor-not-allowed" value={user?.email || ''} disabled />
          </div>
          <button onClick={saveProfile} disabled={saving} className="btn-primary px-6 py-2.5 rounded-xl font-syne font-bold text-sm">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}

      {tab === 'addresses' && (
        <div className="max-w-lg space-y-3">
          {user?.addresses?.length === 0 || !user?.addresses ? (
            <p className="text-slate-500 text-sm">No saved addresses.</p>
          ) : user.addresses.map((a) => (
            <div key={a._id} className={`glass rounded-2xl p-4 border ${a.isDefault ? 'border-electric/40' : 'border-transparent'}`}>
              {a.isDefault && <span className="text-xs font-bold text-electric bg-electric/15 px-2 py-0.5 rounded-full mb-2 inline-block">Default</span>}
              <p className="font-semibold text-white">{a.name}</p>
              <p className="text-slate-400 text-sm">{a.line1}, {a.city}, {a.state} - {a.pincode}</p>
              <p className="text-slate-400 text-sm">📞 {a.phone}</p>
            </div>
          ))}
          <button className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-700 text-slate-500 text-sm hover:border-slate-500 transition-colors">+ Add New Address</button>
        </div>
      )}

      {tab === 'wishlist' && (
        wishlist.length === 0 ? (
          <EmptyState icon="🤍" title="Wishlist is empty" subtitle="Save products you love" action={<Link to="/products" className="btn-primary px-6 py-2.5 rounded-xl font-syne font-bold text-sm inline-block">Browse Products</Link>} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {wishlist.map((p) => (
              <Link key={p._id} to={`/products/${p._id}`} className="glass rounded-2xl overflow-hidden card-hover">
                <div className="h-28 bg-navy-800 flex items-center justify-center overflow-hidden">
                  {p.images?.[0]?.url ? <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" /> : <span className="text-4xl">🛍️</span>}
                </div>
                <div className="p-3">
                  <p className="text-white text-sm font-semibold line-clamp-2 mb-1">{p.name}</p>
                  <p className="font-syne font-bold text-electric text-sm">{formatPrice(p.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        )
      )}
    </div>
  );
}
