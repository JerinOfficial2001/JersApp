import AsyncStorage from '@react-native-async-storage/async-storage';
import {expressApi} from '../api';
import {ToastAndroid} from 'react-native';
import axios from 'axios';

export const login = async (mobNum, password, props) => {
  try {
    const response = await fetch(expressApi + '/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({mobNum, password}),
    });
    const data = await response.json();
    // Uncomment and modify the following based on your data structure
    if (data.status === 'ok') {
      const {token} = data.data;

      const userDataResponse = await fetch(expressApi + '/api/auth/login', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const userData = await userDataResponse.json();
      const tokenRes = await fetch(expressApi + '/api/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({token}),
      }).then(res => res.json());
      if (userData) {
        if (userData.status === 'ok') {
          // Store user data in AsyncStorage
          AsyncStorage.setItem('userData', JSON.stringify(userData.data.user));
          AsyncStorage.setItem('token', JSON.stringify(token));
        } else {
          console.error('Error:', userData.data);
        }
        return userData;
      }
    } else if (data.status == 'error' && data.message == 'User not found') {
      props.navigation.navigate('Register', {
        mobNum: mobNum,
        password: password,
      });
    } else {
      ToastAndroid.show(data.message, ToastAndroid.SHORT);
    }
    return data;
  } catch (error) {
    console.error('Error at Login:', error.message);
    // Handle the error appropriately (e.g., show an error message to the user)
  }
};
export const register = async (Data, formData, props) => {
  try {
    const {data} = await axios.post(
      `${expressApi}/api/auth/register`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    if (data.status == 'ok') {
      ToastAndroid.show('Registered Successfully', ToastAndroid.SHORT);
      login(Data.mobNum, Data.password, props);
    } else {
      ToastAndroid.show(data.message, ToastAndroid.SHORT);
    }
  } catch (error) {
    console.error('Error at Register:', error.message);
  }
};
export const getAllUsers = async userID => {
  try {
    const response = await fetch(expressApi + '/api/auth/getUsers', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }).then(res => res.json());
    if (response.status == 'ok') {
      return response.data;
    } else {
      console.log('getAllUsers:', response);
    }
  } catch (error) {
    console.error('Error at getAllUsers res:', error.message);
  }
};
export const GetUsersByID = async id => {
  try {
    const {data} = await axios.get(`${expressApi}/api/auth/get/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (data.status == 'ok') {
      return data.data;
    } else {
      ToastAndroid.show(data.message, ToastAndroid.SHORT);
    }
  } catch (error) {
    console.error('GetUsersByID Err:', error.message);
  }
};
export const logoutWithToken = async token => {
  try {
    const response = await fetch(expressApi + '/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({token}),
    }).then(res => res.json());
    if (response.status == 'ok') {
      AsyncStorage.removeItem('token');
      return response;
    } else {
      ToastAndroid.show(response.message, ToastAndroid.SHORT);
    }
  } catch (error) {
    console.error('Error logout:', error.message);
  }
};
export const UpdateProfile = async DATA => {
  const {formData, id} = DATA;
  try {
    const response = await fetch(`${expressApi}/api/auth/update/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    }).then(res => res.json());

    return response;
  } catch (error) {
    console.error('Error at UpdateProfile:', error);
  }
};
