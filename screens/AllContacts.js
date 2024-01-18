import React, {useEffect, useState} from 'react';
import {PermissionsAndroid, ScrollView, Text, View} from 'react-native';
import Contacts from 'react-native-contacts';
import MyComponent from '../src/components/MyComponent';

export default function AllContacts(props) {
  const [contacts, setContacts] = useState([]);
  const requestContactsPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        {
          title: 'Contacts Permission',
          message: 'This app needs access to your contacts.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        Contacts.getAll().then(data => {
          setContacts(data);
        });
      } else {
        console.log('Contacts permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };
  useEffect(() => {
    requestContactsPermission();
  }, []);

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
              props.navigation.navigate('Message');
            }}
          />
        );
      })}
    </ScrollView>
  );
}
