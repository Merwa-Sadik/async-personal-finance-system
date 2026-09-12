import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('finance_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const authApi = {
  login: (payload) => api.post('/auth/login', payload),
  register: (payload) => api.post('/auth/register', payload),
}

export const transactionsApi = {
  list: () => api.get('/transactions'),
  create: (payload) => api.post('/transactions', payload),
  update: (id, payload) => api.put(`/transactions/${id}`, payload),
  remove: (id) => api.delete(`/transactions/${id}`),
}

export const budgetsApi = {
  list: () => api.get('/budgets'),
  create: (payload) => api.post('/budgets', payload),
  update: (id, payload) => api.put(`/budgets/${id}`, payload),
  remove: (id) => api.delete(`/budgets/${id}`),
}

export const reportsApi = {
  summary: () => api.get('/reports/summary'),
}

export const categoriesApi = {
  list: () => api.get('/categories'),
  create: (payload) => api.post('/categories', payload),
}

export default api