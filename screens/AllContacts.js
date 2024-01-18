import React, {useEffect, useState} from 'react';
import {PermissionsAndroid, ScrollView, Text, View} from 'react-native';
import Contacts from 'react-native-contacts';
import MyComponent from '../src/components/MyComponent';
import {requestContactsPermission} from '../src/controllers/contacts';

export default function AllContacts(props) {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    requestContactsPermission().then(res => {
      if (res) {
        setContacts(res);
      }
    });
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
              props.navigation.navigate('Message', {
                id: elem?.rawContactId,
              });
            }}
          />
        );
      })}
    </ScrollView>
  );
}
