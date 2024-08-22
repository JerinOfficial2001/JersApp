import {View, Text, FlatList, StyleSheet} from 'react-native';
import React, {useContext, useState} from 'react';
import SurfaceLayout from '../src/Layouts/SurfaceLayout';
import {useQuery} from '@tanstack/react-query';
import {getContactByUserId} from '../src/controllers/contacts';
import Loader from '../src/components/Loader';
import {TouchableWithoutFeedback} from 'react-native';
import {MyContext} from '../App';
import {useSocketHook} from '../utils/socket';
import {AddMemberToGroup} from '../src/controllers/members';
import ContactCard from '../src/components/ContactCard';

export default function AddParticipants({route, ...props}) {
  const {Data, selectedIds, setSelectedIds} = useContext(MyContext);
  const {socketAddMember} = useSocketHook();
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
    data: allContacts,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ['contacts'],
    queryFn: getContactByUserId,
    enabled: !!Data._id,
  });
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
    try {
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
    } catch (error) {
      console.log('Err Creating group');
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
      ) : allContacts ? (
        <FlatList
          data={allContacts}
          renderItem={({item}) => {
            const isDisabled =
              dataFromGroup && dataFromGroup.ids.includes(item?.user_id);
            return (
              <TouchableWithoutFeedback
                disabled={isDisabled}
                style={styles.item}>
                <ContactCard
                  id={item?._id}
                  url={item?.image ? item?.image.url : ''}
                  badgeCount={item?.msgCount}
                  name={
                    item?.given_name ? item?.given_name : '+91 ' + item?.phone
                  }
                  date={item?.date}
                  isDisabled={isDisabled}
                  onclick={() => {
                    if (!isDisabled) toggleSelection(item?.user_id);
                  }}
                  isSelected={
                    isDisabled ? false : selectedIds.includes(item?.user_id)
                  }
                  showSelectedIcon={isDisabled ? false : true}
                />
              </TouchableWithoutFeedback>
            );
          }}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
            height: 600,
          }}>
          <Text style={{color: 'gray'}}>No Contacts</Text>
        </View>
      )}
    </SurfaceLayout>
  );
}
