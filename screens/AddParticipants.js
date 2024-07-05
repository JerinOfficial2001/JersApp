import {View, Text, FlatList, StyleSheet, TouchableOpacity} from 'react-native';
import React, {useContext, useState} from 'react';
import SurfaceLayout from '../src/Layouts/SurfaceLayout';
import {useQueries, useQuery} from '@tanstack/react-query';
import {getAllUsers} from '../src/controllers/auth';
import {requestContactsPermission} from '../src/controllers/contacts';
import Loader from '../src/components/Loader';
import MyComponent from '../src/components/MyComponent';
import {TouchableWithoutFeedback} from 'react-native';
import {MyContext} from '../App';

export default function AddParticipants(props) {
  const {Data} = useContext(MyContext);
  const [selectedIds, setSelectedIds] = useState([]);

  // Function to toggle selection of a contact by ID
  const toggleSelection = contactId => {
    if (selectedIds.includes(contactId)) {
      setSelectedIds(selectedIds.filter(id => id !== contactId)); // Deselect
    } else {
      setSelectedIds([...selectedIds, contactId]); // Select
    }
  };
  const {
    data: DBcontacts,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ['DBcontacts'],
    queryFn: getAllUsers,
  });
  const {data: MobileContacts} = useQuery({
    queryKey: ['contacts'],
    queryFn: requestContactsPermission,
  });
  //   const {data: GetAllContacts} = useQuery({
  //     queryKey: ['Get'],
  //     queryFn: GetContacts,
  //   });

  function normalizeMobileNumber(mobNum) {
    return mobNum.replace(/\D/g, '').slice(-10);
  }
  const GetContacts = () => {
    // Normalize and extract mobile numbers from both arrays
    let DBMobileNumbers = DBcontacts?.map(contact =>
      normalizeMobileNumber(contact.mobNum),
    );
    let MobileContactsNumbers = MobileContacts?.flatMap(contact =>
      contact.phoneNumbers.map(phone => normalizeMobileNumber(phone.number)),
    );
    // Find intersection of mobile numbers
    let commonMobileNumbers = DBMobileNumbers?.filter(num =>
      MobileContactsNumbers?.includes(num),
    );

    // Find contacts from DBcontacts that have common mobile numbers
    let commonContacts = DBcontacts?.filter(contact =>
      commonMobileNumbers.includes(normalizeMobileNumber(contact.mobNum)),
    );
    return commonContacts.filter(i => i._id !== Data._id);
  };
  const styles = StyleSheet.create({
    list: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      gap: 5,
    },
    item: {
      elevation: 2,
    },
  });
  return (
    <SurfaceLayout
      Ids={selectedIds}
      toggleSelection={toggleSelection}
      title={'Add Participants'}
      ShowNavigationBtn={selectedIds.length > 0 ? true : false}
      onClick={() =>
        props.navigation.navigate('CreateGroup', {ids: selectedIds})
      }>
      {isLoading ? (
        <Loader />
      ) : (
        <FlatList
          data={GetContacts()}
          renderItem={({item}) => (
            <TouchableWithoutFeedback style={styles.item}>
              <MyComponent
                onclick={() => {
                  toggleSelection(item._id);
                }}
                contactPg
                contact={item}
                isSelected={selectedIds.includes(item._id)}
                showSelectedIcon={true}
              />
            </TouchableWithoutFeedback>
          )}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
        />
      )}
    </SurfaceLayout>
  );
}
