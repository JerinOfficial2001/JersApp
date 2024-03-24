import React, {useEffect, useState} from 'react';
import {Text, View, StyleSheet} from 'react-native';
import {Avatar, Button, TextInput} from 'react-native-paper';
import {register} from '../../src/controllers/auth';
import DocumentPicker from 'react-native-document-picker';
export default function Register({route, ...props}) {
  const {mobNum, password} = route.params;
  const [formData, setformData] = useState({
    mobNum: '',
    password: '',
    name: '',
    image: null,
  });
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
      const convertToMultipart = new FormData();
      Object.entries(formData).forEach(([key, value]) =>
        convertToMultipart.append(key, value),
      );

      register(formData, convertToMultipart, props);
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
  return (
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
            style={{}}
            textColor={formData.image == null ? 'black' : 'red'}>
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
            textColor="black"
            error={err}
          />
          {err && <Text style={styles.errorText}>{errMsg}</Text>}
        </View>
      </View>
      <Button
        onPress={handleSubmit}
        mode="contained"
        style={styles.button}
        textColor="white">
        Submit
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
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
    gap: 90,
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
    backgroundColor: '#008069',
  },
});
