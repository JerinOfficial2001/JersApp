import React, {useContext, useEffect, useState} from 'react';
import {ScrollView, Text, View} from 'react-native';
import MyComponent from '../src/components/MyComponent';
import {
  addContact,
  requestContactsPermission,
} from '../src/controllers/contacts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getAllUsers} from '../src/controllers/auth';
import {ActivityIndicator, MD2Colors} from 'react-native-paper';
import {MyContext} from '../App';

export default function AllContacts(props) {
  const [contacts, setContacts] = useState([]);
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);
  const {jersAppTheme} = useContext(MyContext);

  const getContacts = async () => {
    try {
      const permissionsGranted = await requestContactsPermission();

      if (permissionsGranted) {
        const dbContact = await getAllUsers();

        if (dbContact) {
          const mobContacts = permissionsGranted.map(
            contact => contact.phoneNumbers[0]?.number,
          );
          const apiContacts = dbContact.map(contact => contact.mobNum);

          let commonMobNumbers = apiContacts.filter(
            contact =>
              mobContacts.includes(`+91${contact}`) ||
              mobContacts.includes(contact),
          );
          // if (commonMobNumbers.length == 0) {
          //   commonMobNumbers = apiContacts.filter(contact =>
          //     mobContacts.includes(contact),
          //   );
          // }
          const apiUserDatas = commonMobNumbers.map(num => {
            const commonObj = dbContact.find(user => user.mobNum == num);
            return commonObj;
          });
          // const commonMobContacts = permissionsGranted.filter(contact =>
          //   commonMobNumbers.includes(
          //     contact.phoneNumbers[0]?.number ||
          //       `+91${contact.phoneNumbers[0]?.number}`,
          //   ),
          // );
          // console.log(commonMobContacts);

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

  if (loading) {
    return (
      <View
        style={{
          width: '100%',
          alignItems: 'center',
          flex: 1,
          justifyContent: 'center',
          backgroundColor: jersAppTheme.main,
        }}>
        <ActivityIndicator
          animating={true}
          color={jersAppTheme.appBar}
          size="large"
        />
      </View>
    );
  }

  return (
    <ScrollView style={{backgroundColor: jersAppTheme.main}}>
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
