import React, {useEffect, useState} from 'react';
import {ScrollView, Text, View} from 'react-native';
import MyComponent from '../src/components/MyComponent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getContactByUserId} from '../src/controllers/contacts';

export default function Chats(props) {
  const [chats, setchats] = useState([]);
  useEffect(() => {
    AsyncStorage.getItem('userData').then(data => {
      if (data) {
        const userData = JSON.parse(data);
        getContactByUserId(userData?._id).then(data => {
          setchats(data);
        });
      }
    });
  }, []);

  return (
    <ScrollView style={{padding: 10}}>
      {chats?.map(elem => {
        return (
          <MyComponent
            contact={elem?.ContactDetails}
            key={elem?.ContactDetails.rawContactId}
            onclick={() => {
              props.navigation.navigate('Message', {
                id: elem?.ContactDetails.rawContactId,
              });
            }}
          />
        );
      })}
    </ScrollView>
  );
}
