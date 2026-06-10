import axios from 'axios';

const BASE = '/api';

const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
});

// ── Attach JWT token to every request ────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

// ── Unwrap errors ─────────────────────────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('jwt_user');
      window.location.href = '/login';
    }
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err.message ||
      'Network error';
    return Promise.reject(new Error(msg));
  }
);

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export const authApi = {
  signup: (username, password, role) =>
    api.post('/auth/signup', { username, password, role }).then((r) => r.data.data),
  login: (username, password) =>
    api.post('/auth/login', { username, password }).then((r) => r.data.data),
};

// ─── ORDER ITEMS  (Table 1) ───────────────────────────────────────────────────
export const orderItemsApi = {
  getAll: () => api.get('/order-items').then((r) => r.data.data || []),
  createOne: (dto) => api.post('/order-items', dto).then((r) => r.data.data),
  update: (id, dto) => api.put(`/order-items/${id}`, dto).then((r) => r.data.data),
  deleteOne: (id) => api.delete(`/order-items/${id}`).then((r) => r.data),
  deleteAll: () => api.delete('/order-items').then((r) => r.data),
  preview: (file) => {
    const form = new FormData();
    form.append('file', file);
    const token = localStorage.getItem('jwt_token');
    return axios
      .post(`${BASE}/order-items/preview`, form, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      .then((r) => r.data.data || []);
  },
  bulkSave: (rows) => api.post('/order-items/bulk', rows).then((r) => r.data.data || []),
};

// ─── ORDER TRANSACTIONS  (Table 3) ───────────────────────────────────────────
export const orderTransactionsApi = {
  getAll: () => api.get('/order-transactions').then((r) => r.data.data || []),
  update: (id, dto) => api.put(`/order-transactions/${id}`, dto).then((r) => r.data.data),
  deleteOne: (id) => api.delete(`/order-transactions/${id}`).then((r) => r.data),
  deleteAll: () => api.delete('/order-transactions').then((r) => r.data),
  preview: (file) => {
    const form = new FormData();
    form.append('file', file);
    const token = localStorage.getItem('jwt_token');
    return axios
      .post(`${BASE}/order-transactions/preview`, form, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      .then((r) => r.data.data || []);
  },
  bulkUpsert: (rows) => api.post('/order-transactions/bulk-upsert', rows).then((r) => r.data.data || []),
};

// ─── ORDER SUMMARIES  (Table 2) ───────────────────────────────────────────────
export const orderSummariesApi = {
  getAll: () => api.get('/order-summaries').then((r) => r.data.data || []),
  update: (id, dto) => api.put(`/order-summaries/${id}`, dto).then((r) => r.data.data),
  deleteOne: (id) => api.delete(`/order-summaries/${id}`).then((r) => r.data),
  deleteAll: () => api.delete('/order-summaries').then((r) => r.data),
  preview: (file) => {
    const form = new FormData();
    form.append('file', file);
    const token = localStorage.getItem('jwt_token');
    return axios
      .post(`${BASE}/order-summaries/preview`, form, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      .then((r) => r.data.data || []);
  },
  bulkSave: (rows) => api.post('/order-summaries/bulk', rows).then((r) => r.data.data || []),
};
