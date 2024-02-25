import {PermissionsAndroid} from 'react-native';
import Contacts from 'react-native-contacts';
import {iprotecsLapIP} from '../api';

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
export const getContactByUserId = async id => {
  try {
    const response = await fetch(iprotecsLapIP + `/api/contact?user_id=${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }).then(res => res.json());
    return response.data;
  } catch (error) {
    console.log(error);
  }
};
export const addContact = async (
  ContactDetails,
  user_id,
  name,
  Contact_id,
  props,
) => {
  try {
    const response = await fetch(iprotecsLapIP + '/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ContactDetails, user_id, name, Contact_id}),
    }).then(res => res.json());
    if (response.status == 'error') {
      if (response.message === 'already registered') {
        props.navigation.navigate('Message', {
          id: response.data,
        });
      } else {
        return response.data;
      }
    } else {
      if (response.status == 'ok') {
        props.navigation.navigate('Home');
      } else {
        console.log(response);
      }
    }
  } catch (error) {
    console.log(error);
  }
};
export const deleteContactById = async (sender_id, receiver_id) => {
  try {
    const response = await fetch(
      iprotecsLapIP +
        `/api/contact?sender_id=${sender_id}&receiver_id=${receiver_id}`,
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
