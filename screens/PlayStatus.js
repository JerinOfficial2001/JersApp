import {useFocusEffect} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {GetStatusByID} from '../src/controllers/status';
import Video from 'react-native-video';
import {ActivityIndicator, MD2Colors} from 'react-native-paper';

export default function PlayStatus({route, ...props}) {
  const [isLoading, setisLoading] = useState(true);
  const {id} = route.params;
  const [status, setstatus] = useState({});
  useFocusEffect(React.useCallback(() => {}, []));
  useEffect(() => {
    GetStatusByID(id).then(data => {
      setstatus(data);
    });
  }, []);
  useEffect(() => {
    if (status && status.file && status.file.format !== 'mp4') {
      setisLoading(false);
    }
  }, [status]);

  return (
    <View style={styles.content}>
      {isLoading ? (
        <View
          style={{
            width: '100%',
            alignItems: 'center',
            height: 650,
            justifyContent: 'center',
          }}>
          <ActivityIndicator
            animating={true}
            color={MD2Colors.green400}
            size="large"
          />
        </View>
      ) : status && status?.file?.format !== 'mp4' ? (
        status?.file.format !== 'mp4' && (
          <Image
            alt="img"
            source={{uri: status.file?.url}}
            style={{height: '80%', width: '100%'}}
          />
        )
      ) : (
        <View style={{flex: 1, position: 'relative'}}>
          <Video
            onLoad={() => {
              setisLoading(false);
            }}
            source={{uri: status?.file?.url}}
            style={{height: '80%', width: '100%'}}
            paused={false}
            onEnd={() => {
              props.navigation.navigate('Status');
            }}
          />
          <Text
            style={{
              position: 'absolute',
              bottom: 10,
              left: 0,
              right: 0,
              color: 'white',
            }}>
            {status?.text}
          </Text>
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  content: {
    flexDirection: 'column',
    justifyContent: 'center',
    padding: 10,
    gap: 2,
    flex: 1,
    backgroundColor: '#3D3D3DD1',
  },
  imgContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  sendBtn: {
    backgroundColor: '#14a95f',
    padding: 15,
    borderRadius: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
