import React, {useRef, useState} from 'react';
import {Text, Button, Provider as PaperProvider} from 'react-native-paper';
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import {RNCamera} from 'react-native-camera';
import DocumentPicker from 'react-native-document-picker';

export default function AddStatus({route, ...props}) {
  const {onlyCamera, id} = route.params;
  const cameraRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isTakePhoto, setisTakePhoto] = useState(true);
  const [changeCamera, setchangeCamera] = useState(false);
  const [inputDatas, setinputDatas] = useState({
    image: null,
    video: null,
  });
  const handleFormData = (name, value) => {
    setinputDatas(prev => ({...prev, [name]: value}));
  };
  const handlePick = async () => {
    if (inputDatas.image == null) {
      const result = await DocumentPicker.pick({
        mode: 'open',
        presentationStyle: 'fullScreen',
        type: [DocumentPicker.types.images],
      });
      handleFormData('image', result[0]);
      if (result) {
        if (!onlyCamera) {
          props.navigation.navigate('PreviewStatus', {
            image: result[0],
            id,
            video: null,
          });
        } else {
          props.navigation.navigate('MyProfile', {
            image: result[0],
            id,
          });
        }
      }
    } else {
      handleFormData('image', null);
    }
  };

  const startRecording = async () => {
    if (cameraRef.current) {
      setIsRecording(true);
      setRecordingTime(0);
      const options = {quality: RNCamera.Constants.VideoQuality['1080p']};
      const interval = setInterval(() => {
        setRecordingTime(prevTime => prevTime + 1);
      }, 1000);

      try {
        const data = await cameraRef.current.recordAsync();
        console.log('Video recorded:', data.uri);
        props.navigation.navigate('PreviewStatus', {
          video: data,
          image: null,
          id,
        });
      } catch (error) {
        console.error('Failed to record video:', error);
      } finally {
        clearInterval(interval);
        setRecordingTime(0);
        setIsRecording(false);
      }
    }
  };

  const stopRecording = () => {
    if (cameraRef.current) {
      cameraRef.current.stopRecording();
    }
  };

  const takePhoto = async () => {
    if (cameraRef.current) {
      try {
        const options = {quality: 0.5, base64: false};
        const data = await cameraRef.current.takePictureAsync(options);
        console.log('Photo captured:', data);
        if (!onlyCamera) {
          props.navigation.navigate('PreviewStatus', {
            image: data,
            id,
            video: null,
          });
        } else {
          props.navigation.navigate('MyProfile', {
            image: data,
            id,
          });
        }
      } catch (error) {
        console.error('Failed to capture photo:', error);
      }
    }
  };
  const handleCameraFunction = () => {
    setisTakePhoto(!isTakePhoto);
  };
  return (
    <View style={styles.container}>
      {isRecording && (
        <Text style={styles.recordingTime}>{formatTime(recordingTime)}</Text>
      )}
      <RNCamera
        ref={cameraRef}
        style={styles.preview}
        type={
          changeCamera
            ? RNCamera.Constants.Type.front
            : RNCamera.Constants.Type.back
        }
        flashMode={RNCamera.Constants.FlashMode.off}
      />
      <View style={styles.controlsContainer}>
        <View style={styles.controls}>
          <TouchableOpacity onPress={handlePick}>
            <Image
              style={{
                height: 30,
                width: 30,
              }}
              source={require('../src/assets/image.png')}
            />
          </TouchableOpacity>
          {!isRecording && !isTakePhoto && !onlyCamera && (
            <TouchableOpacity onPress={startRecording}>
              <Image
                style={{
                  height: 60,
                  width: 60,
                }}
                source={require('../src/assets/record.png')}
              />
            </TouchableOpacity>
          )}

          {isRecording && (
            <TouchableOpacity onPress={stopRecording}>
              <Image
                style={{
                  height: 60,
                  width: 60,
                }}
                source={require('../src/assets/stop.png')}
              />
            </TouchableOpacity>
          )}
          {!isRecording && isTakePhoto && (
            <TouchableOpacity onPress={takePhoto}>
              <Image
                style={{
                  height: 70,
                  width: 70,
                }}
                source={require('../src/assets/capture.png')}
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => {
              setchangeCamera(!changeCamera);
            }}>
            <Image
              style={{
                height: 30,
                width: 30,
              }}
              source={require('../src/assets/flip.png')}
            />
          </TouchableOpacity>
        </View>
        {!onlyCamera && (
          <View
            style={{
              flexDirection: 'row',
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              padding: 10,
            }}>
            <Button
              onPress={handleCameraFunction}
              textColor="white"
              style={{
                borderRadius: 15,
                backgroundColor: !isTakePhoto ? '#5D5D5DC4' : 'transparent',
              }}>
              Video
            </Button>
            <Button
              onPress={handleCameraFunction}
              textColor="white"
              style={{
                borderRadius: 15,
                backgroundColor: isTakePhoto ? '#5D5D5DC4' : 'transparent',
              }}>
              Photo
            </Button>
          </View>
        )}
      </View>
    </View>
  );
}

const formatTime = seconds => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
    .toString()
    .padStart(2, '0')}`;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  controlsContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingLeft: 15,
    paddingRight: 15,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
    width: '100%',
  },
  capture: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    marginHorizontal: 10,
  },
  captureText: {
    fontSize: 16,
  },
  recordingTime: {
    fontSize: 18,
    color: 'red',
    marginHorizontal: 10,
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
});
