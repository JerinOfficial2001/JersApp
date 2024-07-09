import {View, Text, FlatList, StyleSheet, TouchableOpacity} from 'react-native';
import React, {useContext, useState, useEffect} from 'react';
import SurfaceLayout from '../src/Layouts/SurfaceLayout';
import {useQueries, useQuery} from '@tanstack/react-query';
import {getAllUsers} from '../src/controllers/auth';
import {requestContactsPermission} from '../src/controllers/contacts';
import Loader from '../src/components/Loader';
import MyComponent from '../src/components/MyComponent';
import {TouchableWithoutFeedback} from 'react-native';
import {MyContext} from '../App';
import {useSocketHook} from '../utils/socket';
import {AddMemberToGroup} from '../src/controllers/members';

export default function AddParticipants({route, ...props}) {
  const {Data, selectedIds, setSelectedIds} = useContext(MyContext);
  const {socketAddMember, socket} = useSocketHook();
  const [isProcessing, setisProcessing] = useState(false);
  const {dataFromGroup} = route.params;

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
  const handleSubmit = () => {
    if (!dataFromGroup) {
      props.navigation.navigate('CreateGroup', {image: null});
    } else {
      if (dataFromGroup) {
        const formData = {
          members: selectedIds.map(i => ({
            user_id: i,
            role: 'MEMBER',
          })),
        };
        AddMemberToGroup({
          groupID: dataFromGroup.GroupData.id,
          token: Data?.accessToken,
          id: Data?._id,
          formData,
        }).then(res => {
          if (res) {
            if (res.status == 'ok') {
              socketAddMember(dataFromGroup.GroupData);
              setisProcessing(false);
              props.navigation.navigate(
                'ViewGroupProfile',
                dataFromGroup.GroupData,
                setSelectedIds([]),
              );
            } else {
              ToastAndroid.show(res.message, ToastAndroid.SHORT);
              setisProcessing(false);
            }
          }
        });
        setisProcessing(true);
      }
    }
  };

  return (
    <SurfaceLayout
      toggleSelection={toggleSelection}
      title={'Add Participants'}
      ShowNavigationBtn={selectedIds.length > 0 ? true : false}
      onClick={handleSubmit}
      isProcessing={isProcessing}>
      {isLoading ? (
        <Loader />
      ) : (
        <FlatList
          data={GetContacts()}
          renderItem={({item}) => {
            const isDisabled =
              dataFromGroup && dataFromGroup.ids.includes(item._id);
            return (
              <TouchableWithoutFeedback
                disabled={isDisabled}
                style={styles.item}>
                <MyComponent
                  isDisabled={isDisabled}
                  onclick={() => {
                    if (!isDisabled) toggleSelection(item._id);
                  }}
                  contactPg
                  contact={item}
                  isSelected={
                    isDisabled ? false : selectedIds.includes(item._id)
                  }
                  showSelectedIcon={isDisabled ? false : true}
                />
              </TouchableWithoutFeedback>
            );
          }}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
        />
      )}
    </SurfaceLayout>
  );
}
