export const formatPrice = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export const calcDiscount = (price, mrp) => Math.round((1 - price / mrp) * 100);

export const slugify = (text) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const debounce = (fn, delay) => {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
};

export const truncate = (str, n) => (str.length > n ? str.substring(0, n) + '…' : str);

export const getStatusColor = (status) => {
  const map = {
    pending: { bg: 'bg-yellow-500/15', text: 'text-yellow-400' },
    confirmed: { bg: 'bg-blue-500/15', text: 'text-blue-400' },
    processing: { bg: 'bg-purple-500/15', text: 'text-purple-400' },
    shipped: { bg: 'bg-indigo-500/15', text: 'text-indigo-400' },
    out_for_delivery: { bg: 'bg-cyan-500/15', text: 'text-cyan-400' },
    delivered: { bg: 'bg-green-500/15', text: 'text-green-400' },
    cancelled: { bg: 'bg-red-500/15', text: 'text-red-400' },
    refunded: { bg: 'bg-gray-500/15', text: 'text-gray-400' },
  };
  return map[status] || { bg: 'bg-gray-500/15', text: 'text-gray-400' };
};

export const getDeliveryPrice = (option, subtotal) => {
  if (option === 'express') return 99;
  if (option === 'same_day') return 199;
  return subtotal >= 499 ? 0 : 49;
};
