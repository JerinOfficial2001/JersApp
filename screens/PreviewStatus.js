import React, {useState} from 'react';
import {Image, StyleSheet, TextInput, View} from 'react-native';
import {ActivityIndicator, IconButton, MD2Colors} from 'react-native-paper';
import Video from 'react-native-video';
import {AddStatus} from '../src/controllers/status';

export default function PreviewStatus({route, ...props}) {
  const {image, video, id} = route.params;
  const [isLoading, setisLoading] = useState(false);
  const [inputDatas, setinputDatas] = useState({
    file:
      image !== null
        ? {
            uri: image?.uri,
            type: 'image/jpeg',
            name: 'image.jpg',
          }
        : {
            uri: video?.uri,
            type: 'video/mp4',
            name: 'video.mp4',
          },
    text: '',
    userID: id,
  });
  const handleFormData = (name, value) => {
    setinputDatas(prev => ({...prev, [name]: value}));
  };
  const handleSubmit = () => {
    setisLoading(true);
    if (inputDatas.video !== null || inputDatas.image !== null) {
      const formData = new FormData();

      Object.entries(inputDatas).forEach(([key, value]) =>
        formData.append(key, value),
      );
      AddStatus(formData).then(data => {
        if (data.status == 'ok') {
          props.navigation.navigate('Home');
          setisLoading(false);
        }
      });
    }
  };
  return (
    <View style={{flex: 1}}>
      {isLoading ? (
        <View
          style={{
            width: '100%',
            alignItems: 'center',
            height: '100%',
            justifyContent: 'center',
          }}>
          <ActivityIndicator
            animating={true}
            color={MD2Colors.green400}
            size="large"
          />
        </View>
      ) : (
        <View style={styles.content}>
          {image && (
            <Image
              alt="img"
              source={{uri: inputDatas.file.uri}}
              style={{width: '100%', height: '80%'}}
            />
          )}
          {video && (
            <Video
              source={{uri: video.uri}}
              style={{width: '100%', height: '80%'}}
              // resizeMode="cover"
              controls
              paused={false}
            />
          )}
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Message"
              style={{
                backgroundColor: '#2d383e',
                color: 'white',
                borderRadius: 30,
                width: '80%',
                padding: 15,
              }}
              value={inputDatas.text ? inputDatas.text : ''}
              onChangeText={value => {
                handleFormData('text', value);
              }}
            />

            <IconButton
              onPress={handleSubmit}
              style={{backgroundColor: '#008069', padding: 10}}
              size={38}
              icon={() => <Image source={require('../src/assets/send.png')} />}
            />
          </View>
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  content: {
    flexDirection: 'column',
    justifyContent: 'space-between',
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
  inputContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 3,
  },
  sendBtn: {
    backgroundColor: '#14a95f',
    padding: 15,
    borderRadius: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
