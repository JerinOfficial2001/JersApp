import AsyncStorage from '@react-native-async-storage/async-storage';
import {Image, View} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {DarkThemeSchema} from '../utils/theme';
export default function InitialPage(props) {
  useEffect(() => {
    const timer = setTimeout(() => {
      AsyncStorage.getItem('token').then(data => {
        if (!data) {
          props.navigation.navigate('Login');
        } else {
          props.navigation.navigate('Home');
        }
      });
    }, 2000);
    return () => clearTimeout(timer);
  }, []);
  const [theme, settheme] = useState(DarkThemeSchema);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.main,
      }}>
      <Image
        alt="LOGO"
        source={require('../src/assets/logo.png')}
        style={{height: 150, width: 150}}
      />
    </View>
  );
}
