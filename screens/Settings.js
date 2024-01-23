import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import {View} from 'react-native';
import {Button} from 'react-native-paper';

export default function Settings(props) {
  return (
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
      }}>
      <Button
        mode="contained"
        onPress={() => {
          AsyncStorage.removeItem('userData');
          props.navigation.navigate('Login');
        }}>
        LogOut
      </Button>
    </View>
  );
}
