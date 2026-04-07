import { useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuthStore } from '../store';
import { authAPI } from '../services/api';

export default function OAuthSuccess() {
  const [params] = useSearchParams();
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    if (!token) { navigate('/login?error=oauth_failed'); return; }
    // Temporarily set token then fetch user
    useAuthStore.setState({ token });
    authAPI.getMe().then((res) => {
      setAuth(res.user, token);
      navigate('/');
    }).catch(() => navigate('/login?error=oauth_failed'));
  }, []);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-electric/30 border-t-electric rounded-full animate-spin-custom mx-auto mb-4" />
        <p className="text-slate-400">Signing you in...</p>
      </div>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 text-center animate-fade-up">
      <div>
        <div className="text-9xl font-syne font-extrabold text-navy-800 mb-4">404</div>
        <div className="text-5xl mb-6">🤷</div>
        <h2 className="font-syne text-3xl font-extrabold text-white mb-3">Page Not Found</h2>
        <p className="text-slate-400 mb-8 max-w-sm mx-auto">Oops! The page you're looking for doesn't exist or may have moved.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="btn-primary px-7 py-3 rounded-2xl font-syne font-bold text-sm">Go Home</Link>
          <Link to="/products" className="px-7 py-3 rounded-2xl border border-slate-700 text-slate-300 text-sm hover:border-electric/50 transition-colors">Browse Products</Link>
        </div>
      </div>
    </div>
  );
}
