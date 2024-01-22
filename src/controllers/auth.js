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

    if (!response.ok) {
      // Handle non-OK responses (e.g., 4xx or 5xx errors)
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    // Uncomment and modify the following based on your data structure

    if (data.status === 'ok') {
      const {token} = data.data;

      const userDataResponse = await fetch(
        'http://192.168.208.174:4000/api/auth/getUserData',
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
            console.log(storedUserData);
          } else {
            // 'userData' key does not exist, handle accordingly
            console.error('Error: userData key not found in AsyncStorage');
          }
        });
      } else {
        console.error('Error:', userData.data);
      }
    } else {
      console.error('Error:', data.data);
    }
  } catch (error) {
    console.error('Error:', error.message);
    // Handle the error appropriately (e.g., show an error message to the user)
  }
};
