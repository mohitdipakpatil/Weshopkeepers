import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDashboard, useAdminOrders, useAdminUsers, useUpdateOrderStatus, useToggleUserStatus } from '../hooks/useQueries';
import { formatPrice } from '../utils/helpers';
import { StatusBadge, LoadingPage, Spinner } from '../components/common';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function AdminDashboard() {
  const [tab, setTab] = useState('overview');
  const { data, isLoading } = useDashboard();
  const { data: ordersData } = useAdminOrders({ limit: 20 });
  const { data: usersData } = useAdminUsers({ limit: 20 });
  const updateStatus = useUpdateOrderStatus();
  const toggleUser = useToggleUserStatus();

  if (isLoading) return <LoadingPage />;
  const { stats, revenueData = [], topProducts = [], lowStockProducts = [] } = data || {};

  const chartData = revenueData.map((d) => ({
    month: `${d._id.year}-${String(d._id.month).padStart(2, '0')}`,
    revenue: d.revenue,
    orders: d.orders,
  }));

  const statCards = [
    { label: 'Total Revenue', value: formatPrice(stats?.totalRevenue || 0), change: '+23.5%', icon: '💰' },
    { label: 'Total Orders', value: stats?.totalOrders?.toLocaleString() || 0, change: `+${stats?.orderGrowth || 0}%`, icon: '📦' },
    { label: 'Total Users', value: stats?.totalUsers?.toLocaleString() || 0, change: '+18.4%', icon: '👥' },
    { label: 'Products', value: stats?.totalProducts || 0, change: 'Active', icon: '🏷️' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-up">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-syne text-2xl font-extrabold text-white">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">WeShopkeepers — Control Panel</p>
        </div>
        <Link to="/" className="btn-primary px-4 py-2 rounded-xl font-syne font-bold text-sm">🏪 View Store</Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statCards.map((s) => (
          <div key={s.label} className="glass rounded-2xl p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-2xl">{s.icon}</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-500/15 text-green-400">{s.change}</span>
            </div>
            <p className="font-syne text-2xl font-extrabold text-white mb-1">{s.value}</p>
            <p className="text-slate-500 text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-navy-800 mb-6">
        {['overview', 'orders', 'products', 'users'].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-5 py-3 font-syne font-semibold text-sm capitalize transition-all border-b-2 -mb-px ${tab === t ? 'text-electric border-electric' : 'text-slate-500 border-transparent hover:text-white'}`}>{t}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-5">
          <div className="grid md:grid-cols-3 gap-5">
            <div className="md:col-span-2 glass rounded-2xl p-5">
              <h3 className="font-syne font-bold text-white text-sm mb-4">Revenue Trend</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData}>
                  <defs><linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} /><stop offset="95%" stopColor="#3B82F6" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="month" stroke="#334155" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                  <YAxis stroke="#334155" tick={{ fontSize: 11, fill: '#94A3B8' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                  <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 10, color: '#F8FAFC', fontSize: 12 }} formatter={(v) => [formatPrice(v), 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} fill="url(#rev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="glass rounded-2xl p-5">
              <h3 className="font-syne font-bold text-white text-sm mb-4">Monthly Orders</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="month" stroke="#334155" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                  <YAxis stroke="#334155" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                  <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 10, color: '#F8FAFC', fontSize: 12 }} />
                  <Bar dataKey="orders" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {lowStockProducts.length > 0 && (
            <div className="glass rounded-2xl p-5">
              <h3 className="font-syne font-bold text-white text-sm mb-4">⚠️ Low Stock Alerts</h3>
              <div className="grid md:grid-cols-3 gap-3">
                {lowStockProducts.map((p) => (
                  <div key={p._id} className="flex items-center gap-3 bg-amber-500/8 border border-amber-500/20 rounded-xl p-3">
                    <div className="flex-1 min-w-0"><p className="text-white text-xs font-semibold truncate">{p.name}</p><p className="text-amber-400 text-xs">Only {p.countInStock} left</p></div>
                    <button className="btn-primary text-xs px-2 py-1 rounded-lg shrink-0">Restock</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="glass rounded-2xl p-5">
            <h3 className="font-syne font-bold text-white text-sm mb-4">🏆 Top Selling Products</h3>
            <div className="space-y-2">
              {topProducts.map((p, i) => (
                <div key={p._id} className="flex items-center gap-3 py-2 border-b border-navy-700 last:border-0">
                  <span className="text-slate-500 text-xs font-bold w-4">#{i + 1}</span>
                  <div className="flex-1 min-w-0"><p className="text-white text-sm">{p.name}</p><p className="text-slate-500 text-xs">{p.category}</p></div>
                  <p className="text-slate-400 text-xs">{p.totalSold} sold</p>
                  <p className="font-syne font-bold text-white text-sm">{formatPrice(p.price)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'orders' && (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-navy-700">{['Order ID', 'Customer', 'Amount', 'Status', 'Date', 'Action'].map((h) => <th key={h} className="px-4 py-3 text-left text-xs text-slate-500 uppercase tracking-wider font-semibold">{h}</th>)}</tr></thead>
            <tbody>
              {ordersData?.orders?.map((o, i) => (
                <tr key={o._id} className={`border-b border-navy-800/50 ${i % 2 === 0 ? '' : 'bg-navy-800/20'}`}>
                  <td className="px-4 py-3 font-mono text-electric text-xs">#{o._id.slice(-8).toUpperCase()}</td>
                  <td className="px-4 py-3 text-slate-300 text-xs">{o.user?.name}</td>
                  <td className="px-4 py-3 font-syne font-bold text-white text-xs">{formatPrice(o.totalPrice)}</td>
                  <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <select className="bg-navy-900 border border-slate-700 text-slate-300 rounded-lg px-2 py-1 text-xs outline-none" defaultValue={o.status} onChange={(e) => updateStatus.mutate({ id: o._id, status: e.target.value })}>
                      {['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'].map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'users' && (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-navy-700">{['User', 'Email', 'Joined', 'Status', 'Action'].map((h) => <th key={h} className="px-4 py-3 text-left text-xs text-slate-500 uppercase tracking-wider font-semibold">{h}</th>)}</tr></thead>
            <tbody>
              {usersData?.users?.map((u, i) => (
                <tr key={u._id} className={`border-b border-navy-800/50 ${i % 2 === 0 ? '' : 'bg-navy-800/20'}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-electric flex items-center justify-center text-white text-xs font-bold shrink-0">{u.name?.[0]}</div>
                      <span className="text-white text-xs font-semibold">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{u.email}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${u.isActive ? 'bg-green-500/15 text-green-400' : 'bg-slate-500/15 text-slate-400'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td className="px-4 py-3"><button onClick={() => toggleUser.mutate(u._id)} className="text-xs text-slate-400 hover:text-electric transition-colors">{u.isActive ? 'Deactivate' : 'Activate'}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'products' && (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-navy-700">{['Product', 'Category', 'Price', 'Stock', 'Rating'].map((h) => <th key={h} className="px-4 py-3 text-left text-xs text-slate-500 uppercase tracking-wider font-semibold">{h}</th>)}</tr></thead>
            <tbody>
              {topProducts.map((p, i) => (
                <tr key={p._id} className={`border-b border-navy-800/50 ${i % 2 === 0 ? '' : 'bg-navy-800/20'}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {p.images?.[0]?.url && <img src={p.images[0].url} alt="" className="w-8 h-8 rounded object-cover shrink-0" />}
                      <span className="text-white text-xs font-semibold">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{p.category}</td>
                  <td className="px-4 py-3 font-syne font-bold text-white text-xs">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3 text-xs font-bold">{p.countInStock}</td>
                  <td className="px-4 py-3 text-xs text-amber-400">⭐ {p.rating?.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
