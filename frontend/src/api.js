import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:5000/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('espresso_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function saveAuth(token, user) {
  localStorage.setItem('espresso_token', token);
  localStorage.setItem('espresso_user', JSON.stringify(user));
}

export function getStoredUser() {
  const raw = localStorage.getItem('espresso_user');
  return raw ? JSON.parse(raw) : null;
}

export function saveUser(user) {
  localStorage.setItem('espresso_user', JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem('espresso_token');
  localStorage.removeItem('espresso_user');
}

export default api;
