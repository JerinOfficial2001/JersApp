import {useFocusEffect} from '@react-navigation/native';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {Pressable, ScrollView, Text, ToastAndroid, View} from 'react-native';
import {MyContext} from '../App';
import {TopBarContext} from '../navigations/tabNavigation';
import SurfaceLayout from '../src/Layouts/SurfaceLayout';
import DeleteModal from '../src/components/DeleteModel';
import MyComponent from '../src/components/MyComponent';
import {createChat} from '../src/controllers/chats';
import {
  deleteContactById,
  getContactByUserId,
} from '../src/controllers/contacts';
import {checkApplicationPermission} from '../src/controllers/permissions';
import {eventEmitter} from '../src/notification.android';
import {useSocketHook} from '../utils/socket';
import Loader from '../src/components/Loader';
import {Button, IconButton} from 'react-native-paper';
import Plus from '../src/assets/svg/plus';
import {GetGroups} from '../src/controllers/group';

export default function Groups(props) {
  const {Data, jersAppTheme, setpageName, setSelectedIds} =
    useContext(MyContext);
  const [isMsgLongPressed, setisMsgLongPressed] = useState([]);
  const [receiversId, setreceiversId] = useState('');
  const [Contact_id, setContact_id] = useState('');

  const {setisDelete, isModelOpen, setisModelOpen, setopenMenu, setactiveTab} =
    useContext(TopBarContext);

  const {data, refetch, isLoading} = useQuery({
    queryKey: ['groups'],
    queryFn: () => GetGroups({id: Data?._id, token: Data?.accessToken}),
    enabled: !!Data && !!Data._id,
  });
  const {
    newMsgCount,
    setnewMsgCount,
    socket,
    socketUserID,
    socketUserConnected,
  } = useSocketHook();

  const handleLongPress = (index, id, Contact_id) => {
    setContact_id(Contact_id);
    const updatedStates = [...isMsgLongPressed];
    updatedStates[index].isSelected = true;
    setisMsgLongPressed(updatedStates);
    setisDelete(true);
    setreceiversId(id);
  };
  const handlePress = () => {
    const updatedStates = isMsgLongPressed?.map(() => ({isSelected: false}));
    setisMsgLongPressed(updatedStates);
    setisDelete(false);
    setopenMenu(false);
  };
  const handleModelClose = () => {
    setisModelOpen(false);
    handlePress();
  };
  useFocusEffect(
    useCallback(() => {
      setSelectedIds([]);
      refetch();
    }, []),
  );
  return (
    <SurfaceLayout
      title="Groups"
      ShowNavigationBtn={true}
      onClick={() => props.navigation.navigate('AddParticipants')}>
      {isLoading ? (
        <Loader />
      ) : (
        <ScrollView style={{padding: 10}}>
          {data?.length > 0 ? (
            data?.map((elem, index) => {
              return (
                <View
                  key={index}
                  style={{
                    borderRadius: 3,
                  }}>
                  <MyComponent
                    // newMsgcount={elem.msgCount}
                    contact={{
                      _id: elem._id,
                      ContactDetails: {name: elem.group_name},
                    }}
                    onclick={() => {
                      props.navigation.navigate('GroupMsg', {
                        id: elem._id,
                      });
                    }}
                  />
                </View>
              );
            })
          ) : (
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                flex: 1,
                height: 600,
              }}>
              <Text style={{color: 'gray'}}>No Groups</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SurfaceLayout>
  );
}
