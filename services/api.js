import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
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

// Add a response interceptor to handle 401 Unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired, clear it and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
  
  resetPassword: async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },
};

// Student API
export const studentAPI = {
  getDashboardData: async () => {
    const response = await api.get('/students/dashboard');
    return response.data;
  },
  
  getCourses: async () => {
    const response = await api.get('/students/courses');
    return response.data;
  },
  
  getCourseDetails: async (courseId) => {
    const response = await api.get(`/students/courses/${courseId}`);
    return response.data;
  },
  
  updateProgress: async (courseId, progress) => {
    const response = await api.put(`/students/courses/${courseId}/progress`, { progress });
    return response.data;
  },
};

// Instructor API
export const instructorAPI = {
  getDashboardData: async () => {
    const response = await api.get('/instructors/dashboard');
    return response.data;
  },
  
  getCourses: async () => {
    const response = await api.get('/instructors/courses');
    return response.data;
  },
  
  getCourseAnalytics: async (courseId) => {
    const response = await api.get(`/instructors/courses/${courseId}/analytics`);
    return response.data;
  },
  
  getAtRiskStudents: async (courseId) => {
    const response = await api.get(`/instructors/courses/${courseId}/at-risk`);
    return response.data;
  },
  
  sendMessageToStudent: async (studentId, message) => {
    const response = await api.post('/instructors/messages', { studentId, message });
    return response.data;
  },
};

// Course API
export const courseAPI = {
  getCourses: async (filters = {}) => {
    const response = await api.get('/courses', { params: filters });
    return response.data;
  },
  
  getCourseDetails: async (courseId) => {
    const response = await api.get(`/courses/${courseId}`);
    return response.data;
  },
  
  enrollInCourse: async (courseId) => {
    const response = await api.post(`/courses/${courseId}/enroll`);
    return response.data;
  },
};

// Payment API
export const paymentAPI = {
  createPaymentIntent: async (amount, currency = 'usd') => {
    const response = await api.post('/payments/create-payment-intent', { amount, currency });
    return response.data;
  },
  
  confirmPayment: async (paymentIntentId) => {
    const response = await api.post('/payments/confirm', { paymentIntentId });
    return response.data;
  },
  
  getPaymentHistory: async () => {
    const response = await api.get('/payments/history');
    return response.data;
  },
};

export default api;
