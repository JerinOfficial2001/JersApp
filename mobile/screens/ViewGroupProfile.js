import {
  View,
  Text,
  StyleSheet,
  ToastAndroid,
  TouchableOpacity,
  Image,
} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import SurfaceLayout from '../src/Layouts/SurfaceLayout';
import Loader from '../src/components/Loader';
import {useQuery} from '@tanstack/react-query';
import {FlatList} from 'react-native';
import MyComponent from '../src/components/MyComponent';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import {MyContext} from '../App';
import {GetMembers} from '../src/controllers/members';
import {Button, Modal, Portal, TextInput, Avatar, ActivityIndicator} from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import UserModal from '../src/components/UserModal';
import {useSocketHook} from '../utils/socket';
import DocumentPicker from 'react-native-document-picker';
import {UpdateGroup} from '../src/controllers/group';

export default function ViewGroupProfile({route, navigation}) {
  const {id, image, name, members} = route.params;
  const {jersAppTheme, Data} = useContext(MyContext);
  const [openModel, setopenModel] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);

  const [groupName, setGroupName] = useState(name);
  const [groupImage, setGroupImage] = useState(image);
  const [tempGroupName, setTempGroupName] = useState(name);
  const [tempGroupImage, setTempGroupImage] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

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
      paddingVertical: 12,
      paddingBottom: 40,
    },
    itemWrapper: {
      backgroundColor: jersAppTheme.appBar,
      marginVertical: 4,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.05,
      shadowRadius: 5,
      elevation: 2,
      overflow: 'hidden',
    },
    modalContainer: {
      backgroundColor: jersAppTheme.main,
      padding: 20,
      margin: 20,
      borderRadius: 16,
      alignItems: 'center',
    },
  });

  const IsAdmin = members => {
    const myAcc = members?.find(elem => elem.user_id == Data?._id);
    const result = myAcc?.role == 'ADMIN';
    return result;
  };
  const IsMemberAdmin = userId => {
    const myAcc = allMembers.find(elem => elem._id == userId);
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

  const handlePickImage = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.images],
      });
      setTempGroupImage(result[0]);
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        console.log(err);
      }
    }
  };

  const handleUpdateGroup = async () => {
    if (tempGroupName.trim() === '') {
      ToastAndroid.show('Group name cannot be empty', ToastAndroid.SHORT);
      return;
    }
    setIsUpdating(true);
    const formData = new FormData();
    formData.append('group_name', tempGroupName);
    if (tempGroupImage) {
      formData.append('image', tempGroupImage);
    }

    try {
      const response = await UpdateGroup({
        token: Data.accessToken,
        id: Data._id,
        groupID: id,
        formData: formData,
      });

      if (response && response.status === 'ok') {
        ToastAndroid.show('Group updated successfully!', ToastAndroid.SHORT);
        setGroupName(response.data.group_name);
        if (response.data.image) {
          setGroupImage(response.data.image);
        }
        setOpenEditModal(false);
      } else {
        ToastAndroid.show('Failed to update group', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.log('Error updating group:', error);
      ToastAndroid.show('An error occurred', ToastAndroid.SHORT);
    } finally {
      setIsUpdating(false);
    }
  };

  const userIds = allMembers ? allMembers.map(i => i.user_id) : [];

  return (
    <SurfaceLayout
      group={{
        name: groupName,
        image: groupImage,
        members,
        IsAdmin: IsAdmin(allMembers),
      }}
      onEditPress={() => {
        setTempGroupName(groupName);
        setTempGroupImage(null);
        setOpenEditModal(true);
      }}>
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
            <View style={styles.itemWrapper}>
              <MyComponent
                onclick={() => {
                  if (item.name == 'Add members') {
                    navigation.navigate('AddParticipants', {
                      dataFromGroup: {
                        ids: userIds,
                        GroupData: {
                          id,
                          name: groupName,
                          image: groupImage,
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
                customImg={item.customImg}
                contactPg
                contact={item}
              />
            </View>
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
      <View style={{padding: 20, paddingBottom: 30}}>
        <Button
          mode="contained"
          buttonColor="#fee2e2"
          style={{
            width: '100%',
            borderRadius: 16,
            elevation: 0,
            paddingVertical: 6,
          }}>
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              width: '100%',
              flex: 1,
              gap: 8,
            }}>
            <MaterialIcons name="logout" color="#ef4444" size={22} />
            <Text style={{color: '#ef4444', fontSize: 18, fontWeight: '700'}}>
              Exit group
            </Text>
          </View>
        </Button>
      </View>
      <UserModal
        modalData={dataForUserModal}
        visible={openModel}
        handleModelClose={() => {
          setopenModel(false);
          setdataForUserModal(null);
        }}
      />
      <Portal>
        <Modal
          visible={openEditModal}
          onDismiss={() => setOpenEditModal(false)}
          contentContainerStyle={styles.modalContainer}>
          <Text
            style={{
              color: jersAppTheme.themeText,
              fontSize: 20,
              fontWeight: 'bold',
              marginBottom: 20,
            }}>
            Edit Group Profile
          </Text>
          <TouchableOpacity onPress={handlePickImage} style={{marginBottom: 20}}>
            {tempGroupImage ? (
              <Avatar.Image size={100} source={{uri: tempGroupImage.uri}} />
            ) : groupImage && groupImage !== 'null' ? (
              <Avatar.Image size={100} source={{uri: groupImage.url}} />
            ) : (
              <Avatar.Icon size={100} icon="account-group" />
            )}
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                backgroundColor: jersAppTheme.themeText,
                borderRadius: 20,
                padding: 6,
              }}>
              <EntypoIcon name="camera" size={16} color="#fff" />
            </View>
          </TouchableOpacity>
          <TextInput
            label="Group Name"
            value={tempGroupName}
            onChangeText={setTempGroupName}
            style={{width: '100%', marginBottom: 20, backgroundColor: 'transparent'}}
            textColor={jersAppTheme.title}
            underlineColor="gray"
            activeUnderlineColor={jersAppTheme.themeText}
          />
          <View style={{flexDirection: 'row', gap: 10, width: '100%'}}>
            <Button
              mode="outlined"
              onPress={() => setOpenEditModal(false)}
              style={{flex: 1}}
              textColor={jersAppTheme.themeText}>
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleUpdateGroup}
              style={{flex: 1, backgroundColor: jersAppTheme.themeText}}
              disabled={isUpdating}>
              {isUpdating ? <ActivityIndicator color="#fff" /> : 'Save'}
            </Button>
          </View>
        </Modal>
      </Portal>
    </SurfaceLayout>
  );
}
