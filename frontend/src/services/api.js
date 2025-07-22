import axios from 'axios';

const API_URL = 'http://localhost:8000';

// Create axios instance with credentials support
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Problem-related endpoints
export const problemService = {
  getAllProblems: () => api.get('/problems'),
  getProblem: (problemCode) => api.get(`/problems/${problemCode}`),
  submitSolution: (problemCode, data) => api.post(`/submission`, {
    problemCode,
    ...data
  })
};

// Auth-related endpoints
export const authService = {
  login: (credentials) => api.post('/login', credentials),
  register: (userData) => api.post('/register', userData),
  logout: () => api.post('/logout')
};

export default api;