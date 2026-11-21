import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/config';

const api = axios.create({ baseURL: API_URL, timeout: 15000 });

// Ajoute automatiquement le token JWT à chaque requête
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Session expirée : le contexte d'authentification s'abonne via setUnauthorizedHandler
let onUnauthorized = null;
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}
api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401 && onUnauthorized) onUnauthorized();
    return Promise.reject(error);
  }
);

export default api;
