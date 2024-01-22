import React, {useEffect, useState} from 'react';
import {PermissionsAndroid, ScrollView, Text, View} from 'react-native';
import Contacts from 'react-native-contacts';
import MyComponent from '../src/components/MyComponent';
import {
  addContact,
  requestContactsPermission,
} from '../src/controllers/contacts';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AllContacts(props) {
  const [contacts, setContacts] = useState([]);
  const [userData, setuserData] = useState({});
  useEffect(() => {
    requestContactsPermission().then(res => {
      if (res) {
        setContacts(res);
      }
    });
    AsyncStorage.getItem('userData').then(storedData => {
      const storedUserData = JSON.parse(storedData);
      if (storedUserData) {
        setuserData(storedUserData);
      }
    });
  }, []);
  const handleClick = elem => {
    addContact(elem, userData?._id, elem.displayName);

    props.navigation.navigate('Message', {
      id: elem?.rawContactId,
      userID: userData?._id,
    });
  };
  return (
    <ScrollView>
      {[
        contacts[0],
        contacts[1],
        contacts[2],
        contacts[3],
        contacts[4],
        contacts[5],
        contacts[6],
        contacts[7],
        contacts[8],
        contacts[9],
        contacts[10],
      ]?.map((elem, index) => {
        return (
          <MyComponent
            contactPg
            contact={elem}
            key={index}
            onclick={() => {
              handleClick(elem);
            }}
          />
        );
      })}
    </ScrollView>
  );
}
