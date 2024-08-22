import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, ToastAndroid, View} from 'react-native';
import {requestCameraPermission} from '../src/controllers/permissions';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {useFocusEffect} from '@react-navigation/native';
import {Button} from 'react-native-paper';
import {DarkThemeSchema} from '../utils/theme';
import {useSocketHook} from '../utils/socket';
export default function QRScanner() {
  const {socketLinkWeb} = useSocketHook();
  const [QRdata, setQRdata] = useState([]);
  const [theme, settheme] = useState(DarkThemeSchema);

  const [isQRenabled, setisQRenabled] = useState(false);
  // useFocusEffect(
  //   React.useCallback(() => {
  //     if (QRdata !== '') {

  //     }
  //   }, []),
  // );

  useEffect(() => {
    requestCameraPermission();
  }, []);
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.main,
    },
    camera: {
      flex: 1,
      width: '100%',
    },
  });
  return (
    <View style={styles.container}>
      {!isQRenabled ? (
        <View>
          <Text style={{color: theme.title}}>{QRdata}</Text>
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
              setQRdata(data.id);
              setisQRenabled(false);
              socketLinkWeb(data.id);
            }}
            cameraStyle={styles.camera}
          />
        </View>
      )}
    </View>
  );
}
