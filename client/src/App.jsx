import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import { OrderConfirmPage } from './pages/OrderConfirmPage';
import { AccountPage } from './pages/AccountPage';
import { AdminDashboard } from './pages/AdminDashboard';
import AuthPage from './pages/AuthPage';
import OAuthSuccess, { NotFoundPage } from './pages/OAuthSuccess';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-navy-900">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage mode="register" />} />
            <Route path="/oauth-success" element={<OAuthSuccess />} />
            <Route path="/checkout" element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
            <Route path="/order-confirm/:id" element={<PrivateRoute><OrderConfirmPage /></PrivateRoute>} />
            <Route path="/account" element={<PrivateRoute><AccountPage /></PrivateRoute>} />
            <Route path="/admin/*" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
