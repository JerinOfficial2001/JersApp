import React, {useContext, useEffect, useState} from 'react';
import {ScrollView, Text, View} from 'react-native';
import MyComponent from '../src/components/MyComponent';
import {
  addAndGetAllContact,
  addContact,
  requestContactsPermission,
} from '../src/controllers/contacts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getAllUsers} from '../src/controllers/auth';
import {MyContext} from '../App';
import SurfaceLayout from '../src/Layouts/SurfaceLayout';
import Loader from '../src/components/Loader';
import {useQuery} from '@tanstack/react-query';

export default function AllContacts(props) {
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
          const mobContacts = permissionsGranted.map(contact => ({
            phone: cleanPhoneNumber(contact.phoneNumbers[0]?.number),
            givenName: contact.givenName,
          }));
          const apiUserDatas = dbContact.map(num => {
            const commonObj = mobContacts.find(
              user => cleanPhoneNumber(user.phone) == num.mobNum,
            );
            commonObj.user_id = Data?._id;
            delete commonObj.phone;
            delete num.chats;
            delete num.contacts;
            delete num.groups;
            delete num.theme;
            if (num._id == Data?._id) {
              delete commonObj.givenName;
              return {...commonObj, givenName: 'Me', ...num};
            } else {
              return {...commonObj, ...num};
            }
          });
          return apiUserDatas;
        } else {
          return [];
        }
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };
  const {data: contacts, isLoading: loadingContacts} = useQuery({
    queryKey: ['contacts'],
    queryFn: getContacts,
  });
  const {data: allContacts, isLoading: loadingAllContacts} = useQuery({
    queryKey: ['allContacts', {contacts}],
    queryFn: addAndGetAllContact,
    enabled: !!contacts,
  });

  const handleClick = elem => {
    addContact(elem._id, props);
  };

  return (
    <SurfaceLayout title="Contacts">
      {loadingAllContacts || loadingContacts ? (
        <Loader />
      ) : allContacts?.length > 0 ? (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 5,
          }}>
          {allContacts?.map((elem, index) => (
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
