import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 1 },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1E293B', color: '#F8FAFC', border: '1px solid #334155', borderRadius: '12px' },
          success: { iconTheme: { primary: '#10B981', secondary: '#F8FAFC' } },
          error: { iconTheme: { primary: '#EF4444', secondary: '#F8FAFC' } },
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>
);
