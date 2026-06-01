import React, {useRef, useState} from 'react';
import {Text, Button, Provider as PaperProvider} from 'react-native-paper';
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import {RNCamera} from 'react-native-camera';
import DocumentPicker from 'react-native-document-picker';

export default function AddStatus({route, ...props}) {
  const {onlyCamera, id, group} = route.params;
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
      const results = await DocumentPicker.pick({
        type: [DocumentPicker.types.images, DocumentPicker.types.video],
        allowMultiSelection: true,
      });
      const result = results.map(img => img);
      handleFormData('image', result);
      if (result) {
        if (!onlyCamera) {
          props.navigation.navigate('PreviewStatus', {
            image: result,
            id,
            video: null,
          });
        } else if (group) {
          props.navigation.navigate('CreateGroup', {
            image: result,
          });
        } else {
          props.navigation.navigate('MyProfile', {
            image: result,
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
        console.log('Photo captured');
        if (!onlyCamera) {
          props.navigation.navigate('PreviewStatus', {
            image: [data],
            id,
            video: null,
          });
        } else if (group) {
          props.navigation.navigate('CreateGroup', {
            image: data,
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
        <View style={styles.recordingBadge}>
          <View style={styles.recordingDot} />
          <Text style={styles.recordingTime}>{formatTime(recordingTime)}</Text>
        </View>
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
              marginTop: 20,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              borderRadius: 30,
              padding: 4,
              width: 180,
              alignSelf: 'center'
            }}>
            <Button
              onPress={handleCameraFunction}
              textColor="white"
              style={{
                borderRadius: 25,
                backgroundColor: !isTakePhoto ? 'rgba(255,255,255,0.2)' : 'transparent',
                flex: 1,
              }}
              labelStyle={{ fontSize: 13, fontWeight: !isTakePhoto ? '700' : '500' }}>
              Video
            </Button>
            <Button
              onPress={handleCameraFunction}
              textColor="white"
              style={{
                borderRadius: 25,
                backgroundColor: isTakePhoto ? 'rgba(255,255,255,0.2)' : 'transparent',
                flex: 1,
              }}
              labelStyle={{ fontSize: 13, fontWeight: isTakePhoto ? '700' : '500' }}>
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingLeft: 30,
    paddingRight: 30,
    paddingTop: 30,
    paddingBottom: 50,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
    width: '100%',
  },
  recordingBadge: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ff4d4d',
    marginRight: 8,
  },
  recordingTime: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
