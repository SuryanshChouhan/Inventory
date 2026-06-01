import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const detail = error.response?.data?.detail;
    const message = Array.isArray(detail)
      ? detail.map((item) => item.msg).join(', ')
      : detail || error.message || 'Request failed';
    return Promise.reject(new Error(message));
  },
);

export default axiosClient;
