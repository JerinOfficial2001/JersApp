import React, {useEffect, useState} from 'react';
import {PermissionsAndroid, ScrollView, Text, View} from 'react-native';
import Contacts from 'react-native-contacts';
import MyComponent from '../src/components/MyComponent';
import {
  addContact,
  requestContactsPermission,
} from '../src/controllers/contacts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getAllUsers} from '../src/controllers/auth';

export default function AllContacts(props) {
  const [contacts, setContacts] = useState([]);
  const [userData, setuserData] = useState({});
  useEffect(() => {
    requestContactsPermission().then(res => {
      if (res) {
        getAllUsers().then(dbContact => {
          if (dbContact) {
            const mobContacts = res.map(contact =>
              contact.phoneNumbers[0]?.number.substring(3),
            );
            const apiContacts = dbContact.map(contact => contact.mobNum);
            const commonContact = mobContacts.filter(contact =>
              apiContacts.includes(contact),
            );

            setContacts(commonContact);
          }
        });
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
      {contacts.length > 0 ? (
        contacts.map((elem, index) => {
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
        })
      ) : (
        <View
          style={{
            width: '100%',
            alignItems: 'center',
            height: 700,
            justifyContent: 'center',
          }}>
          <Text style={{color: 'black'}}>No Contacts</Text>
        </View>
      )}
    </ScrollView>
  );
}
