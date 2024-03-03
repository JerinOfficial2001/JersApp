import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import {requestCameraPermission} from '../src/controllers/permissions';
export default function QRScanner() {
  const [isCameraAllowed, setisCameraAllowed] = useState(false);
  const [QRdata, setQRdata] = useState('');
  useEffect(() => {
    requestCameraPermission().then(res => {
      setisCameraAllowed(res == 'granted');
    });
  }, []);

  return <View>{/* <QRCodeScanner /> */}</View>;
}
