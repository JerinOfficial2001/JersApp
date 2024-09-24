import React, {useContext, useEffect, useState} from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import {requestCameraPermission} from '../src/controllers/permissions';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {useFocusEffect} from '@react-navigation/native';
import {useSocketHook} from '../utils/socket';
import SurfaceLayout from '../src/Layouts/SurfaceLayout';
import JersAppButton from '../src/components/JersAppButton';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {MyContext} from '../App';
import ContactCard from '../src/components/ContactCard';
import {getCreatedDay} from '../utils/methods/Date&Time';
import AntDesignIcons from 'react-native-vector-icons/AntDesign';
export default function QRScanner() {
  const {socketLinkWeb, socketUnLinkWeb, activeWebSessions} = useSocketHook();
  const [QRdata, setQRdata] = useState('');
  const {jersAppTheme} = useContext(MyContext);
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
      backgroundColor: jersAppTheme.main,
      width: '100%',
    },
    camera: {
      flex: 1,
      width: '100%',
    },
  });
  const handleWebAuthLogout = id => {
    socketUnLinkWeb(id);
    setQRdata('');
  };
  const browserImage = {
    chrome: require('../src/assets/browsers/chrome.png'),
    firefox: require('../src/assets/browsers/mozillaFirefox.png'),
    edge: require('../src/assets/browsers/edge.png'),
  };

  return (
    <View style={styles.container}>
      <SurfaceLayout>
        {!isQRenabled ? (
          <ScrollView
            contentContainerStyle={{
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 20,
              paddingTop: 20,
            }}>
            <Image source={require('../src/assets/linkedDevices.png')} />
            <Text style={{color: jersAppTheme.title}}>
              Use JersApp on Web, Desktop, and other devices.
            </Text>
            <JersAppButton
              onPress={() => {
                setisQRenabled(true);
              }}
              name="Link a device"
              width="90%"
            />

            {[
              {imageType: 'chrome', browser_name: 'Chrome', socket_id: 123},
              {imageType: 'edge', browser_name: 'Edge', socket_id: 123},
              {imageType: 'firefox', browser_name: 'Edge', socket_id: 123},
              {imageType: 'firefox', browser_name: 'Edge', socket_id: 123},
              {imageType: 'firefox', browser_name: 'Edge', socket_id: 123},
              {imageType: 'firefox', browser_name: 'Edge', socket_id: 123},
            ].map((elem, index) => {
              return (
                <View
                  style={{
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                  key={index}>
                  <ContactCard
                    name={elem.browser_name}
                    customImg={
                      <Image
                        source={browserImage[elem.imageType]}
                        style={{
                          height: '100%',
                          width: '100%',
                          objectFit: 'contain',
                        }}
                      />
                    }
                    lastMsg={{
                      name: 'Logged in ',
                      msg: elem?.createdAt ? getCreatedDay(elem) : '',
                    }}
                  />
                  <TouchableOpacity
                    style={{position: 'absolute', right: 10}}
                    onPress={() => {
                      handleWebAuthLogout(elem.socket_id);
                    }}>
                    <AntDesignIcons
                      style={{
                        color: 'white',
                      }}
                      name="logout"
                      size={24}
                    />
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        ) : (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
            }}>
            <TouchableOpacity
              style={{position: 'absolute', right: 10, top: 10}}
              onPress={() => {
                setisQRenabled(false);
              }}>
              <Ionicons name="close" color={jersAppTheme.title} size={25} />
            </TouchableOpacity>

            <QRCodeScanner
              onRead={data => {
                setQRdata(data.data);
                setisQRenabled(false);
                socketLinkWeb(data.data);
              }}
              cameraStyle={styles.camera}
            />
          </View>
        )}
      </SurfaceLayout>
    </View>
  );
}
