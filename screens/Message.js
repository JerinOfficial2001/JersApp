import React, {useContext, useEffect, useState, useRef} from 'react';
import {
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
  SectionList,
  NativeModules,
  Alert,
} from 'react-native';
import {deleteMessageById, getMessage} from '../src/controllers/chats';
import {useFocusEffect} from '@react-navigation/native';
import TopBar from '../src/components/TopBar';
import DeleteModal from '../src/components/DeleteModel';
import Send from '../src/assets/svg/send';
import {MyContext} from '../App';
import {useSocketHook} from '../utils/socket';
import {useQuery} from '@tanstack/react-query';
import {getTime, groupMessagesByDate} from '../utils/methods/Date&Time';
import SectionHeader from '../src/components/SectionHeader';
import VideoCallModal from '../src/components/VideoCallModal';
import Loader from '../src/components/Loader';
import {isContactExist} from '../utils/methods/cleanPhoneNo';
import {requestAddContactPermission} from '../src/controllers/contacts';
import {Button} from 'react-native-paper';
import {Linking} from 'react-native';
import ActionSheetModal from '../src/components/ActionSheetModal';
import {getGroupedMessages} from '../src/controllers/LocalStorage/Message';
export default function Message({route, navigation, ...props}) {
  const {id, userID, roomID, Contact_id, name, userName, phone} = route.params;
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
    offer,
  } = useSocketHook();

  const [isTyping, setisTyping] = useState(null);
  const [formDatas, setformDatas] = useState({
    msg: '',
    userName: '',
  });
  const [enableSendBtn, setenableSendBtn] = useState(false);
  const [isMsgLongPressed, setisMsgLongPressed] = useState([]);
  const [isModelOpen, setisModelOpen] = useState(false);
  const [msgID, setmsgID] = useState('');
  const [isDelete, setisDelete] = useState(false);
  const {jersAppTheme, setpageName, Data} = useContext(MyContext);
  const scrollViewRef = useRef();
  const [isOpenVideo, setisOpenVideo] = useState(false);
  const [isAlreadyInContact, setisAlreadyInContact] = useState(true);
  const [openAddContactModal, setopenAddContactModal] = useState(false);
  useEffect(() => {
    socket.on('user_typing', data => {
      setisTyping(data);
    });
    socket.on('offer', data => {
      navigation.navigate('VideoCall', {
        receiverId: id,
        type: data,
      });
    });
  }, [socket]);
  useFocusEffect(
    React.useCallback(() => {
      if (socket) {
        socketUserID(userID ? userID : Data?._id);
        socketUserConnected({
          id: userID ? userID : Data?._id,
          status: 'online',
        });
        socketUserWatching({
          id: userID ? userID : Data?._id,
          receiverId: id,
        });
        Keyboard.addListener('keyboardDidHide', () => {
          socketUserTyped({id: userID ? userID : Data?._id, receiverId: id});
        });
        Keyboard.addListener('keyboardDidShow', () => {
          socketUserTyping({
            id: userID ? userID : Data?._id,
            receiverId: id,
          });
          setisTyping(null);
        });
      }
      return () => {
        if (socket) {
          socketUserWatched({
            id: userID ? userID : Data?._id,
            receiverId: id,
          });
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
  const {
    data: messages,
    isLoading,
    refetch: refetchMessages,
  } = useQuery({
    queryKey: ['messages', roomID],
    queryFn: getMessage,
    enabled: !!roomID,
  });

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
  const scrollToEnd = (w, h) => {
    scrollViewRef?.current?.getScrollResponder()?.scrollTo({
      y: h - listViewHeight,
    });
  };
  const handleContactExist = async () => {
    const result = await isContactExist(phone);
    if (!result) {
      setisAlreadyInContact(false);
    }
  };
  const handleOpenContact = async () => {
    const isApproved = await requestAddContactPermission();
    if (isApproved) {
      try {
        Linking.openURL('content://com.android.contacts/contacts');
      } catch (error) {
        Alert.alert('Error', 'Failed to open contact creation screen');
      }
    } else {
      console.log('rejected');
    }
  };
  useFocusEffect(
    React.useCallback(() => {
      if (Data) {
        handleContactExist();
      }
      setpageName('Message');
    }, [Data]),
  );
  const handleSubmit = e => {
    e.preventDefault();
    if (formDatas.msg !== '') {
      socket.emit('message', {
        chatID: roomID,
        sender: Data?._id,
        receiver: id,
        message: formDatas.msg,
        name: Data?.name,
        Contact_id,
      });

      setformDatas({
        msg: '',
        userName: '',
      });
      Keyboard.dismiss();
      refetchMessages();
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

  const UserTyping = isTyping && isTyping?.id == id ? isTyping.isTyping : false;
  const UserWatching =
    isWatching && isWatching?.id == id ? isWatching.isWatching : false;

  const [listViewHeight, setListViewHeight] = useState(undefined);

  const groupedMessages = groupMessagesByDate(messages);
  const {
    data: sections,
    isLoading: messagesLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['allMessages'],
    queryFn: () => getGroupedMessages(groupedMessages),
    enabled: !!groupedMessages,
  });
  useEffect(() => {
    if (messages) {
      console.log('test');
      setisMsgLongPressed(messages?.map(item => ({isSelected: false})));
      refetch();
    }
  }, [messages]);
  return (
    <View style={{flex: 1, backgroundColor: jersAppTheme.appBar}}>
      <TopBar
        isTyping={UserTyping}
        subtitle={isOnline(id)}
        arrow={true}
        title={name}
        lefOnPress={() => navigation.navigate('Home')}
        rightOnPress={() => {
          navigation.navigate('VideoCall', {
            receiverId: id,
          });
        }}
        showVideo={true}
        isDelete={isDelete}
      />
      <Pressable style={{flex: 1}} onPress={handlePress}>
        <ImageBackground
          imageStyle={{borderTopRightRadius: 25, borderTopLeftRadius: 25}}
          source={require('../src/assets/chatBg.png')} // specify the path to your image
          style={styles.backgroundImage}>
          {!isAlreadyInContact && (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                marginVertical: 12,
              }}>
              <View
                style={{
                  width: '90%',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  backgroundColor: jersAppTheme.main,
                  borderRadius: 20,
                  padding: 15,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    gap: 10,
                    alignItems: 'flex-end',
                  }}>
                  <Text>{name}</Text>
                  <Text style={{fontSize: 12}}>{'~ ' + userName}</Text>
                </View>
                <Text>Not in contact</Text>
                <View
                  style={{
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row',
                    gap: 10,
                  }}>
                  <Button
                    onPress={handleOpenContact}
                    style={{borderColor: 'gray', borderWidth: 1}}
                    textColor="gray">
                    Open Contacts
                  </Button>
                  <Button
                    onPress={() => {
                      setopenAddContactModal(true);
                    }}
                    style={{borderColor: 'gray', borderWidth: 1}}
                    textColor="green">
                    Add
                  </Button>
                </View>
              </View>
            </View>
          )}
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
          {messagesLoading ? (
            <Loader color={'gray'} />
          ) : (
            <SectionList
              stickySectionHeadersEnabled
              ref={scrollViewRef}
              onLayout={event => {
                setListViewHeight(event.nativeEvent.layout.height);
              }}
              onContentSizeChange={(w, h) => scrollToEnd(w, h)}
              contentContainerStyle={{
                justifyContent: 'flex-end',
                flexGrow: 1,
                paddingBottom: UserWatching ? 40 : 0,
              }}
              scrollEnabled
              sections={sections}
              keyExtractor={(item, index) => item._id}
              renderItem={({item, index}) => {
                const date = getTime(item.createdAt);
                return (
                  <BubbleMsg
                    text={item.message}
                    time={date}
                    received={item.sender !== Data?._id}
                    isSelected={isMsgLongPressed[index]?.isSelected}
                    handlePress={handlePress}
                    handleLongPress={() => {
                      handleLongPress(index, item._id);
                    }}
                  />
                );
              }}
              renderSectionHeader={({section}) => (
                <SectionHeader title={section.title} />
              )}
              ListHeaderComponentStyle={{marginBottom: 10}}
              ItemSeparatorComponent={() => <View style={{height: 5}} />}
            />
          )}

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
        {/* <VideoCallModal
          receiverId={id}
          Data={Data}
          handleModelClose={() => {
            setisOpenVideo(false);
          }}
          visible={isOpenVideo}
          // handleDelete={handleDeleteMsg}
        /> */}
        <ActionSheetModal
          open={openAddContactModal}
          close={setopenAddContactModal}
        />
      </Pressable>
    </View>
  );
}
