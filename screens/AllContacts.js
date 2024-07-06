import React, {useContext, useEffect, useState} from 'react';
import {ScrollView, Text, View} from 'react-native';
import MyComponent from '../src/components/MyComponent';
import {
  addContact,
  requestContactsPermission,
} from '../src/controllers/contacts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getAllUsers} from '../src/controllers/auth';
import {MyContext} from '../App';
import SurfaceLayout from '../src/Layouts/SurfaceLayout';
import Loader from '../src/components/Loader';

export default function AllContacts(props) {
  const [contacts, setContacts] = useState([]);
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);
  const {jersAppTheme, Data} = useContext(MyContext);

  function cleanPhoneNumber(phoneNumber) {
    const cleanedNumber = phoneNumber?.replace(/\D/g, '').slice(-10);
    return cleanedNumber;
  }

  const getContacts = async () => {
    try {
      const permissionsGranted = await requestContactsPermission();

      if (permissionsGranted) {
        const dbContact = await getAllUsers();
        if (dbContact) {
          const mobContacts = permissionsGranted.map(contact =>
            cleanPhoneNumber(contact.phoneNumbers[0]?.number),
          );
          const apiContacts = dbContact.map(contact => contact.mobNum);
          let commonMobNumbers = apiContacts.filter(contact =>
            mobContacts.includes(cleanPhoneNumber(contact)),
          );
          const apiUserDatas = commonMobNumbers.map(num => {
            const commonObj = dbContact.find(
              user => cleanPhoneNumber(user.mobNum) == num,
            );
            if (commonObj._id == Data?._id) {
              return {...commonObj, name: 'Me'};
            } else {
              return commonObj;
            }
          });
          setContacts(apiUserDatas);
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
    addContact(
      elem,
      userData?._id,
      elem.name,
      // elem.displayName,
      elem.mobNum,
      // elem.phoneNumbers[0]?.number,
      props,
    );
  };

  return (
    <SurfaceLayout title="Contacts">
      {loading ? (
        <Loader />
      ) : contacts.length > 0 ? (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 5,
          }}>
          {contacts.map((elem, index) => (
            <MyComponent
              contactPg
              contact={elem}
              key={index}
              onclick={() => {
                handleClick(elem);
              }}
            />
          ))}
        </ScrollView>
      ) : (
        <View
          style={{
            width: '100%',
            alignItems: 'center',
            flex: 1,
            justifyContent: 'center',
          }}>
          <Text style={{color: 'gray'}}>No Contacts</Text>
        </View>
      )}
    </SurfaceLayout>
  );
}
