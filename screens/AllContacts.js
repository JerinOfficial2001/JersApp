import React, {useContext, useEffect, useState} from 'react';
import {ScrollView, Text, View} from 'react-native';
import MyComponent from '../src/components/MyComponent';
import {
  addAndGetAllContact,
  addChat,
  requestContactsPermission,
} from '../src/controllers/contacts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getAllUsers} from '../src/controllers/auth';
import {MyContext} from '../App';
import SurfaceLayout from '../src/Layouts/SurfaceLayout';
import Loader from '../src/components/Loader';
import {useMutation, useQuery} from '@tanstack/react-query';
import {cleanPhoneNumber} from '../utils/methods/cleanPhoneNo';
import {useSocketHook} from '../utils/socket';
import ContactCard from '../src/components/ContactCard';

export default function AllContacts(props) {
  const {jersAppTheme, Data} = useContext(MyContext);
  const {handleNavigationToMessage} = useSocketHook();
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
          if (!mobContacts || mobContacts.length == 0) return [];
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
  const [allContacts, setallContacts] = useState([]);
  const {mutate: addAndGetContact, isPending: loadingAllContacts} = useMutation(
    {
      mutationKey: ['allContacts'],
      mutationFn: addAndGetAllContact,
      onSuccess: data => {
        setallContacts(data);
      },
    },
  );

  const handleClick = elem => {
    addChat(elem._id, props).then(data => {
      if (data) {
        if (data.message === 'already registered') {
          handleNavigationToMessage(elem._id, props);
        } else {
          props.navigation.navigate('Home');
          return data.data;
        }
      }
    });
  };
  const queryDatas = contacts ? contacts : [];

  useEffect(() => {
    if (contacts) {
      addAndGetContact(queryDatas);
    }
  }, [contacts?.length]);

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
            <ContactCard
              id={elem._id}
              key={index}
              onclick={() => {
                handleClick(elem);
              }}
              name={elem.given_name ? elem.given_name : '+91 ' + elem.phone}
              title={'+91 ' + elem.phone}
              date={!elem.given_name ? '~' + elem.name : ''}
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
