import React, {useEffect, useState} from 'react';
import {Text, View, StyleSheet} from 'react-native';
import {Button, TextInput} from 'react-native-paper';
import {register} from '../../src/controllers/auth';

export default function Register({route, ...props}) {
  const {mobNum, password} = route.params;
  const [formData, setformData] = useState({
    mobNum: '',
    password: '',
    name: '',
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
  const handleSubmit = () => {
    if (
      !err &&
      formData.mobNum !== '' &&
      formData.password !== '' &&
      formData.name !== ''
    ) {
      register(formData, props);
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
        <Text style={styles.title}>Enter your phone number</Text>
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
    justifyContent: 'space-between',
    width: '100%',
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
