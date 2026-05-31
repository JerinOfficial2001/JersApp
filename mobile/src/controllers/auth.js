import AsyncStorage from '@react-native-async-storage/async-storage';
import {expressApi} from '../api';
import {ToastAndroid} from 'react-native';
import apiClient from '../services/apiClient';

/** Read raw text and throw a clear error if server returned HTML */
const safeJson = async response => {
  const text = await response.text();
  if (!text || text.trim().startsWith('<')) {
    throw new Error(
      `Server returned HTML. Status: ${response.status}. Verify server URL: ${expressApi}`,
    );
  }
  return JSON.parse(text);
};

/**
 * Login flow:
 * 1. POST /api/auth/login → receive full user object + accessToken
 * 2. Store token and userData in AsyncStorage
 * 3. Return the full user data object
 */
export const login = async (mobNum, password, props) => {
  try {
    const response = await fetch(`${expressApi}/api/auth/login`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json', Accept: 'application/json'},
      body: JSON.stringify({mobNum, password}),
    });
    const data = await safeJson(response);

    if (data.status === 'ok' && data.data) {
      const userData = data.data;
      const token = userData.accessToken;

      // Store both token and full user data
      await AsyncStorage.setItem('token', JSON.stringify(token));
      await AsyncStorage.setItem('userData', JSON.stringify(userData));

      // Acknowledge token to server (optional endpoint)
      fetch(`${expressApi}/api/auth/token`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({token}),
      }).catch(() => null);

      return data;
    } else if (data.status === 'error' && data.message === 'User not found') {
      if (props?.navigation) {
        props.navigation.navigate('Register', {mobNum, password});
      }
    } else {
      ToastAndroid.show(data.message || 'Login failed', ToastAndroid.SHORT);
    }
    return data;
  } catch (error) {
    console.error('Error at Login:', error.message);
    ToastAndroid.show(
      error.message.includes('HTML')
        ? `Cannot reach server at ${expressApi}. Check IP & ensure server is running.`
        : error.message || 'Login failed',
      ToastAndroid.LONG,
    );
  }
};

export const register = async (Data, formData) => {
  try {
    const {data} = await apiClient.post('/api/auth/register', formData, {
      headers: {'Content-Type': 'multipart/form-data'},
    });
    return data;
  } catch (error) {
    console.error('Error at Register:', error.message);
    const msg =
      error.response?.data?.message ||
      'Registration failed. Check server connection.';
    ToastAndroid.show(msg, ToastAndroid.LONG);
    return {status: 'error', message: msg};
  }
};

export const getAllUsers = async () => {
  try {
    const {data} = await apiClient.get('/api/auth/getUsers');
    if (data.status === 'ok') return data.data;
    console.log('getAllUsers err:', data.message);
    return [];
  } catch (error) {
    console.error('getAllUsers Err:', error.message);
    return [];
  }
};

export const GetUsersByID = async id => {
  try {
    const {data} = await apiClient.get(`/api/auth/get/${id}`);
    if (data.status === 'ok') return data.data;
    ToastAndroid.show(data.message, ToastAndroid.SHORT);
  } catch (error) {
    console.error('GetUsersByID Err:', error.message);
  }
};

export const logoutWithToken = async () => {
  try {
    await apiClient.post('/api/auth/logout', {});
    await AsyncStorage.multiRemove(['token', 'userData']);
    return {status: 'ok'};
  } catch (error) {
    console.error('Logout Err:', error.message);
    // Still clear local storage even if server call fails
    await AsyncStorage.multiRemove(['token', 'userData']);
    return {status: 'ok'};
  }
};

export const UpdateProfile = async ({formData, id}) => {
  try {
    const {data} = await apiClient.put(`/api/auth/update/${id}`, formData, {
      headers: {'Content-Type': 'multipart/form-data'},
    });
    return data;
  } catch (error) {
    console.error('UpdateProfile Err:', error.message);
    ToastAndroid.show(
      error.response?.data?.message || 'Update failed',
      ToastAndroid.SHORT,
    );
  }
};

export const UpdateThemeByID = async formData => {
  try {
    const {data} = await apiClient.post(
      `/api/auth/updateTheme/${formData.id}`,
      formData.data,
    );
    if (data?.status === 'ok') {
      ToastAndroid.show(data.message || 'Theme updated', ToastAndroid.SHORT);
    } else {
      ToastAndroid.show(
        data?.message || 'Something went wrong',
        ToastAndroid.SHORT,
      );
    }
  } catch (error) {
    console.error('UpdateThemeByID Err:', error.message);
    ToastAndroid.show('Failed to update theme', ToastAndroid.SHORT);
  }
};

export const GetUsersFromIds = async Ids => {
  if (!Ids || Ids.length === 0) return [];
  try {
    // Wrap in { ids: [...] } to match server's req.body.ids expectation
    const {data} = await apiClient.post('/api/auth/getByIds', {ids: Ids});
    if (data?.status === 'ok') return data.data;
    ToastAndroid.show(data.message, ToastAndroid.SHORT);
    return [];
  } catch (error) {
    console.error('GetUsersFromIds Err:', error.message);
    return [];
  }
};
