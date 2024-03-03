import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, ToastAndroid, View} from 'react-native';
import {requestCameraPermission} from '../src/controllers/permissions';
import QRCodeScanner from 'react-native-qrcode-scanner';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';
import {Button} from 'react-native-paper';
import {webAuthentication} from '../src/controllers/token';
export default function QRScanner() {
  const [QRdata, setQRdata] = useState([]);
  const [isQRenabled, setisQRenabled] = useState(false);
  // useFocusEffect(
  //   React.useCallback(() => {
  //     if (QRdata !== '') {

  //     }
  //   }, []),
  // );
  const postAuthID = QRdata => {
    AsyncStorage.getItem('token').then(data => {
      if (QRdata) {
        const parserdArr = JSON.parse(QRdata);
        const parsedToken = JSON.parse(data);
        webAuthentication({token: parsedToken, tokenArr: parserdArr}).then(
          res => {
            if (res.status === 'ok') {
              ToastAndroid.show('Web Linked', ToastAndroid.SHORT);
            } else {
              console.log('not logged');
            }
          },
        );
      }
    });
  };
  useEffect(() => {
    requestCameraPermission();
  }, []);

  return (
    <View style={styles.container}>
      {!isQRenabled ? (
        <View>
          <Text style={{color: 'black'}}>{QRdata}</Text>
          <Button
            onPress={() => {
              setisQRenabled(true);
            }}>
            Scan
          </Button>
        </View>
      ) : (
        <View>
          <Button
            onPress={() => {
              setisQRenabled(false);
            }}>
            Close
          </Button>
          <QRCodeScanner
            onRead={data => {
              setQRdata(data.data);
              setisQRenabled(false);
              postAuthID(data.data);
            }}
            cameraStyle={styles.camera}
          />
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
});
