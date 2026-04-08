/**
 * API Client for Cloud FinOps AI Optimizer
 * Centralized axios instance with base URL and error handling.
 */

import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('finops_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API Methods
export const fetchDailyCosts = (startDate, endDate) => {
  const params = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  return api.get('/cost/daily', { params });
};

export const fetchCostBreakdown = (startDate, endDate) => {
  const params = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  return api.get('/cost/breakdown', { params });
};

export const fetchMonthlyCosts = () => api.get('/cost/monthly');
export const fetchForecast = (days = 14) => api.get('/forecast', { params: { days } });
export const fetchAnomalies = () => api.get('/anomalies');
export const fetchIdleResources = () => api.get('/resources/idle');
export const fetchRecommendations = () => api.get('/recommendations');
export const fetchBudget = () => api.get('/budget');
export const setBudget = (monthlyLimit, alertThreshold = 80) =>
  api.post('/budget', { monthly_limit: monthlyLimit, alert_threshold: alertThreshold });
export const fetchInsights = () => api.get('/insights');
export const fetchSavings = () => api.get('/savings');
export const login = (email, password) => api.post('/auth/login', { email, password });
export const signup = (email, password, fullName) =>
  api.post('/auth/signup', { email, password, full_name: fullName });

export default api;
