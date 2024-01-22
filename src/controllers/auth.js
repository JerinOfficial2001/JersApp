import AsyncStorage from '@react-native-async-storage/async-storage';
import {iprotecsLapIP} from '../api';

export const login = async (mobNum, password, props) => {
  try {
    const response = await fetch(iprotecsLapIP + '/api/auth/login', {
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

      const userDataResponse = await fetch(
        iprotecsLapIP + '/api/auth/getUserData',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const userData = await userDataResponse.json();

      if (userData.status === 'ok') {
        // Store user data in AsyncStorage
        AsyncStorage.setItem('userData', JSON.stringify(userData.data.user));

        // Check if 'userData' key exists before navigating
        AsyncStorage.getItem('userData').then(storedUserData => {
          if (storedUserData) {
            // 'userData' key exists, navigate to 'Home'
            props.navigation.navigate('Home');
          } else {
            // 'userData' key does not exist, handle accordingly
            console.error('Error: userData key not found in AsyncStorage');
          }
        });
      } else {
        console.error('Error:', userData.data);
      }
    } else if (data.status == 'error' && data.message == 'User not found') {
      props.navigation.navigate('Register', {
        mobNum: mobNum,
        password: password,
      });
    } else {
      console.error('Error:', data.data);
    }
  } catch (error) {
    console.error('Error:', error.message);
    // Handle the error appropriately (e.g., show an error message to the user)
  }
};
export const register = async (data, props) => {
  try {
    const response = await fetch(iprotecsLapIP + '/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(data),
    }).then(res => res.json());
    if (response.status == 'ok') {
      login(data.mobNum, data.password, props);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
};
export const getAllUsers = async () => {
  try {
    try {
      const response = await fetch(iprotecsLapIP + '/api/auth/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }).then(res => res.json());
      if (response.status == 'ok') {
        console.log(response);
        return response.data;
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
};
