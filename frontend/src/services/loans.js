import axios from 'axios';

// Loans API runs on a separate port (loan-service). Use explicit baseURL.
const loans = axios.create({
  baseURL: 'http://127.0.0.1:5002',
  headers: { 'Content-Type': 'application/json' }
});

// Attach auth token if present (mirrors other service clients)
loans.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response interceptor to handle unauthorized errors and redirect to login
loans.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response) {
      if (err.response.status === 401) {
        // clear local auth and force login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export const loansAPI = {
  list: async (page = 1, limit = 20) => {
    const res = await loans.get(`/loans?page=${page}&limit=${limit}`);
    return res.data;
  },
  get: async (id) => {
    const res = await loans.get(`/loans/${id}`);
    return res.data;
  },
  create: async (payload) => {
    const res = await loans.post('/loans', payload);
    return res.data;
  },
  returns: async (payload) => {
    const res = await loans.post('/returns', payload);
    return res.data;
  },
  extend: async (id, payload) => {
    const res = await loans.put(`/loans/${id}/extend`, payload);
    return res.data;
  },
  updateNote: async (id, payload) => {
    const res = await loans.put(`/loans/${id}/note`, payload);
    return res.data;
  },
  cancel: async (id) => {
    const res = await loans.delete(`/loans/cancel/${id}`);
    return res.data;
  },
  clearOld: async () => {
    const res = await loans.delete('/loans/clear-old');
    return res.data;
  }
};

export default loansAPI;
