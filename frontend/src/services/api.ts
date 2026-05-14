import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, '');

if (!API_BASE) {
  throw new Error('VITE_API_URL is not configured. Add it to frontend/.env.');
}

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const paperAPI = {
  uploadPaper: (formData: FormData) =>
    api.post('/papers/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getPaperStatus: (paperId: string) =>
    api.get(`/papers/${paperId}/status`),

  getPaper: (paperId: string) =>
    api.get(`/papers/${paperId}`),
};

export default api;
