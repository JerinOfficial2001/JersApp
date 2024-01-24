import React, {useEffect, useState} from 'react';
import {ScrollView, Text, View} from 'react-native';
import MyComponent from '../src/components/MyComponent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getContactByUserId} from '../src/controllers/contacts';
import {useFocusEffect} from '@react-navigation/native';

export default function Chats(props) {
  const [chats, setChats] = useState([]);
  const fetchData = async () => {
    try {
      const data = await AsyncStorage.getItem('userData');
      if (data) {
        const userData = JSON.parse(data);
        const contacts = await getContactByUserId(userData?._id);
        setChats(contacts);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, []),
  );
  return (
    <ScrollView style={{padding: 10}}>
      {chats.length > 0 ? (
        chats.map((elem, index) => (
          <MyComponent
            contact={elem?.ContactDetails}
            key={index}
            onclick={() => {
              props.navigation.navigate('Message', {
                id: elem?.ContactDetails.rawContactId,
              });
            }}
          />
        ))
      ) : (
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
            height: 600,
          }}>
          <Text style={{color: 'gray'}}>No Chats</Text>
        </View>
      )}
    </ScrollView>
  );
}
