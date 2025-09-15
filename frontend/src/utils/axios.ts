import axios from 'axios';

// Buat instance axios
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // PENTING: Untuk mengirim cookies
});

// Interceptor request: inject token otomatis
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor response: tangani unauthorized / error global
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized, bisa redirect ke login atau hapus token
      console.warn('Unauthorized, redirecting to login...');
      localStorage.removeItem('token');// Atau gunakan navigate() jika di React component
    }

    // Tambahkan log error lainnya jika perlu
    return Promise.reject(error);
  }
);

export default api;
