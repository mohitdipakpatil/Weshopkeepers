import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productAPI, orderAPI, adminAPI, authAPI } from '../services/api';
import toast from 'react-hot-toast';

export const useProducts = (params) =>
  useQuery({ queryKey: ['products', params], queryFn: () => productAPI.getAll(params), keepPreviousData: true });

export const useProduct = (id) =>
  useQuery({ queryKey: ['product', id], queryFn: () => productAPI.getById(id), enabled: !!id });

export const useCategories = () =>
  useQuery({ queryKey: ['categories'], queryFn: productAPI.getCategories, staleTime: Infinity });

export const useMyOrders = (params) =>
  useQuery({ queryKey: ['my-orders', params], queryFn: () => orderAPI.getMyOrders(params) });

export const useOrder = (id) =>
  useQuery({ queryKey: ['order', id], queryFn: () => orderAPI.getById(id), enabled: !!id });

export const useDashboard = () =>
  useQuery({ queryKey: ['dashboard'], queryFn: adminAPI.getDashboard });

export const useAdminOrders = (params) =>
  useQuery({ queryKey: ['admin-orders', params], queryFn: () => adminAPI.getOrders(params) });

export const useAdminUsers = (params) =>
  useQuery({ queryKey: ['admin-users', params], queryFn: () => adminAPI.getUsers(params) });

export const useAddReview = (productId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => productAPI.addReview(productId, data),
    onSuccess: () => { toast.success('Review added!'); qc.invalidateQueries(['product', productId]); },
    onError: (e) => toast.error(e.message || 'Failed to add review'),
  });
};

export const useCreateOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: orderAPI.create,
    onSuccess: () => qc.invalidateQueries(['my-orders']),
    onError: (e) => toast.error(e.message || 'Order failed'),
  });
};

export const useCancelOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: orderAPI.cancel,
    onSuccess: () => { toast.success('Order cancelled'); qc.invalidateQueries(['my-orders']); },
    onError: (e) => toast.error(e.message || 'Could not cancel order'),
  });
};

export const useUpdateOrderStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => orderAPI.updateStatus(id, data),
    onSuccess: () => { toast.success('Order updated'); qc.invalidateQueries(['admin-orders']); },
  });
};

export const useToggleUserStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminAPI.toggleUser,
    onSuccess: () => { toast.success('User status updated'); qc.invalidateQueries(['admin-users']); },
  });
};
