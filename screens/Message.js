import React, {useEffect, useState} from 'react';
import {
  FlatList,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  addContact,
  getContactByUserId,
  requestContactsPermission,
} from '../src/controllers/contacts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createChat,
  deleteMessageById,
  getAllChats,
  getMessage,
  sendMessage,
} from '../src/controllers/chats';
import {io} from 'socket.io-client';
import {iprotecsLapIP, socketServerApi} from '../src/api';
import {Bubble, GiftedChat, Send} from 'react-native-gifted-chat';
import {getAllUsers} from '../src/controllers/auth';
import {useFocusEffect} from '@react-navigation/native';
import TopBar from '../src/components/TopBar';
import DeleteModal from '../src/components/DeleteModel';

function useSocket() {
  const SocketAPI = socketServerApi;

  const [socketIo, setSocketIo] = useState(null);
  useEffect(() => {
    const socket = io(SocketAPI, {
      path: '/socket',
    });
    setSocketIo(socket);
    return () => {
      socket.disconnect();
    };
  }, []);
  return socketIo;
}

export default function Message({route, navigation, ...props}) {
  const {id} = route.params;

  const [formDatas, setformDatas] = useState({
    msg: '',
    userName: '',
  });
  const [userData, setuserData] = useState({});
  const [enableSendBtn, setenableSendBtn] = useState(false);
  const [chatArray, setchatArray] = useState([]);
  const [chatID, setchatID] = useState('');
  const [isMsgLongPressed, setisMsgLongPressed] = useState([]);
  const [isModelOpen, setisModelOpen] = useState(false);
  const [receiverDetails, setreceiverDetails] = useState({});
  const [msgID, setmsgID] = useState('');
  const [isDelete, setisDelete] = useState(false);

  const socket = useSocket();
  const [isProcess, setisProcess] = useState(false);
  const getTime = timeStamp => {
    const date = new Date(timeStamp);
    date.setHours(date.getDate() + 5);
    date.setMinutes(date.getMinutes() + 60);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? 'AM' : 'PM';
    const hours12 = hours % 12 || 12;
    const formatedHour = hours12 < 10 ? '0' + hours12 : hours12;
    const formatedMins = minutes < 10 ? '0' + minutes : minutes;
    const time = `${formatedHour}:${formatedMins} ${period}`;
    return time;
  };
  const BubbleMsg = ({
    text,
    received,
    isSelected,
    handleLongPress,
    handlePress,
    time,
  }) => {
    return (
      <TouchableWithoutFeedback
        onLongPress={handleLongPress}
        onPress={handlePress}>
        <View
          style={{
            minHeight: 60,
            alignItems: received ? 'flex-start' : 'flex-end',
            backgroundColor: isSelected ? '#e9edef0d' : '',
            justifyContent: 'center',
            padding: 5,
            paddingHorizontal: 25,
          }}>
          <View
            style={{
              minWidth: 50,
              backgroundColor: '#064e49',
              borderRadius: 15,
              padding: 5,
              alignItems: 'center',
              justifyContent: 'center',
              borderTopLeftRadius: received ? 0 : 15,
              borderTopEndRadius: received ? 15 : 0,
              paddingVertical: 10,
              flexDirection: 'row',
              gap: 8,
              paddingHorizontal: 10,
            }}>
            <Text style={{color: 'white'}}>{text}</Text>
            <View
              style={{
                justifyContent: 'flex-end',
                height: 20,
              }}>
              <Text style={{color: 'slategray', fontSize: 10}}>{time}</Text>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  useEffect(() => {
    if (socket) {
      socket.on('connection', () => {
        console.log('connected');
      });
      socket.on('disconnect', () => {
        console.log('disconnect');
      });
    }
  }, [socket]);
  useEffect(() => {
    if (formDatas.msg !== '') {
      setenableSendBtn(true);
    } else {
      setenableSendBtn(false);
    }
  }, [formDatas.msg]);

  const fetchData = () => {
    AsyncStorage.getItem('userData').then(data => {
      if (data) {
        const userDetails = JSON.parse(data);
        setuserData(userDetails);
        getContactByUserId(userDetails._id).then(users => {
          if (users) {
            const res = users.find(user => user.ContactDetails._id === id);
            if (res) {
              setreceiverDetails(res);
              // navigation.setOptions({
              //   title: res ? res.ContactDetails.displayName : 'Message',
              // });
            }
          }
        });
        getAllChats(userDetails._id, id).then(chat => {
          if (chat) {
            setchatID(chat._id);
            getMessage(chat._id).then(msg => {
              if (msg) {
                setchatArray(
                  msg.map(elem => ({...elem, time: getTime(elem.createdAt)})),
                );
                setisMsgLongPressed(msg.map(item => ({isSelected: false})));
              }
            });
          }
        });
      }
    });
  };
  useFocusEffect(
    React.useCallback(() => {
      handleSocket();
      fetchData();
    }, []),
  );
  const handleSubmit = e => {
    e.preventDefault();
    if (formDatas.msg !== '') {
      socket.emit('message', {
        chatID: chatID,
        sender: userData._id,
        receiver: id,
        message: formDatas.msg,
      });
      setformDatas({
        msg: '',
        userName: '',
      });
      handleSocket();
    }
  };
  const handleDeleteMsg = () => {
    if (msgID) {
      deleteMessageById(msgID).then(data => {
        if (data.status == 'ok' && data.message == 'deleted') {
          fetchData();
          handlePress();
          setisModelOpen(false);
          ToastAndroid.show('Message Deleted', ToastAndroid.SHORT);
        } else {
          setisModelOpen(false);
          ToastAndroid.show('Failed', ToastAndroid.SHORT);
        }
      });
    }
  };
  const handleSocket = async () => {
    if (socket) {
      socket.on('message', data => {
        if (chatID && data) {
          const filteredMsg = data.filter(msg => msg.chatID == chatID);
          if (filteredMsg) {
            setchatArray(
              filteredMsg.map(elem => ({
                ...elem,
                time: getTime(elem.createdAt),
              })),
            );
          }
        }
      });
    }
  };
  const handleOnchange = (value, name) => {
    setformDatas(prev => ({...prev, [name]: value}));
  };
  const handleLongPress = (index, id) => {
    const updatedStates = [...isMsgLongPressed];
    updatedStates[index].isSelected = true;
    setisMsgLongPressed(updatedStates);
    setmsgID(id);
    setisDelete(true);
  };
  const handlePress = () => {
    const updatedStates = isMsgLongPressed?.map(() => ({isSelected: false}));
    setisMsgLongPressed(updatedStates);
    setisDelete(false);
  };
  const handleModelClose = () => {
    setisModelOpen(false);
    handlePress();
  };
  return (
    <View style={{flex: 1}}>
      <TopBar
        arrow={true}
        title={receiverDetails ? receiverDetails.name : 'Message'}
        lefOnPress={() => navigation.navigate('Home')}
        rightOnPress={() => {
          setisModelOpen(true);
        }}
        isDelete={isDelete}
      />
      <Pressable style={{flex: 1}} onPress={handlePress}>
        <ImageBackground
          source={require('../src/assets/chatBg.png')} // specify the path to your image
          style={styles.backgroundImage}>
          <FlatList
            style={{
              flexDirection: 'column-reverse',
            }}
            data={chatArray}
            renderItem={({item, index}) => (
              <BubbleMsg
                text={item.message}
                time={item.time}
                received={item.sender !== userData._id}
                isSelected={isMsgLongPressed[index]?.isSelected}
                handlePress={handlePress}
                handleLongPress={() => {
                  handleLongPress(index, item._id);
                }}
              />
            )}
            keyExtractor={item => item._id}
          />
          {/* <ScrollView>
          {chatArray.map((item, index) => {
            return (
              <BubbleMsg
                key={index}
                id={item._id}
                text={item.message}
                received={item.sender !== userData._id}
              />
            );
          })}
        </ScrollView> */}
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Message"
              style={{
                backgroundColor: '#2d383e',
                color: 'white',
                borderRadius: 30,
                width: enableSendBtn ? '80%' : '95%',
                padding: 15,
              }}
              value={formDatas.msg ? formDatas.msg : ''}
              onChangeText={value => {
                handleOnchange(value, 'msg');
              }}
            />
            {enableSendBtn && (
              <TouchableOpacity onPress={handleSubmit} style={styles.sendBtn}>
                <Image source={require('../src/assets/send.png')} />
              </TouchableOpacity>
            )}
          </View>
        </ImageBackground>
        <DeleteModal
          handleModelClose={handleModelClose}
          visible={isModelOpen}
          handleDelete={handleDeleteMsg}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    height: '100%', // Make sure the image takes the entire screen
    resizeMode: 'cover', // Resize the image to cover the entire container
    justifyContent: 'center', // Center the content inside the container
  },
  content: {
    flexDirection: 'column-reverse',
    padding: 10,
    gap: 2,
  },
  inputContainer: {
    marginBottom: 10,
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 3,
  },
  messageCardContainer: {
    marginVertical: 3,
    width: 'auto',
  },
  messageCardtext: {
    backgroundColor: '#064e49',
    width: 'auto',
  },
  sendBtn: {
    backgroundColor: '#14a95f',
    padding: 15,
    borderRadius: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
