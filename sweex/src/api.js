const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body.error || (body.errors && body.errors[0]) || `Request failed: ${res.status}`);
    err.errors = body.errors;
    err.status = res.status;
    throw err;
  }
  return body;
}

export const api = {
  // Auth
  me: () => request('/auth/me'),
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  checkResetToken: (token) => request(`/auth/reset-password/${token}`),
  resetPassword: (token, payload) => request(`/auth/reset-password/${token}`, { method: 'POST', body: JSON.stringify(payload) }),
  updateProfile: (payload) => request('/auth/profile', { method: 'PATCH', body: JSON.stringify(payload) }),
  changePassword: (payload) => request('/auth/change-password', { method: 'POST', body: JSON.stringify(payload) }),

  // Dashboard
  getDashboard: () => request('/dashboard'),

  // Materials
  getMeta: () => request('/materials/meta'),
  getMaterials: (params = {}) => {
    const qs = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v))).toString();
    return request(`/materials${qs ? `?${qs}` : ''}`);
  },
  getMyMaterials: () => request('/materials/mine'),
  getMaterial: (id) => request(`/materials/${id}`),
  addMaterial: (payload) => request('/materials', { method: 'POST', body: JSON.stringify(payload) }),
  findMatches: (id) => request(`/materials/${id}/find-matches`, { method: 'POST' }),

  // Matches
  getMatches: () => request('/matches'),
  updateMatch: (id, action) => request(`/matches/${id}/${action}`, { method: 'POST' }),

  // Admin
  getUsers: () => request('/users'),
  getStats: () => request('/stats'),

  // Geocoding
  reverseGeocode: (lat, lng) => request(`/reverse-geocode?lat=${lat}&lng=${lng}`),
};
