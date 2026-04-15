import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// ─── Request Interceptor — attach JWT ─────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('crm_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response Interceptor — handle 401 ───────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('crm_token')
      localStorage.removeItem('crm_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register:       (data) => api.post('/auth/register', data),
  login:          (data) => api.post('/auth/login', data),
  getMe:          ()     => api.get('/auth/me'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword:  (data) => api.post('/auth/reset-password', data),
  changePassword: (data) => api.put('/auth/change-password', data),
}

// ─── Customers ────────────────────────────────────────────────────────────────
export const customerAPI = {
  getAll:  (params) => api.get('/customers', { params }),
  getOne:  (id)     => api.get(`/customers/${id}`),
  create:  (data)   => api.post('/customers', data),
  update:  (id, data) => api.put(`/customers/${id}`, data),
  remove:  (id)     => api.delete(`/customers/${id}`),
}

// ─── Leads ────────────────────────────────────────────────────────────────────
export const leadAPI = {
  getAll:  (params) => api.get('/leads', { params }),
  getOne:  (id)     => api.get(`/leads/${id}`),
  create:  (data)   => api.post('/leads', data),
  update:  (id, data) => api.put(`/leads/${id}`, data),
  remove:  (id)     => api.delete(`/leads/${id}`),
}

// ─── Deals ────────────────────────────────────────────────────────────────────
export const dealAPI = {
  getAll:   (params) => api.get('/deals', { params }),
  getOne:   (id)     => api.get(`/deals/${id}`),
  getKanban:()       => api.get('/deals/kanban'),
  create:   (data)   => api.post('/deals', data),
  update:   (id, data) => api.put(`/deals/${id}`, data),
  remove:   (id)     => api.delete(`/deals/${id}`),
}

// ─── Tasks ────────────────────────────────────────────────────────────────────
export const taskAPI = {
  getAll:  (params) => api.get('/tasks', { params }),
  getOne:  (id)     => api.get(`/tasks/${id}`),
  create:  (data)   => api.post('/tasks', data),
  update:  (id, data) => api.put(`/tasks/${id}`, data),
  remove:  (id)     => api.delete(`/tasks/${id}`),
}

// ─── Communications ───────────────────────────────────────────────────────────
export const communicationAPI = {
  getAll:  (params) => api.get('/communications', { params }),
  create:  (data)   => api.post('/communications', data),
  remove:  (id)     => api.delete(`/communications/${id}`),
}

// ─── Files ────────────────────────────────────────────────────────────────────
export const fileAPI = {
  getAll:         (params) => api.get('/files', { params }),
  uploadSingle:   (formData) => api.post('/files/single', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadMultiple: (formData) => api.post('/files/multiple', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove:         (id)   => api.delete(`/files/${id}`),
}

// ─── Reports ─────────────────────────────────────────────────────────────────
export const reportAPI = {
  getDashboard:          ()       => api.get('/reports/dashboard'),
  getSalesReport:        (params) => api.get('/reports/sales', { params }),
  getEmployeePerformance:()       => api.get('/reports/employees'),
}

// ─── Notifications ────────────────────────────────────────────────────────────
export const notificationAPI = {
  getAll:     () => api.get('/notifications'),
  markAllRead:() => api.put('/notifications/mark-all'),
  markOneRead:(id) => api.put(`/notifications/${id}/read`),
  remove:     (id) => api.delete(`/notifications/${id}`),
}

// ─── Users ───────────────────────────────────────────────────────────────────
export const userAPI = {
  getAll:       (params) => api.get('/users', { params }),
  getOne:       (id)     => api.get(`/users/${id}`),
  update:       (id, data) => api.put(`/users/${id}`, data),
  toggleStatus: (id)     => api.patch(`/users/${id}/toggle`),
  updateProfile:(data)   => api.put('/users/profile', data),
}

export default api
