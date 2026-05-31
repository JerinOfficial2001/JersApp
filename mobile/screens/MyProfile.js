import React, {useContext, useEffect, useState} from 'react';
import {Text, View, StyleSheet, Image, ToastAndroid} from 'react-native';
import {
  ActivityIndicator,
  Avatar,
  Button,
  IconButton,
  MD2Colors,
  TextInput,
} from 'react-native-paper';
import DocumentPicker from 'react-native-document-picker';
import ProfilePicModel from '../src/components/ProfilePicModel';
import {GetUsersByID, UpdateProfile} from '../src/controllers/auth';
import {MyContext} from '../App';
import SurfaceLayout from '../src/Layouts/SurfaceLayout';
import AsyncStorage from '@react-native-async-storage/async-storage';
export default function MyProfile({route, ...props}) {
  // const [theme, settheme] = useState(JersAppThemeSchema);
  const {jersAppTheme} = useContext(MyContext);
  const [isProcessing, setisProcessing] = useState(false);
  const {id, image} = route.params;
  const [openImageModel, setopenImageModel] = useState(false);
  const [formData, setformData] = useState({
    mobNum: '',
    password: '',
    name: '',
    image: null,
    public_id: null,
    isDeleteImg: false,
  });
  const [err, seterr] = useState(false);
  const [errMsg, seterrMsg] = useState('');
  const handleFormData = (key, value) => {
    setformData(prev => ({...prev, [key]: value}));
  };
  const handlePick = async () => {
    const result = await DocumentPicker.pick({
      mode: 'open',
      presentationStyle: 'fullScreen',
      type: [DocumentPicker.types.images],
    });
    handleFormData('image', result[0]);
    if (result) {
      handleCloseModel();
    }
  };
  const convertToMultipart = new FormData();

  const handleSubmit = () => {
    if (
      !err &&
      formData.mobNum !== '' &&
      formData.password !== '' &&
      formData.name !== ''
    ) {
      handleFormData('isDeleteImg', false);

      setisProcessing(true);

      Object.entries(formData).forEach(([key, value]) =>
        convertToMultipart.append(key, value),
      );
      const DATA = {
        id,
        formData: convertToMultipart,
      };
      UpdateProfile(DATA).then(response => {
        if (response?.status == 'ok') {
          ToastAndroid.show(response.message, ToastAndroid.SHORT);
          AsyncStorage.setItem('userData', JSON.stringify(response.data));
        } else {
          ToastAndroid.show(response.message, ToastAndroid.SHORT);
        }
        setisProcessing(false);
      });
    } else {
      handleValidation('name', formData.name);
    }
  };
  const handleValidation = (name, value) => {
    if (name == 'name') {
      if (!value) {
        seterr(true);
        seterrMsg('Name is required');
      } else {
        if (value.length > 0) {
          seterr(false);
        } else {
          seterr(true);
          seterrMsg('Name is required');
        }
      }
    }
  };
  const handleOnchange = (name, value) => {
    handleValidation(name, value);
    handleFormDatas(name, value);
  };
  const handleFormDatas = (name, value) => {
    setformData(prev => ({...prev, [name]: value}));
  };

  useEffect(() => {
    GetUsersByID(id).then(data => {
      if (image) {
        setformData({
          mobNum: data.mobNum,
          password: data.password,
          name: data.name,
          image: {
            uri: image.uri,
            name: 'image.jpg',
            type: 'image/jpeg',
          },
          public_id: data.image ? data.image?.public_id : null,
          isDeleteImg: false,
        });
      } else if (!data?.image || data?.image == 'null') {
        setformData({
          mobNum: data.mobNum,
          password: data.password,
          name: data.name,
          image: image ? image : null,
          public_id: null,
          isDeleteImg: false,
        });
      } else {
        setformData({
          mobNum: data.mobNum,
          password: data.password,
          name: data.name,
          image: data.image,
          public_id: data.image.public_id,
          isDeleteImg: false,
        });
      }
    });
  }, [image]);
  const handleCloseModel = () => {
    setopenImageModel(false);
  };
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 10,
    },
    errorText: {
      color: 'red',
      fontSize: 12,
      alignSelf: 'flex-start',
      marginLeft: 20,
    },
    contentContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      flex: 1,
      gap: 20,
    },
    title: {
      fontSize: 20,
      color: jersAppTheme.themeText,
      fontWeight: '500',
    },
    input: {
      backgroundColor: 'transparent',
      width: '90%',
    },
    button: {
      backgroundColor: jersAppTheme.themeText,
    },
  });
  return (
    <SurfaceLayout>
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Add Personal Details</Text>
          <View style={{position: 'relative'}}>
            {formData.image ? (
              <Avatar.Image
                size={200}
                source={{
                  uri: formData.image.url
                    ? formData.image.url
                    : formData.image.uri,
                }}
              />
            ) : (
              <Avatar.Image
                size={200}
                source={require('../src/assets/user.png')}
              />
            )}
            <IconButton
              style={{
                bottom: 0,
                position: 'absolute',
                right: 5,
                backgroundColor: jersAppTheme.badgeColor,
                padding: 10,
              }}
              icon={() => (
                <Image
                  style={{
                    height: 25,
                    width: 25,
                  }}
                  source={require('../src/assets/camera.png')}
                />
              )}
              size={40}
              onPress={() => {
                setopenImageModel(true);
              }}
            />
          </View>
          <View style={{width: '100%', alignItems: 'center'}}>
            <TextInput
              value={formData.name}
              onChangeText={value => {
                handleOnchange('name', value);
              }}
              style={styles.input}
              underlineColor="gray"
              activeUnderlineColor="#92d4c7"
              placeholder="Name"
              keyboardType="default"
              textColor={jersAppTheme.title}
              error={err}
            />
            {err && <Text style={styles.errorText}>{errMsg}</Text>}
          </View>
        </View>
        <Button
          onPress={handleSubmit}
          mode="contained"
          style={styles.button}
          textColor={jersAppTheme.main}>
          {isProcessing ? (
            <ActivityIndicator animating={true} color={jersAppTheme.appBar} />
          ) : (
            'Submit'
          )}
        </Button>
        <ProfilePicModel
          handleDltProfilePic={() => {
            handleFormData('image', null);
            handleFormData('isDeleteImg', true);
            handleCloseModel();
          }}
          isDeleteEnable={formData.image !== null && formData.image !== 'null'}
          visible={openImageModel}
          setVisible={setopenImageModel}
          handlePick={handlePick}
          handleCamera={() => {
            handleCloseModel();
            props.navigation.navigate('AddStatus', {
              onlyCamera: true,
              id,
            });
          }}
        />
      </View>
    </SurfaceLayout>
  );
}
