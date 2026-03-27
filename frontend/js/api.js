// API Configuration
const API_BASE = 'http://localhost:3000/api';

const API = {
  async request(method, endpoint, body = null, auth = true) {
    const headers = { 'Content-Type': 'application/json' };
    if (auth) {
      const token = localStorage.getItem('token');
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    const config = { method, headers };
    if (body) config.body = JSON.stringify(body);
    const res = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erro na requisição');
    return data;
  },
  get:    (ep, auth) => API.request('GET', ep, null, auth),
  post:   (ep, body, auth) => API.request('POST', ep, body, auth),
  put:    (ep, body) => API.request('PUT', ep, body),
  delete: (ep) => API.request('DELETE', ep),
};

// Toast notification
function showToast(msg, type = 'success') {
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity 0.4s'; setTimeout(() => t.remove(), 400); }, 3000);
}

// Format currency
function formatCurrency(val) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
}

// Auth helpers
function getUser() {
  try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
}
function getToken() { return localStorage.getItem('token'); }
function isAdmin() { const u = getUser(); return u && u.tipo === 'admin'; }
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '../pages/login.html';
}
