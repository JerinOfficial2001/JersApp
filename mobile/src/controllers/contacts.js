import {PermissionsAndroid} from 'react-native';
import Contacts from 'react-native-contacts';
import apiClient from '../services/apiClient';

export const requestContactsPermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
      {
        title: 'Contacts Permission',
        message: 'JersApp needs access to your contacts to find your friends.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      const response = await Contacts.getAllWithoutPhotos();
      return response;
    } else {
      console.log('Contacts permission denied');
      return [];
    }
  } catch (err) {
    console.warn('requestContactsPermission error:', err);
    return [];
  }
};

/**
 * Fetch chats for the current user (uses apiClient → auto-injects token)
 */
export const getContactByUserId = async id => {
  try {
    const {data} = await apiClient.get(`/api/chats?user_id=${id}`);
    return data;
  } catch (error) {
    console.error('getContactByUserId Err:', error.message);
    return {status: 'error', message: error.message};
  }
};

/**
 * Add a contact and navigate to their chat.
 * Sends the contact's JersApp _id as req.body.id, userID as query param.
 */
export const addContact = async (ContactDetails, user_id, name, phone, props) => {
  try {
    // ContactDetails should be the JersApp contact document with _id
    const contactDocId = ContactDetails?._id;
    if (!contactDocId) {
      console.warn('addContact: no _id found in ContactDetails', ContactDetails);
      // Navigate to message if we have user_id reference
      if (ContactDetails?.user_id) {
        props?.navigation?.navigate('Message', {
          id: ContactDetails.user_id,
          userID: user_id,
          receiverId: ContactDetails.user_id,
          roomID: [user_id, ContactDetails.user_id].sort().join('_'),
        });
      }
      return;
    }

    const {data} = await apiClient.post(
      `/api/contact?userID=${user_id}`,
      {id: contactDocId},
    );

    if (data.status === 'error') {
      if (data.message === 'already registered') {
        props?.navigation?.navigate('Message', {
          id: data.data,
          userID: user_id,
          receiverId: data.data,
          roomID: [user_id, data.data].sort().join('_'),
        });
      } else {
        props?.navigation?.navigate('Home');
      }
    } else if (data.status === 'ok') {
      props?.navigation?.navigate('Home');
    }
  } catch (error) {
    console.error('addContact Err:', error.message);
  }
};

export const deleteContactById = async (sender_id, receiver_id, contact_id) => {
  try {
    const {data} = await apiClient.delete(
      `/api/contact?sender_id=${sender_id}&receiver_id=${receiver_id}&Contact_id=${contact_id}`,
    );
    return data;
  } catch (error) {
    console.error('deleteContactById Err:', error.message);
    return {status: 'error', message: error.message};
  }
};

/**
 * One-sided chat deletion — only removes chat from current user's list.
 * Does NOT delete messages or the chat room for the other user.
 */
export const deleteChatById = async (user_id, contact_id) => {
  try {
    const {data} = await apiClient.delete(
      `/api/chat?user_id=${user_id}&Contact_id=${contact_id}`,
    );
    return data;
  } catch (error) {
    console.error('deleteChatById Err:', error.message);
    return {status: 'error', message: error.message};
  }
};
