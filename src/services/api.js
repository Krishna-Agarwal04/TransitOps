import axios from 'axios';

// Change this to your friend's backend URL when ready (e.g., http://localhost:3000)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create central Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add JWT token automatically to every request if logged in
apiClient.interceptors.request.use((config) => {
  const saved = localStorage.getItem('transitops_user');
  if (saved) {
    const user = JSON.parse(saved);
    if (user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Centralized API Service endpoints
export const apiService = {
  // Auth API
  auth: {
    login: (email, password) => apiClient.post('/auth/login', { email, password }),
    register: (name, email, password, role) => apiClient.post('/auth/register', { name, email, password, role }),
  },

  // Vehicles API
  vehicles: {
    getAll: () => apiClient.get('/vehicles'),
    getById: (id) => apiClient.get(`/vehicles/${id}`),
    create: (data) => apiClient.post('/vehicles', data),
    update: (id, data) => apiClient.put(`/vehicles/${id}`, data),
    delete: (id) => apiClient.delete(`/vehicles/${id}`),
  },

  // Drivers API
  drivers: {
    getAll: () => apiClient.get('/drivers'),
    getById: (id) => apiClient.get(`/drivers/${id}`),
    create: (data) => apiClient.post('/drivers', data),
    update: (id, data) => apiClient.put(`/drivers/${id}`, data),
    delete: (id) => apiClient.delete(`/drivers/${id}`),
  },

  // Trips API
  trips: {
    getAll: () => apiClient.get('/trips'),
    create: (data) => apiClient.post('/trips', data),
    dispatch: (id) => apiClient.put(`/trips/${id}/dispatch`),
    complete: (id, data) => apiClient.put(`/trips/${id}/complete`, data), // e.g. final odometer, fuel consumed
    cancel: (id) => apiClient.put(`/trips/${id}/cancel`),
  },

  // Maintenance API
  maintenance: {
    getAll: () => apiClient.get('/maintenance'),
    create: (data) => apiClient.post('/maintenance', data), // puts vehicle in IN_SHOP
    close: (id, data) => apiClient.put(`/maintenance/${id}/close`, data), // returns to AVAILABLE
  },

  // Expenses & Fuel API
  expenses: {
    getAll: () => apiClient.get('/expenses'),
    create: (data) => apiClient.post('/expenses', data),
    getFuelLogs: () => apiClient.get('/expenses/fuel'),
    createFuelLog: (data) => apiClient.post('/expenses/fuel', data),
  },

  // Reports & Dashboard API
  reports: {
    getDashboardMetrics: () => apiClient.get('/reports/dashboard'),
    getAnalytics: () => apiClient.get('/reports/analytics'),
  }
};

export default apiClient;
