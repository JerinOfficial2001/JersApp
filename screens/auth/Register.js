import React, {useContext, useEffect, useState} from 'react';
import {Text, View, StyleSheet, ToastAndroid} from 'react-native';
import {ActivityIndicator, Avatar, Button, TextInput} from 'react-native-paper';
import {login, register} from '../../src/controllers/auth';
import DocumentPicker from 'react-native-document-picker';
import SurfaceLayout from '../../src/Layouts/SurfaceLayout';
import {MyContext} from '../../App';
export default function Register({route, ...props}) {
  const {jersAppTheme} = useContext(MyContext);
  const {mobNum, password} = route.params;
  const [formData, setformData] = useState({
    mobNum: '',
    password: '',
    name: '',
    image: null,
  });
  const [isLoading, setisLoading] = useState(false);
  useEffect(() => {
    setformData({
      ...formData,
      mobNum: mobNum,
      password: password,
    });
  }, []);

  const [err, seterr] = useState(false);
  const [errMsg, seterrMsg] = useState('');
  const handleFormData = (key, value) => {
    setformData(prev => ({...prev, [key]: value}));
  };
  const handlePick = async () => {
    if (formData.image == null) {
      const result = await DocumentPicker.pick({
        mode: 'open',
        presentationStyle: 'fullScreen',
        type: [DocumentPicker.types.images],
      });
      handleFormData('image', result[0]);
    } else {
      handleFormData('image', null);
    }
  };
  const handleSubmit = () => {
    if (
      !err &&
      formData.mobNum !== '' &&
      formData.password !== '' &&
      formData.name !== ''
    ) {
      setisLoading(true);
      const convertToMultipart = new FormData();
      Object.entries(formData).forEach(([key, value]) =>
        convertToMultipart.append(key, value),
      );

      register(formData, convertToMultipart, props).then(data => {
        if (data.status == 'ok') {
          ToastAndroid.show('Registered Successfully', ToastAndroid.SHORT);
          login(formData.mobNum, formData.password, props);
        } else {
          ToastAndroid.show(data.message, ToastAndroid.SHORT);
        }
        setisLoading(false);
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
    setformData({...formData, [name]: value});
  };
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 10,
      marginBottom: 20, // Add marginBottom to create space between inputs and button
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
      flex: 1,
      width: '100%',
      gap: 15,
    },
    title: {
      fontSize: 20,
      color: '#008069',
      fontWeight: '500',
    },
    input: {
      backgroundColor: 'transparent',
      width: '90%',
      marginBottom: 10,
    },
    button: {
      backgroundColor: jersAppTheme.themeText,
      alignItems: 'center',
      justifyContent: 'center',
      display: 'flex',
    },
  });

  return (
    <SurfaceLayout>
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <View style={{position: 'relative'}}>
            <Avatar.Image
              size={200}
              source={
                formData.image != null
                  ? formData.image
                  : require('../../src/assets/user.png')
              }
            />
            <Button
              onPress={handlePick}
              mode="outlined"
              textColor={formData.image == null ? jersAppTheme.title : 'red'}>
              {formData.image == null ? ' Choose' : 'Remove'}
            </Button>
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
          {isLoading ? (
            <ActivityIndicator animating={true} color={jersAppTheme.title} />
          ) : (
            'Submit'
          )}
        </Button>
      </View>
    </SurfaceLayout>
  );
}
