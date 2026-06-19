const API = '/api';

function getToken() {
  return localStorage.getItem('token');
}

function setAuth(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function getUser() {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || 'Error en la solicitud');
  }

  return data;
}

export const api = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/auth/me'),

  getAccounts: () => request('/accounts'),
  getPlatforms: () => request('/accounts/platforms'),
  createAccount: (body) => request('/accounts', { method: 'POST', body: JSON.stringify(body) }),
  updateAccount: (id, body) => request(`/accounts/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteAccount: (id) => request(`/accounts/${id}`, { method: 'DELETE' }),

  getPosts: (status) => request(status ? `/posts?status=${status}` : '/posts'),
  getStats: () => request('/posts/stats'),
  getPost: (id) => request(`/posts/${id}`),
  createPost: (body) => request('/posts', { method: 'POST', body: JSON.stringify(body) }),
  updatePost: (id, body) => request(`/posts/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  publishPost: (id) => request(`/posts/${id}/publish`, { method: 'POST' }),
  deletePost: (id) => request(`/posts/${id}`, { method: 'DELETE' }),
};

export { setAuth };
