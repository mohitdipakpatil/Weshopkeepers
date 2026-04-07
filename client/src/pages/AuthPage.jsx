import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function AuthPage({ mode = 'login' }) {
  const [tab, setTab] = useState(mode);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = tab === 'login' ? await authAPI.login({ email: form.email, password: form.password }) : await authAPI.register(form);
      setAuth(res.user, res.token);
      toast.success(tab === 'login' ? 'Welcome back!' : 'Account created!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || '/api'}/auth/google`;
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 animate-fade-up">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 btn-primary rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3">🏪</div>
          <h2 className="font-syne text-2xl font-extrabold text-white">WeShopkeepers</h2>
          <p className="text-slate-500 text-sm mt-1">Your Neighbourhood. Your Store. Online.</p>
        </div>

        <div className="glass rounded-3xl p-7">
          {/* Tab */}
          <div className="flex bg-navy-900 rounded-2xl p-1 mb-6">
            {['login', 'register'].map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 rounded-xl text-sm font-syne font-bold capitalize transition-all ${tab === t ? 'bg-electric text-white shadow' : 'text-slate-500 hover:text-white'}`}>{t}</button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {tab === 'register' && (
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-widest font-semibold block mb-1.5">Full Name</label>
                <input className="input-field rounded-xl" placeholder="Priya Sharma" value={form.name} onChange={set('name')} required />
              </div>
            )}
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-widest font-semibold block mb-1.5">Email</label>
              <input type="email" className="input-field rounded-xl" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
            </div>
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-widest font-semibold block mb-1.5">Password</label>
              <input type="password" className="input-field rounded-xl" placeholder="Min. 6 characters" value={form.password} onChange={set('password')} required minLength={6} />
            </div>

            {tab === 'login' && (
              <div className="text-right">
                <a href="#" className="text-xs text-electric hover:underline">Forgot password?</a>
              </div>
            )}

            <button type="submit" disabled={loading} className={`w-full py-3 rounded-xl font-syne font-bold text-sm transition-all ${loading ? 'bg-slate-700 text-slate-400' : 'btn-primary'}`}>
              {loading ? 'Please wait...' : tab === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-slate-700" />
            <span className="text-slate-600 text-xs">or</span>
            <div className="flex-1 h-px bg-slate-700" />
          </div>

          <button onClick={handleGoogle} className="w-full py-3 rounded-xl border border-slate-700 text-slate-300 text-sm font-semibold flex items-center justify-center gap-3 hover:border-slate-500 transition-colors">
            <span className="text-base">G</span> Continue with Google
          </button>

          {tab === 'login' && (
            <div className="mt-4 p-3 bg-navy-900 rounded-xl">
              <p className="text-xs text-slate-500 text-center mb-1">Demo credentials</p>
              <p className="text-xs text-center font-mono text-slate-400">admin@weshopkeepers.com / Admin@123</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
