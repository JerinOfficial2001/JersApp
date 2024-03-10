import React, {useEffect} from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';
import TabNavigator from '../navigations/tabNavigation';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Home(props) {
  useEffect(() => {
    AsyncStorage.getItem('token').then(data => {
      if (!data) {
        props.navigation.navigate('Login');
      }
    });
  }, []);

  return (
    <View>
      <TabNavigator props={props} />
    </View>
  );
}
