import React, {useState} from 'react';
import {Image, ScrollView, StyleSheet, TextInput, View} from 'react-native';
import {ActivityIndicator, IconButton, MD2Colors} from 'react-native-paper';
import Video from 'react-native-video';
import {AddStatus} from '../src/controllers/status';

export default function PreviewStatus({route, ...props}) {
  const {image, video, id} = route.params;
  const [isLoading, setisLoading] = useState(false);
  const [inputDatas, setinputDatas] = useState({
    file:
      image !== null
        ? image.map(img => ({
            uri: img?.uri,
            type: 'image/jpeg',
            name: 'image.jpg',
          }))
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
      inputDatas.file.forEach(image => {
        formData.append('file', image);
      });
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
        }
      });
    }
  };
  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#3D3D3DD1',
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
          <ScrollView>
            {inputDatas?.file?.length !== 0 &&
              inputDatas?.file.map((img, index) => {
                return (
                  <Image
                    key={index}
                    alt="img"
                    source={{uri: img.uri}}
                    style={{
                      width: 400,
                      height: 800,
                      objectFit: 'contain',
                    }}
                  />
                );
              })}
          </ScrollView>
          {/* <Carousel
            data={inputDatas.file}
            renderItem={img => {
              return (
                <Image
                  alt="img"
                  source={{uri: img.item.uri}}
                  style={{
                    width: 400,
                    height: 800,
                    objectFit: 'contain',
                  }}
                />
              );
            }}
            sliderWidth={400}
            itemWidth={400}
            layout={'default'}
          /> */}
        </View>

        // {video && (
        //   <Video
        //     source={{uri: video.uri}}
        //     style={{width: '100%', height: '80%'}}
        //     // resizeMode="cover"
        //     controls
        //     paused={false}
        //   />
        // )}
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
  },
  sendBtn: {
    backgroundColor: '#14a95f',
    padding: 15,
    borderRadius: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
