import React, {useContext, useEffect, useState, useRef} from 'react';
import {
  FlatList,
  Image,
  ImageBackground,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {addContact, getContactByUserId} from '../src/controllers/contacts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  deleteMessageById,
  getAllChats,
  getMessage,
} from '../src/controllers/chats';
import {useFocusEffect} from '@react-navigation/native';
import TopBar from '../src/components/TopBar';
import DeleteModal from '../src/components/DeleteModel';
import Send from '../src/assets/svg/send';
import {JersAppThemeSchema} from '../utils/theme';
import {MyContext} from '../App';
import {useSocketHook} from '../utils/socket';
import {useQuery} from '@tanstack/react-query';
import SurfaceLayout from '../src/Layouts/SurfaceLayout';

export default function Message({route, navigation, ...props}) {
  const {id, userID, receiverId, roomID} = route.params;
  const {
    socket,
    socketUserWatching,
    socketUserTyping,
    socketUserTyped,
    socketUserWatched,
    isOnline,
    isWatching,
    socketUserID,
    socketUserConnected,
    setisWatching,
  } = useSocketHook();

  const [isTyping, setisTyping] = useState(null);
  useEffect(() => {
    socket.on('user_typing', data => {
      setisTyping(data);
    });
  }, []);

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
  // const [jersAppTheme, setjersAppTheme] = useState(JersAppThemeSchema);
  const {jersAppTheme, setpageName} = useContext(MyContext);
  const scrollViewRef = useRef();
  const getTime = timeStamp => {
    const date = new Date(timeStamp);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    return hours + ':' + formattedMinutes + ' ' + ampm;
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
              backgroundColor: received
                ? jersAppTheme.bubbleReceiverBgColor
                : jersAppTheme.bubbleSenderBgColor,
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
            <Text
              style={{
                color: received
                  ? jersAppTheme.bubbleReceiverTextColor
                  : jersAppTheme.bubbleSenderTextColor,
              }}>
              {text}
            </Text>
            <View
              style={{
                justifyContent: 'flex-end',
                height: 20,
              }}>
              <Text
                style={{
                  color: received
                    ? jersAppTheme.bubblesReceiverSubTextColor
                    : jersAppTheme.bubblesSenderSubTextColor,
                  fontSize: 10,
                }}>
                {time}
              </Text>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  };
  useFocusEffect(
    React.useCallback(() => {
      if (socket) {
        socketUserID(userID ? userID : userData._id);
        socketUserConnected({
          id: userID ? userID : userData._id,
          status: 'online',
        });
        socketUserWatching({
          id: userID ? userID : userData._id,
          receiverId,
        });
        Keyboard.addListener('keyboardDidHide', () => {
          socketUserTyped({id: userID ? userID : userData._id, receiverId});
        });
        Keyboard.addListener('keyboardDidShow', () => {
          socketUserTyping({
            id: userID ? userID : userData._id,
            receiverId,
          });
          setisTyping(null);
        });
      }
      return () => {
        if (socket) {
          socketUserWatched({id: userID ? userID : userData._id, receiverId});
          setisWatching(null);
        }
      };
    }, [socket]),
  );

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
            const res = users.find(user => user.ContactDetails._id == id);
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
                scrollViewRef.current?.scrollToEnd({animated: true});
                setchatArray(
                  msg.map(elem => {
                    return {
                      ...elem,
                      time: getTime(elem.createdAt),
                    };
                  }),
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
      setpageName('Message');
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
        name: userData.name,
      });

      setformDatas({
        msg: '',
        userName: '',
      });
      handleSocket();
      Keyboard.dismiss();
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
  const styles = StyleSheet.create({
    backgroundImage: {
      height: '100%', // Make sure the image takes the entire screen
      resizeMode: 'cover', // Resize the image to cover the entire container
      justifyContent: 'center', // Center the content inside the container
      position: 'relative',
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
      backgroundColor: jersAppTheme.appBar,
      padding: 15,
      borderRadius: 200,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
  const UserTyping =
    isTyping && isTyping?.id == receiverId ? isTyping.isTyping : false;
  const UserWatching =
    isWatching && isWatching?.id == receiverId ? isWatching.isWatching : false;

  return (
    <View style={{flex: 1, backgroundColor: jersAppTheme.appBar}}>
      <TopBar
        isTyping={UserTyping}
        subtitle={isOnline(receiverId)}
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
          imageStyle={{borderTopRightRadius: 25, borderTopLeftRadius: 25}}
          source={require('../src/assets/chatBg.png')} // specify the path to your image
          style={styles.backgroundImage}>
          {UserWatching && (
            <Image
              source={require('../src/assets/crossAvatar.png')}
              style={{
                height: 60,
                width: 50,
                position: 'absolute',
                bottom: 70,
                zIndex: 1,
              }}
            />
          )}
          <FlatList
            onContentSizeChange={() => {
              scrollViewRef.current?.scrollToEnd({animated: true});
            }}
            ref={scrollViewRef}
            scrollEnabled
            data={chatArray}
            contentContainerStyle={{
              paddingBottom: UserWatching ? 40 : 0,
            }}
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
                <Send color={jersAppTheme.title} />
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
