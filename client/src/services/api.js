import axios from 'axios';
import { useAuthStore } from '../store';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(err.response?.data || err);
  }
);

export const authAPI = {
  register: (d) => api.post('/auth/register', d),
  login: (d) => api.post('/auth/login', d),
  getMe: () => api.get('/auth/me'),
  updateProfile: (d) => api.put('/auth/profile', d),
  addAddress: (d) => api.post('/auth/address', d),
  deleteAddress: (id) => api.delete(`/auth/address/${id}`),
  toggleWishlist: (pid) => api.post(`/auth/wishlist/${pid}`),
};

export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getCategories: () => api.get('/products/categories'),
  create: (d) => api.post('/products', d),
  update: (id, d) => api.put(`/products/${id}`, d),
  delete: (id) => api.delete(`/products/${id}`),
  addReview: (id, d) => api.post(`/products/${id}/reviews`, d),
};

export const cartAPI = {
  get: () => api.get('/cart'),
  add: (d) => api.post('/cart/add', d),
  update: (d) => api.put('/cart/update', d),
  remove: (pid, variant) => api.delete(`/cart/remove/${pid}`, { params: variant ? { variant } : {} }),
  clear: () => api.delete('/cart/clear'),
};

export const orderAPI = {
  create: (d) => api.post('/orders/create', d),
  getMyOrders: (params) => api.get('/orders/my-orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  cancel: (id) => api.post(`/orders/${id}/cancel`),
  updateStatus: (id, d) => api.put(`/orders/${id}/status`, d),
};

export const paymentAPI = {
  createIntent: (d) => api.post('/payment/create-intent', d),
  validateCoupon: (d) => api.post('/payment/validate-coupon', d),
  refund: (d) => api.post('/payment/refund', d),
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard-stats'),
  getOrders: (params) => api.get('/admin/orders', { params }),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUser: (id) => api.put(`/admin/users/${id}/status`),
};

export const uploadAPI = {
  uploadImage: (file) => {
    const fd = new FormData();
    fd.append('image', file);
    return api.post('/upload/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

export default api;
