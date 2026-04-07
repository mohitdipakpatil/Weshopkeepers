// components/common/index.jsx  — all small reusable components

export function Stars({ rating, size = 'sm' }) {
  const sz = size === 'sm' ? 'text-xs' : 'text-base';
  return (
    <span className={`flex gap-0.5 ${sz}`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className={i < Math.floor(rating) ? 'text-amber-400' : i < rating ? 'text-amber-300' : 'text-slate-700'}>★</span>
      ))}
    </span>
  );
}

export function Badge({ label, color = '#3B82F6' }) {
  return (
    <span style={{ background: color + '22', color, border: `1px solid ${color}40` }} className="text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
      {label}
    </span>
  );
}

export function StatusBadge({ status }) {
  const map = {
    pending: 'bg-yellow-500/15 text-yellow-400',
    confirmed: 'bg-blue-500/15 text-blue-400',
    processing: 'bg-purple-500/15 text-purple-400',
    shipped: 'bg-indigo-500/15 text-indigo-400',
    out_for_delivery: 'bg-cyan-500/15 text-cyan-400',
    delivered: 'bg-green-500/15 text-green-400',
    cancelled: 'bg-red-500/15 text-red-400',
    refunded: 'bg-slate-500/15 text-slate-400',
  };
  return (
    <span className={`text-xs font-bold px-3 py-1 rounded-full ${map[status] || 'bg-slate-500/15 text-slate-400'}`}>
      {status?.replace('_', ' ').toUpperCase()}
    </span>
  );
}

export function Spinner({ size = 6 }) {
  return (
    <div className={`w-${size} h-${size} border-2 border-electric/30 border-t-electric rounded-full animate-spin-custom`} />
  );
}

export function LoadingPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Spinner size={10} />
        <p className="text-slate-500 text-sm">Loading...</p>
      </div>
    </div>
  );
}

export function EmptyState({ icon = '📭', title, subtitle, action }) {
  return (
    <div className="text-center py-20">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="font-syne text-xl font-bold text-white mb-2">{title}</h3>
      {subtitle && <p className="text-slate-500 mb-6">{subtitle}</p>}
      {action}
    </div>
  );
}

export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex justify-between items-end mb-6">
      <div>
        <h2 className="font-syne text-2xl font-extrabold text-white">{title}</h2>
        {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
