import React, {useContext, useState} from 'react';
import {Image, ScrollView, StyleSheet, TextInput, View} from 'react-native';
import {ActivityIndicator, IconButton, MD2Colors} from 'react-native-paper';
import Video from 'react-native-video';
import {AddStatus} from '../src/controllers/status';
import Carousel from '../src/components/Carosel';
import {JersAppThemeSchema} from '../utils/theme';
import Send from '../src/assets/svg/send';
import {MyContext} from '../App';

export default function PreviewStatus({route, ...props}) {
  const {image, video, id} = route.params;
  const [isLoading, setisLoading] = useState(false);
  // const [jersAppTheme, setjersAppTheme] = useState(JersAppThemeSchema);
  const {jersAppTheme} = useContext(MyContext);
  const getMediaSorce = image => {
    if (image !== null && image !== 'null') {
      return image?.map(img => {
        return {
          uri: img.uri,
          type: image.type ? image.type : 'image/jpeg',
          name: image.type ? image.type : 'image.jpg',
        };
      });
    } else {
      return {
        uri: video?.uri,
        type: 'video/mp4',
        name: 'video.mp4',
      };
    }
  };
  const [inputDatas, setinputDatas] = useState({
    file: getMediaSorce(image),
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
      // if (typeof image == 'object') {
      //   formData.append('file', image);
      // } else {
      if (image) {
        inputDatas.file.forEach(image => {
          formData.append('file', image);
        });
      } else {
        formData.append('file', video);
      }

      // }

      const data = {
        text: inputDatas.text,
        userID: id,
      };
      Object.entries(data).forEach(([key, value]) =>
        formData.append(key, value),
      );
      AddStatus(formData).then(data => {
        if (data.status == 'ok') {
          props.navigation.navigate('Home');
          setisLoading(false);
        } else {
          setisLoading(false);
        }
      });
    }
  };
  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'column',
        backgroundColor: jersAppTheme.main,
      }}>
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
          {image ? (
            <Carousel
              data={inputDatas.file}
              preview={true}
              navigation={props.navigation}
            />
          ) : (
            <Video
              source={{uri: video.uri}}
              style={{width: '100%', height: '80%'}}
              resizeMode="cover"
              controls
              paused={false}
            />
          )}
        </View>
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
          style={{backgroundColor: jersAppTheme.appBar, padding: 10}}
          size={38}
          icon={() => <Send color={jersAppTheme.title} />}
        />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
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
    marginBottom: 10,
  },
  sendBtn: {
    backgroundColor: '#14a95f',
    padding: 15,
    borderRadius: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
