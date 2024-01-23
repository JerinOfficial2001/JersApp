import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useEffect, useState} from 'react';
import {Text, View} from 'react-native';
import {Button} from 'react-native-paper';

export default function Settings(props) {
  const [userData, setuserData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await AsyncStorage.getItem('userData');
        if (data) {
          const userData = JSON.parse(data);

          setuserData(userData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);
  return (
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        gap: 10,
      }}>
      <Text style={{color: 'black'}}>Name : {userData?.name}</Text>
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
