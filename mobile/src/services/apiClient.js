/**
 * Centralized API client for JersApp mobile.
 * Automatically injects the stored JWT token into every request.
 * No more manual token passing in every controller.
 */
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ToastAndroid} from 'react-native';
import {expressApi} from '../api';

const apiClient = axios.create({
  baseURL: expressApi,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor — attach token automatically
apiClient.interceptors.request.use(
  async config => {
    try {
      const tokenStr = await AsyncStorage.getItem('token');
      const token = tokenStr ? JSON.parse(tokenStr) : null;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // proceed without token
    }
    return config;
  },
  error => Promise.reject(error),
);

// Response interceptor — handle 401 globally
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const status = error.response?.status;
    if (status === 401) {
      // Token expired or invalid — clear storage
      await AsyncStorage.multiRemove(['token', 'userData']);
      ToastAndroid.show('Session expired. Please log in again.', ToastAndroid.LONG);
    }
    return Promise.reject(error);
  },
);

export default apiClient;
