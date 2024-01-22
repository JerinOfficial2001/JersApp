import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import {Button, View} from 'react-native';

export default function Settings(props) {
  return (
    <View>
      <Button
        onPress={() => {
          AsyncStorage.removeItem('userData');
        }}>
        LogOut
      </Button>
    </View>
  );
}
