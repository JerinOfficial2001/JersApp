import React, {useEffect, useState} from 'react';
import {ScrollView, Text, View} from 'react-native';
import MyComponent from '../src/components/MyComponent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getContactByUserId} from '../src/controllers/contacts';

export default function Chats(props) {
  const [chats, setChats] = useState([]);

  useEffect(() => {
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

    fetchData();
  }, []);

  return (
    <ScrollView style={{padding: 10}}>
      {chats.length > 0 ? (
        chats.map(elem => (
          <MyComponent
            contact={elem?.ContactDetails}
            key={elem?.ContactDetails.rawContactId}
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
