import AsyncStorage from '@react-native-async-storage/async-storage';
import {Image, View} from 'react-native';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {DarkThemeSchema, JersAppThemeSchema} from '../utils/theme';
import {MyContext} from '../App';
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
  // const [theme, settheme] = useState(JersAppThemeSchema);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#242C3B',
      }}>
      <Image
        alt="LOGO"
        source={require('../src/assets/logo.png')}
        style={{height: 150, width: 150}}
      />
    </View>
  );
}
