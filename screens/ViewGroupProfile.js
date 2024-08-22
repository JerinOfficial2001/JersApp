import {View, Text, StyleSheet, ToastAndroid} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import SurfaceLayout from '../src/Layouts/SurfaceLayout';
import Loader from '../src/components/Loader';
import {useQuery} from '@tanstack/react-query';
import {FlatList} from 'react-native';
import MyComponent from '../src/components/MyComponent';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import {MyContext} from '../App';
import {GetMembers} from '../src/controllers/members';
import {Button} from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import UserModal from '../src/components/UserModal';
import {useSocketHook} from '../utils/socket';
import ContactCard from '../src/components/ContactCard';

export default function ViewGroupProfile({route, navigation}) {
  const {id, image, name, members} = route.params;
  const {jersAppTheme, Data} = useContext(MyContext);
  const [openModel, setopenModel] = useState(false);

  const {updatedRoleStatus, setupdatedRoleStatus} = useSocketHook();

  const [dataForUserModal, setdataForUserModal] = useState(null);
  const {
    data: allMembers,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ['DBcontacts'],
    queryFn: () =>
      GetMembers({token: Data.accessToken, id: Data._id, groupID: id}),
    enabled: !!Data && !!Data._id,
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
  const IsAdmin = members => {
    const myAcc = members?.find(elem => elem.user_id == Data?._id);
    const result = myAcc?.role == 'ADMIN';
    return result;
  };
  const IsMemberAdmin = id => {
    const myAcc = allMembers.find(elem => elem._id == id);
    const result = myAcc?.role == 'ADMIN';
    return result;
  };
  const handleOpenUserModal = data => {
    setdataForUserModal(data);
    setopenModel(true);
  };
  useEffect(() => {
    if (updatedRoleStatus) {
      refetch();
      setopenModel(false);
      setupdatedRoleStatus(null);
    }
  }, [updatedRoleStatus]);
  const userIds = allMembers ? allMembers.map(i => i.user_id) : [];
  return (
    <SurfaceLayout group={{name, image, members, IsAdmin: IsAdmin(allMembers)}}>
      {isLoading ? (
        <Loader />
      ) : allMembers?.length > 0 ? (
        <FlatList
          data={
            IsAdmin(allMembers)
              ? [
                  {
                    _id: 0,
                    name: 'Add members',
                    customImg: (
                      <EntypoIcon
                        color={jersAppTheme.headerText}
                        size={23}
                        name="add-user"
                      />
                    ),
                  },
                  ...allMembers,
                ]
              : allMembers
          }
          renderItem={({item}) => (
            <ContactCard
              onclick={() => {
                if (item.name == 'Add members') {
                  navigation.navigate('AddParticipants', {
                    dataFromGroup: {
                      ids: userIds,
                      GroupData: {
                        id,
                        name,
                        image,
                        members,
                      },
                    },
                  });
                } else {
                  handleOpenUserModal({
                    IsAdmin: IsAdmin(allMembers),
                    isMemberAdmin: IsMemberAdmin(item._id),
                    name: item.name,
                    id: item._id,
                    user_id: item.user_id,
                    groupID: id,
                  });
                }
              }}
              url={item.image ? item.image.url : ''}
              role={item.role}
              name={item.name}
              id={item._id}
            />
          )}
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
          <Text style={{color: 'gray'}}>Something went wrong</Text>
        </View>
      )}
      <View style={{padding: 10}}>
        <Button
          mode="outlined"
          textColor="red"
          style={{width: '100%', borderColor: 'red'}}>
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              width: '100%',
              flex: 1,
              gap: 5,
            }}>
            <MaterialIcons name="logout" color="red" size={20} />
            <Text style={{color: 'red', fontSize: 18}}>Exit group</Text>
          </View>
        </Button>
      </View>
      <UserModal
        modalData={dataForUserModal}
        visible={openModel}
        handleModelClose={() => {
          setopenModel(false), setdataForUserModal(null);
        }}
      />
    </SurfaceLayout>
  );
}
