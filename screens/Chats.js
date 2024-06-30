import React, {useCallback, useContext, useEffect, useState} from 'react';
import {Pressable, ScrollView, Text, ToastAndroid, View} from 'react-native';
import MyComponent from '../src/components/MyComponent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  deleteContactById,
  getContactByUserId,
} from '../src/controllers/contacts';
import {useFocusEffect} from '@react-navigation/native';
import {createChat} from '../src/controllers/chats';
import DeleteModal from '../src/components/DeleteModel';
import {TopBarContext} from '../navigations/tabNavigation';
import {ActivityIndicator, Button, MD2Colors} from 'react-native-paper';
import {MyContext} from '../App';
import {DarkThemeSchema, JersAppThemeSchema} from '../utils/theme';
import {eventEmitter, showNotification} from '../src/notification.android';
import {checkApplicationPermission} from '../src/controllers/permissions';
import {useQueryClient} from '@tanstack/react-query';
import {useSocketHook} from '../utils/socket';
import SurfaceLayout from '../src/Layouts/SurfaceLayout';

export default function Chats(props) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const subscription = eventEmitter.addListener('notificationPressed', () => {
      props.navigation.navigate('Chats');
    });
    return () => {
      // subscription.remove(); // Clean up listener on component unmount
    };
  }, []);

  const {Data, jersAppTheme, setpageName} = useContext(MyContext);
  const [chats, setChats] = useState([]);
  const [isMsgLongPressed, setisMsgLongPressed] = useState([]);
  const [receiversId, setreceiversId] = useState('');
  const [userDatas, setuserDatas] = useState({});
  const [Contact_id, setContact_id] = useState('');
  const [isLoading, setisLoading] = useState(false);
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
  const fetchData = async () => {
    checkApplicationPermission();
    try {
      const data = await AsyncStorage.getItem('userData');
      if (data) {
        setisLoading(false);
        const userData = JSON.parse(data);

        setuserDatas(userData);
        const contacts = await getContactByUserId(userData?._id);
        if (contacts) {
          socket.emit('me', userData._id);

          setChats(
            contacts.map(item => ({...item, date: getDate(item.createdAt)})),
          );
          setisMsgLongPressed(contacts.map(item => ({isSelected: false})));
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setisLoading(false);
    }
  };
  useFocusEffect(
    useCallback(() => {
      setisLoading(true);

      fetchData();
      setpageName('Chats');
    }, []),
  );
  const addChat = data => {
    if (data.sender && data.receiver) {
      socket.emit('roomID', data.roomID);
      createChat(data).then(res => {
        props.navigation.navigate('Message', {
          id: data.elem.ContactDetails?._id,
          userID: userDatas._id,
          receiverId: data.receiver,
          roomID: data.roomID,
        });
      });
    }
  };
  useFocusEffect(
    React.useCallback(() => {
      setactiveTab('CHATS');
    }, []),
  );
  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [newMsgCount]),
  );
  useFocusEffect(
    React.useCallback(() => {
      if (socket) {
        socket.on('connection', () => {
          console.log('connected');
        });
        socketUserID(Data._id ? Data._id : userDatas._id);
        socketUserConnected({
          id: Data._id ? Data._id : userDatas._id,
          status: 'online',
        });
      }
    }, [socket]),
  );
  const handleDeleteContact = () => {
    if (receiversId && Contact_id) {
      deleteContactById(userDatas._id, receiversId, Contact_id).then(data => {
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
  return (
    <SurfaceLayout>
      <Pressable style={{flex: 1}} onPress={handlePress}>
        <ScrollView style={{padding: 10}}>
          {isLoading ? (
            <View
              style={{
                width: '100%',
                alignItems: 'center',
                height: 650,
                justifyContent: 'center',
              }}>
              <ActivityIndicator
                animating={true}
                color={MD2Colors.green400}
                size="large"
              />
            </View>
          ) : chats?.length > 0 ? (
            chats?.map((elem, index) => {
              const isSelected = isMsgLongPressed[index]?.isSelected;
              // const msgCount =
              //   newMsgCount && parseInt(newMsgCount.count) > 0
              //     ? newMsgCount?.count
              //     : elem.msgCount;
              // const lastMsg =
              //   newMsgCount && newMsgCount.lastMsg !== ''
              //     ? newMsgCount.lastMsg
              //     : null;
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
                      const Ids = [userDatas._id, elem.ContactDetails._id]
                        .sort()
                        .join('_');

                      addChat({
                        sender: userDatas._id,
                        receiver: elem.ContactDetails._id,
                        elem: elem,
                        roomID: Ids,
                      });
                      handlePress();

                      socket.emit('clearNewMsg', {
                        id: userDatas._id,
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
