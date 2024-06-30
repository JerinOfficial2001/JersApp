import {useFocusEffect} from '@react-navigation/native';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import React, {useContext, useEffect, useState} from 'react';
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

export default function Chats(props) {
  useEffect(() => {
    const subscription = eventEmitter.addListener('notificationPressed', () => {
      props.navigation.navigate('Chats');
    });
    return () => {
      if (subscription) subscription.removeListener();
    };
  }, []);

  const {Data, jersAppTheme, setpageName} = useContext(MyContext);
  const [isMsgLongPressed, setisMsgLongPressed] = useState([]);
  const [receiversId, setreceiversId] = useState('');
  const [Contact_id, setContact_id] = useState('');
  // const [theme, settheme] = useState(JersAppThemeSchema);

  const {setisDelete, isModelOpen, setisModelOpen, setopenMenu, setactiveTab} =
    useContext(TopBarContext);
  const {
    newMsgCount,
    setnewMsgCount,
    socket,
    socketUserID,
    socketUserConnected,
  } = useSocketHook();

  const getDate = timestamps => {
    const date = new Date(timestamps);
    const properDate =
      date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    const properMonth =
      date.getMonth() < 10 ? '0' + date.getMonth() : date.getMonth();
    const formatedDate = `${properDate}/${properMonth}/${
      date.getFullYear() % 100
    }`;
    return formatedDate;
  };

  const {data, refetch, isLoading} = useQuery({
    queryKey: ['chats'],
    queryFn: () => getContactByUserId(Data._id),
    enabled: Data._id != undefined,
  });

  checkApplicationPermission();

  const {mutateAsync: AddChat} = useMutation({
    mutationFn: data => {
      createChat(data);
      return data;
    },
    onSuccess: data => {
      socket.emit('roomID', data.roomID);
      props.navigation.navigate('Message', {
        id: data.elem.ContactDetails?._id,
        userID: Data._id,
        receiverId: data.receiver,
        roomID: data.roomID,
      });
    },
  });

  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [newMsgCount]),
  );
  useFocusEffect(
    React.useCallback(() => {
      if (socket) {
        socket.on('connection', () => {
          console.log('connected');
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
          fetchData();
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

  if (isLoading) {
    return <Loader />;
  }
  return (
    <SurfaceLayout>
      <Pressable style={{flex: 1}} onPress={handlePress}>
        <ScrollView style={{padding: 10}}>
          {data?.length > 0 ? (
            data?.map((elem, index) => {
              const isSelected = isMsgLongPressed[index]?.isSelected;
              return (
                <View
                  key={index}
                  style={{
                    backgroundColor: isSelected ? 'gray' : 'transparent',
                    borderRadius: 3,
                  }}>
                  <MyComponent
                    newMsgcount={elem.msgCount}
                    contact={elem}
                    onclick={() => {
                      const Ids = [Data._id, elem.ContactDetails._id]
                        .sort()
                        .join('_');

                      AddChat({
                        sender: Data._id,
                        receiver: elem.ContactDetails._id,
                        elem: elem,
                        roomID: Ids,
                      });
                      handlePress();

                      socket.emit('clearNewMsg', {
                        id: Data._id,
                        Contact_id: elem._id,
                      });
                      setnewMsgCount(null);
                    }}
                    onLongPress={() => {
                      handleLongPress(
                        index,
                        elem.ContactDetails._id,
                        elem.Contact_id,
                      );
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
    </SurfaceLayout>
  );
}
