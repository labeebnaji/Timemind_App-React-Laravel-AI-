import axios from 'axios'

// استخدم المتغير البيئي إذا كان موجوداً، وإلا استخدم localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authAPI = {
  login: (credentials) => api.post('/login', credentials),
  register: (userData) => api.post('/register', userData),
  logout: () => api.post('/logout')
}

export const tasksAPI = {
  getAll: () => api.get('/tasks'),
  create: (task) => api.post('/tasks', task),
  update: (id, task) => api.put(`/tasks/${id}`, task),
  delete: (id) => api.delete(`/tasks/${id}`),
  complete: (id) => api.patch(`/tasks/${id}/complete`),
  getAITips: (id) => api.get(`/tasks/${id}/ai-tips`)
}

export const swotAPI = {
  analyze: (data) => api.post('/swot/analyze', data),
  getHistory: () => api.get('/swot/history'),
  acceptPlan: (id) => api.post(`/swot/${id}/accept`)
}

export const goalsAPI = {
  getAll: () => api.get('/goals'),
  create: (goal) => api.post('/goals', goal),
  update: (id, goal) => api.put(`/goals/${id}`, goal),
  delete: (id) => api.delete(`/goals/${id}`),
  analyzeWithAI: (goal) => api.post('/goals/analyze', goal)
}

export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getWeekly: () => api.get('/analytics/weekly'),
  getMonthly: () => api.get('/analytics/monthly'),
  getAISuggestions: () => api.get('/analytics/ai-suggestions')
}

export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  getUnread: () => api.get('/notifications/unread'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.post('/notifications/mark-all-read'),
  generateReminders: () => api.post('/notifications/generate-reminders')
}

export const settingsAPI = {
  updateProfile: (data) => api.put('/user/profile', data),
  deleteAllTasks: () => api.delete('/tasks/delete-all'),
  deleteAccount: () => api.delete('/user/account')
}

export const chatAPI = {
  send: (data) => api.post('/chat', data)
}

export default api
