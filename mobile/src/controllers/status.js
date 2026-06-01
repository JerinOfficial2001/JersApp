import apiClient from '../services/apiClient';
import {ToastAndroid} from 'react-native';

export const RecordStatusView = async (statusID, public_id, viewerID, viewerName) => {
  try {
    const {data} = await apiClient.post('/api/status/view', {
      statusID,
      public_id,
      viewerID,
      viewerName,
    });
    return data;
  } catch (error) {
    console.log('RecordStatusView Err:', error.message);
  }
};

export const AddTextStatus = async (userID, text, backgroundColor) => {
  try {
    const {data} = await apiClient.post('/api/status/add', {
      userID,
      text,
      backgroundColor,
    });
    if (data.status === 'ok') {
      ToastAndroid.show('Status posted', ToastAndroid.SHORT);
      return data;
    } else {
      ToastAndroid.show(data.message || 'Failed to post status', ToastAndroid.SHORT);
    }
  } catch (error) {
    console.log('AddTextStatus Err:', error.message);
    ToastAndroid.show('Failed to post status', ToastAndroid.SHORT);
  }
};

export const AddStatus = async formData => {
  try {
    const {data} = await apiClient.post('/api/status/add', formData, {
      headers: {'Content-Type': 'multipart/form-data'},
    });
    if (data.status === 'ok') {
      ToastAndroid.show('Status posted', ToastAndroid.SHORT);
      return data;
    } else {
      ToastAndroid.show(data.message || 'Failed to post status', ToastAndroid.SHORT);
    }
  } catch (error) {
    console.log('AddStatus Err:', error.message);
    ToastAndroid.show('Failed to post status', ToastAndroid.SHORT);
  }
};

export const GetAllStatus = async userID => {
  try {
    const {data} = await apiClient.get(`/api/status/get?userID=${userID}`);
    if (data.status === 'ok') return data.data;
    console.log(data.message, 'StatusERR');
    return [];
  } catch (error) {
    console.log('GetAllStatus Err:', error.message);
    return [];
  }
};

export const GetStatusByID = async id => {
  try {
    const {data} = await apiClient.get(`/api/status/get/${id}`);
    if (data.status === 'ok') return data.data;
    console.log(data.message, 'StatusERR');
  } catch (error) {
    console.log('GetStatusByID Err:', error.message);
  }
};

export const DeleteStatus = async (id, publicId = null) => {
  try {
    const url = `/api/status/delete/${id}${publicId ? `?public_id=${encodeURIComponent(publicId)}` : ''}`;
    const {data} = await apiClient.delete(url);
    if (data.status === 'ok') {
      ToastAndroid.show('Status deleted', ToastAndroid.SHORT);
      return data;
    } else {
      ToastAndroid.show(data.message || 'Failed to delete', ToastAndroid.SHORT);
    }
  } catch (error) {
    console.log('DeleteStatus Err:', error.message);
    ToastAndroid.show('Failed to delete status', ToastAndroid.SHORT);
  }
};
