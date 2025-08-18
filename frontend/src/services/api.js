import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5001/api', // User service URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/users/login', credentials);
    return response.data;
  },

  // Get current user profile
  getProfile: async () => {
    const response = await api.get('/me');
    return response.data;
  },

  // Update user profile
  updateProfile: async (userId, userData) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },

  // Change password
  changePassword: async (userId, passwordData) => {
    const response = await api.put(`/users/${userId}/password`, passwordData);
    return response.data;
  },

  // Get all users (admin only)
  getUsers: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  // Get user by ID
  getUser: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  }
  ,
  // Delete user by ID (admin or self)
  deleteUser: async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },

  // Delete inactive users (admin)
  deleteInactiveUsers: async () => {
    const response = await api.delete('/users/inactive');
    return response.data;
  }
};

export default api;
