import axios from 'axios';

// Buat instance axios
const api = axios.create({
  baseURL:
    import.meta.env.MODE === 'production'
      ? 'https://mahirku-production.up.railway.app/api'
      : 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor request: inject token otomatis
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('neuroscan-token');
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
      localStorage.removeItem('neuroscan-token');// Atau gunakan navigate() jika di React component
    }

    // Tambahkan log error lainnya jika perlu
    return Promise.reject(error);
  }
);

export default api;
