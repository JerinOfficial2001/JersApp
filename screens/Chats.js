import {useFocusEffect} from '@react-navigation/native';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import React, {useContext, useEffect, useState} from 'react';
import {Pressable, ScrollView, Text, ToastAndroid, View} from 'react-native';
import {MyContext} from '../App';
import {TopBarContext} from '../navigations/tabNavigation';
import SurfaceLayout from '../src/Layouts/SurfaceLayout';
import DeleteModal from '../src/components/DeleteModel';
import {deleteContactById, getAccountChats} from '../src/controllers/contacts';
import {checkApplicationPermission} from '../src/controllers/permissions';
import {eventEmitter} from '../src/notification.android';
import {useSocketHook} from '../utils/socket';
import Loader from '../src/components/Loader';
import {getCreatedDay} from '../utils/methods/Date&Time';
import ContactCard from '../src/components/ContactCard';

export default function Chats(props) {
  useEffect(() => {
    checkApplicationPermission();

    const subscription = eventEmitter.addListener('notificationPressed', () => {
      props.navigation.navigate('Chats');
    });
    // return () => {
    //   if (subscription) subscription.removeListener();
    // };
  }, []);

  const {Data, jersAppTheme, setpageName} = useContext(MyContext);
  const [isMsgLongPressed, setisMsgLongPressed] = useState([]);
  const [receiversId, setreceiversId] = useState('');
  const [Contact_id, setContact_id] = useState('');

  const {setisDelete, isModelOpen, setisModelOpen, setopenMenu} =
    useContext(TopBarContext);

  const getAllChats = async () => {
    const response = await getAccountChats();
    if (response) {
      setisMsgLongPressed(response.map(() => ({isSelected: false})));
      return response;
    }
  };
  const {data, refetch, isLoading} = useQuery({
    queryKey: ['chats'],
    queryFn: () => getAllChats(),
    enabled: !!Data._id,
  });
  const {
    newMsgCount,
    setnewMsgCount,
    socket,
    socketUserID,
    socketUserConnected,
    handleNavigationToMessage,
  } = useSocketHook();

  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [newMsgCount]),
  );
  useFocusEffect(
    React.useCallback(() => {
      if (socket) {
        socket.on('connect', () => {
          // console.log('connected');
        });
        socketUserID(Data._id);
        socketUserConnected({
          id: Data._id,
          status: 'online',
        });
      }
    }, [socket]),
  );
  const handleDeleteContact = () => {
    if (receiversId && Contact_id) {
      deleteContactById(Data._id, receiversId, Contact_id).then(data => {
        if (data.status == 'ok' && data.message !== 'failed') {
          refetch();
          handlePress();
          setisModelOpen(false);
          ToastAndroid.show('Deleted', ToastAndroid.SHORT);
        } else {
          ToastAndroid.show('Failed', ToastAndroid.SHORT);
          setisModelOpen(false);
        }
      });
    }
  };

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

  return (
    <SurfaceLayout title="Chats">
      {isLoading ? (
        <Loader />
      ) : (
        <Pressable style={{flex: 1}} onPress={handlePress}>
          <ScrollView style={{padding: 10}}>
            {data?.length > 0 ? (
              data?.map((elem, index) => {
                const isSelected = isMsgLongPressed[index]?.isSelected;
                elem.date = getCreatedDay(elem);
                return (
                  <View
                    key={index}
                    style={{
                      backgroundColor: isSelected ? 'gray' : 'transparent',
                      borderRadius: 10,
                    }}>
                    <ContactCard
                      id={elem?._id}
                      url={elem?.image ? elem?.image.url : ''}
                      badgeCount={elem?.msgCount}
                      name={
                        elem?.given_name
                          ? elem?.given_name
                          : '+91 ' + elem?.phone
                      }
                      date={elem?.date}
                      lastMsg={{
                        msg: elem?.lastMsg.msg,
                        name:
                          typeof elem?.lastMsg.name != 'string'
                            ? '+91 ' + elem?.lastMsg.name
                            : elem?.lastMsg.name,
                      }}
                      onclick={() => {
                        setnewMsgCount(null);
                        handlePress();
                        handleNavigationToMessage(elem._id, props);
                      }}
                      onLongPress={() => {
                        handleLongPress(index, elem?.user_id, elem?._id);
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
                <Text style={{color: 'gray'}}>No Chats</Text>
              </View>
            )}
            <DeleteModal
              handleModelClose={handleModelClose}
              visible={isModelOpen}
              handleDelete={handleDeleteContact}
            />
          </ScrollView>
        </Pressable>
      )}
    </SurfaceLayout>
  );
}
