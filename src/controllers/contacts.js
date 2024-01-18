import {PermissionsAndroid} from 'react-native';
import Contacts from 'react-native-contacts';

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
