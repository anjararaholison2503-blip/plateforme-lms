import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Ajoute automatiquement le token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Gestion centralisée des erreurs + refresh automatique
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Token expiré → refresh automatique
    if (
      error.response?.status === 401 &&
      error.response?.data?.code === 'TOKEN_EXPIRED' &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });

        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);

        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    const { code, message, details } = error.response?.data || {};

    const errorMessages = {
      INVALID_CREDENTIALS: 'Email ou mot de passe incorrect.',
      EMAIL_ALREADY_EXISTS: 'Cet email est déjà utilisé.',
      UNAUTHORIZED: 'Vous devez être connecté.',
      FORBIDDEN: 'Accès refusé.',
      INVALID_HIERARCHY: 'Hiérarchie invalide entre ces unités.',
      DUPLICATE_UNIT_CODE: 'Ce code est déjà utilisé.',
      UNIT_HAS_DEPENDENCIES: 'Cette unité contient des dépendances.',
      ESTABLISHMENT_ALREADY_EXISTS: 'Un établissement existe déjà.',
      VALIDATION_ERROR: 'Données invalides.',
      INTERNAL_ERROR: 'Une erreur interne est survenue.',
    };

    return Promise.reject({
      ...error,
      userMessage: errorMessages[code] || message || 'Une erreur est survenue.',
      errorCode: code,
      details,
    });
  }
);

export default api;