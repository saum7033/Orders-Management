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
    const status = err?.response?.status;
    const data   = err?.response?.data;

    // 401 → token expired / invalid → force logout
    if (status === 401) {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('jwt_user');
      window.location.href = '/login';
    }

    // Detect HTML response (old backend returning whitelabel error page instead of JSON).
    // This happens when the backend hasn't been rebuilt with the latest SecurityConfig.
    const isHtmlBody = typeof data === 'string' && data.trim().startsWith('<');
    if (isHtmlBody) {
      return Promise.reject(
        Object.assign(new Error(`HTTP_${status}_HTML_RESPONSE`), { isHtmlError: true, httpStatus: status })
      );
    }

    const msg = data?.message || data?.error || err.message || 'Network error';
    return Promise.reject(new Error(msg));
  }
);

// ── Helpers ───────────────────────────────────────────────────────────────────
export function isHtmlError(e) { return e?.isHtmlError === true; }

// ── Backend health check (public endpoint, no auth) ───────────────────────────
export const healthApi = {
  check: () =>
    axios.get('/api/auth/health', { timeout: 3000 })
      .then((r) => r.data)
      .catch(() => null),
};

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (username, password) =>
    api.post('/auth/login', { username, password }).then((r) => r.data.data),
  changePassword: (currentPassword, newPassword) =>
    api.put('/auth/change-password', { currentPassword, newPassword }).then((r) => r.data),
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
  bulkSave: (rows) => api.post('/order-items/bulk', rows).then((r) => r.data.data),
};

// ─── ORDER TRANSACTIONS  (Table 3) ───────────────────────────────────────────
export const orderTransactionsApi = {
  getAll: () => api.get('/order-transactions').then((r) => r.data.data || []),
  createOne: (dto) => api.post('/order-transactions', dto).then((r) => r.data.data),
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
  bulkUpsert: (rows) => api.post('/order-transactions/bulk-upsert', rows).then((r) => r.data.data),
};

// ─── USERS  (Admin only) ──────────────────────────────────────────────────────
export const usersApi = {
  getAll:       ()        => api.get('/users').then((r) => r.data.data || []),
  createOne:    (dto)     => api.post('/users', dto).then((r) => r.data.data),
  update:       (id, dto) => api.put(`/users/${id}`, dto).then((r) => r.data.data),
  deleteOne:    (id)      => api.delete(`/users/${id}`).then((r) => r.data),
  toggleActive: (id)      => api.patch(`/users/${id}/toggle-active`).then((r) => r.data.data),
};

// ─── AUDIT LOGS  (Admin only) ─────────────────────────────────────────────────
export const auditLogsApi = {
  getAll: () => api.get('/audit-logs').then((r) => r.data.data || []),
};

// ─── ORDER SUMMARIES  (Table 2) ───────────────────────────────────────────────
export const orderSummariesApi = {
  getAll: () => api.get('/order-summaries').then((r) => r.data.data || []),
  createOne: (dto) => api.post('/order-summaries', dto).then((r) => r.data.data),
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
  bulkSave: (rows) => api.post('/order-summaries/bulk', rows).then((r) => r.data.data),
};
