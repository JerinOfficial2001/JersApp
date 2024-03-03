import {PermissionsAndroid} from 'react-native';

export const requestCameraPermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Camera Permission',
        message: 'This app needs access to your Camera.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    console.log(granted);
    // if (granted === PermissionsAndroid.RESULTS.GRANTED) {
    //   console.log('Camera permission Granted');
    // } else {
    //   console.log('Camera permission denied');
    // }
  } catch (err) {
    console.warn(err);
  }
};
