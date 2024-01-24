import React, {useEffect, useState} from 'react';
import {ScrollView, Text, View} from 'react-native';
import MyComponent from '../src/components/MyComponent';
import {
  addContact,
  requestContactsPermission,
} from '../src/controllers/contacts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getAllUsers} from '../src/controllers/auth';

export default function AllContacts(props) {
  const [contacts, setContacts] = useState([]);
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);

  const getContacts = async () => {
    try {
      const permissionsGranted = await requestContactsPermission();

      if (permissionsGranted) {
        const dbContact = await getAllUsers();

        if (dbContact) {
          const mobContacts = permissionsGranted.map(contact =>
            contact.phoneNumbers[0]?.number.substring(3),
          );
          const apiContacts = dbContact.map(contact => contact.mobNum);
          const commonMobNumbers = apiContacts.filter(contact =>
            mobContacts.includes(contact),
          );
          const commonMobContacts = permissionsGranted.filter(contact =>
            commonMobNumbers.includes(
              contact.phoneNumbers[0]?.number.substring(3),
            ),
          );
          setContacts(commonMobContacts);
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('userData');
        const storedUserData = JSON.parse(storedData);
        if (storedUserData) {
          setUserData(storedUserData);
          await getContacts();
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchData();
  }, []);

  const handleClick = elem => {
    addContact(elem, userData?._id, elem.displayName, elem.rawContactId);

    if (userData) {
      props.navigation.navigate('Message', {
        id: elem?.rawContactId,
        userID: userData?._id,
      });
    }
  };

  if (loading) {
    return (
      <View
        style={{
          width: '100%',
          alignItems: 'center',
          height: 700,
          justifyContent: 'center',
        }}>
        <Text style={{color: 'black'}}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView>
      {contacts.length > 0 ? (
        contacts.map((elem, index) => (
          <MyComponent
            contactPg
            contact={elem}
            key={index}
            onclick={() => {
              handleClick(elem);
            }}
          />
        ))
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
