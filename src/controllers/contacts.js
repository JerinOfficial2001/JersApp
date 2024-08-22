import {Alert, Linking, PermissionsAndroid, ToastAndroid} from 'react-native';
import Contacts from 'react-native-contacts';
import {expressApi} from '../api';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {GET_FROM_STORAGE} from '../../utils/ayncStorage/getAndSet';

export const requestContactsPermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
      {
        title: 'Contacts Permission',
        message: 'This app needs access to your contacts.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      const response = await Contacts.getAll();
      return response;
    } else {
      console.log('Contacts permission denied');
    }
  } catch (err) {
    console.warn(err);
  }
};
export const requestAddContactPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_CONTACTS,
        {
          title: 'Contact Permission',
          message: 'App needs access to your contacts.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.warn(err);
    }
  }
};

export const getAccountChats = async () => {
  const userData = await GET_FROM_STORAGE('userData');
  try {
    const response = await fetch(
      expressApi + `/api/chats?user_id=${userData?._id}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
    ).then(res => res.json());
    if (response.status == 'ok') {
      return response.data;
    } else {
      return [];
    }
  } catch (error) {
    console.log(error);
  }
};
export const getContactByUserId = async () => {
  const userData = await GET_FROM_STORAGE('userData');
  try {
    const response = await fetch(
      expressApi + `/api/contact?user_id=${userData?._id}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
    ).then(res => res.json());
    if (response.status == 'ok') {
      return response.data;
    } else {
      return [];
    }
  } catch (error) {
    console.log(error);
  }
};
export const getContactByID = async id => {
  try {
    const response = await fetch(expressApi + `/api/contact/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }).then(res => res.json());
    if (response.status == 'ok') {
      return response.data;
    } else {
      return null;
    }
  } catch (error) {
    console.log(error);
  }
};
export const addChat = async (id, props) => {
  const userData = await GET_FROM_STORAGE('userData');
  if (userData) {
    try {
      const {data} = await axios.post(
        expressApi + '/api/contact?userID=' + userData._id,
        {id},
        {
          headers: {
            Authorization: `Bearer ${userData.accessToken}`,
          },
        },
      );

      if (data.status == 'error') {
        return data;
      } else {
        if (data.status == 'ok') {
          props.navigation.navigate('Home');
        } else {
          console.log(data);
        }
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    ToastAndroid.show('Un-authenticated', ToastAndroid.SHORT);
  }
};
export const deleteContactById = async (sender_id, receiver_id, contact_id) => {
  try {
    const response = await fetch(
      expressApi +
        `/api/contact?sender_id=${sender_id}&receiver_id=${receiver_id}&Contact_id=${contact_id}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
    ).then(res => res.json());

    return response;
  } catch (error) {
    console.log(error);
  }
};
export const addAndGetAllContact = async query => {
  const contacts = {contacts: query};
  const cachedData = await AsyncStorage.getItem('userData');
  const userData = cachedData ? JSON.parse(cachedData) : false;
  if (userData) {
    try {
      const {data} = await axios.post(
        expressApi + '/api/addAndGetAllContacts?userID=' + userData._id,
        contacts,
        {
          headers: {
            Authorization: `Bearer ${userData.accessToken}`,
          },
        },
      );
      if (data.status == 'ok') {
        return data.data;
      } else {
        ToastAndroid.show(data.message, ToastAndroid.SHORT);
        return [];
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    ToastAndroid.show('Un-Authorized', ToastAndroid.SHORT);
    return [];
  }
};
