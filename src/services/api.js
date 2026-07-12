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

export const getApiErrorMessage = (error, fallback = 'Request failed. Please try again.') => {
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.response?.status === 401) {
    return 'Please sign in again before saving.';
  }
  if (error?.response?.status === 403) {
    return 'This account does not have permission for this action. Sign in with the correct role.';
  }
  if (error?.code === 'ERR_NETWORK') {
    return 'Backend is not reachable. Make sure http://localhost:3000 is running.';
  }
  return error?.message || fallback;
};

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
    dispatch: (id) => apiClient.patch(`/trips/${id}/dispatch`),
    complete: (id) => apiClient.patch(`/trips/${id}/complete`),
    cancel: (id) => apiClient.patch(`/trips/${id}/cancel`),
  },

  // Maintenance API
  maintenance: {
    getAll: () => apiClient.get('/maintenance'),
    create: (data) => apiClient.post('/maintenance', data), // puts vehicle in IN_SHOP
    close: (id, data) => apiClient.patch(`/maintenance/${id}`, data), // returns to AVAILABLE
  },

  // Expenses & Fuel API
  expenses: {
    getAll: () => apiClient.get('/fuel'),
    create: (data) => apiClient.post('/fuel', data),
    getFuelLogs: () => apiClient.get('/fuel'),
    createFuelLog: (data) => apiClient.post('/fuel', data),
  },

  // Reports & Dashboard API
  reports: {
    getDashboardMetrics: () => apiClient.get('/dashboard'),
    getAnalytics: () => apiClient.get('/fuel'),
  }
};

export default apiClient;
