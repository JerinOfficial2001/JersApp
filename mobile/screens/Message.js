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
  SectionList,
  Linking,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import Video from 'react-native-video';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { expressApi } from '../src/api';
import {addContact, getContactByUserId} from '../src/controllers/contacts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createChat,
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
import {getTime, groupMessagesByDate} from '../utils/methods/Date&Time';
import SectionHeader from '../src/components/SectionHeader';
import VideoCallModal from '../src/components/VideoCallModal';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const AudioPlayer = ({ fileUrl, received, theme }) => {
  const [paused, setPaused] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef(null);

  const formatTime = (secs) => {
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handlePlayPause = () => {
    setPaused(!paused);
  };

  const handleProgress = (data) => {
    setCurrentTime(data.currentTime);
  };

  const handleLoad = (data) => {
    setDuration(data.duration);
  };

  const handleEnd = () => {
    setPaused(true);
    setCurrentTime(0);
    videoRef.current?.seek(0);
  };

  const textColor = received ? theme.bubbleReceiverTextColor : theme.bubbleSenderTextColor;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4, width: 220 }}>
      <Video
        ref={videoRef}
        source={{ uri: fileUrl }}
        paused={paused}
        onProgress={handleProgress}
        onLoad={handleLoad}
        onEnd={handleEnd}
        audioOnly={true}
        playInBackground={false}
        style={{ width: 0, height: 0 }}
      />
      <TouchableOpacity onPress={handlePlayPause}>
        <MaterialCommunityIcons
          name={paused ? 'play-circle' : 'pause-circle'}
          size={32}
          color={textColor}
        />
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 12, color: textColor, fontWeight: '500' }}>
          Voice note
        </Text>
        <Text style={{ fontSize: 10, color: textColor, opacity: 0.8 }}>
          {formatTime(currentTime)} / {formatTime(duration || 0)}
        </Text>
      </View>
    </View>
  );
};

export default function Message({route, navigation, ...props}) {
  const {id, userID, receiverId, roomID, name: paramName, image: paramImage} = route.params;
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

  // const {
  //   data: AllMessages,
  //   refetch,
  //   isLoading,
  // } = useQuery({
  //   queryKey: ['group'],
  //   queryFn: () =>
  //     GetGroupByID({id: Data?._id, token: Data?.accessToken, groupID: id}),
  //   enabled: !!Data && !!Data._id,
  // });

  const [isTyping, setisTyping] = useState(null);
  const socketListenerRef = useRef(false);

  useEffect(() => {
    socket.on('user_typing', data => {
      setisTyping(data);
    });
    // Cleanup on unmount
    return () => {
      socket.off('user_typing');
      socket.off('newMessage');
      socket.off('messages_read');
      socket.off('messages_delivered');
      socketListenerRef.current = false;
    };
  }, [socket]);

  const [formDatas, setformDatas] = useState({
    msg: '',
    userName: '',
  });
  const [userData, setuserData] = useState({});
  const [enableSendBtn, setenableSendBtn] = useState(false);
  const [chatArray, setchatArray] = useState([]);
  const [chatID, setchatID] = useState('');
  const chatIDRef = useRef('');
  const [isMsgLongPressed, setisMsgLongPressed] = useState([]);

  const [isRecording, setIsRecording] = useState(false);
  const audioRecorderPlayer = useRef(new AudioRecorderPlayer()).current;
  const [isModelOpen, setisModelOpen] = useState(false);
  const [receiverDetails, setreceiverDetails] = useState({
    name: paramName || 'Message',
    image: paramImage,
  });
  const [msgID, setmsgID] = useState('');
  const [isDelete, setisDelete] = useState(false);
  const {jersAppTheme, setpageName, Data} = useContext(MyContext);
  const scrollViewRef = useRef();
  const [isOpenVideo, setisOpenVideo] = useState(false);
  const BubbleMsg = ({
    text,
    received,
    isSelected,
    handleLongPress,
    handlePress,
    time,
    status,
    fileUrl,
    fileType,
  }) => {
    const fullFileUrl = fileUrl ? (fileUrl.startsWith('http') ? fileUrl : expressApi + fileUrl) : '';
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
              minWidth: 70,
              maxWidth: 260,
              backgroundColor: received
                ? jersAppTheme.bubbleReceiverBgColor
                : jersAppTheme.bubbleSenderBgColor,
              borderRadius: 15,
              padding: 8,
              borderTopLeftRadius: received ? 0 : 15,
              borderTopEndRadius: received ? 15 : 0,
              flexDirection: 'column',
              gap: 4,
            }}>
            {fullFileUrl ? (
              <View style={{ marginBottom: 4 }}>
                {fileType === 'image' && (
                  <Image
                    source={{ uri: fullFileUrl }}
                    style={{ width: 220, height: 160, borderRadius: 12 }}
                    resizeMode="cover"
                  />
                )}
                {fileType === 'video' && (
                  <Video
                    source={{ uri: fullFileUrl }}
                    style={{ width: 220, height: 160, borderRadius: 12, backgroundColor: 'black' }}
                    controls={true}
                    paused={true}
                    resizeMode="contain"
                  />
                )}
                {fileType === 'audio' && (
                  <AudioPlayer fileUrl={fullFileUrl} received={received} theme={jersAppTheme} />
                )}
                {fileType === 'document' && (
                  <TouchableOpacity
                    onPress={() => Linking.openURL(fullFileUrl)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      backgroundColor: '#00000018',
                      padding: 10,
                      borderRadius: 10,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="file-document"
                      size={22}
                      color={received ? jersAppTheme.bubbleReceiverTextColor : jersAppTheme.bubbleSenderTextColor}
                    />
                    <Text
                      numberOfLines={1}
                      style={{
                        fontSize: 12,
                        textDecorationLine: 'underline',
                        color: received ? jersAppTheme.bubbleReceiverTextColor : jersAppTheme.bubbleSenderTextColor,
                        maxWidth: 160,
                      }}
                    >
                      {fileUrl.split('/').pop() || 'Download File'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : null}
            {text ? (
              <Text
                style={{
                  color: received
                    ? jersAppTheme.bubbleReceiverTextColor
                    : jersAppTheme.bubbleSenderTextColor,
                }}>
                {text}
              </Text>
            ) : null}
            <View
              style={{
                alignSelf: 'flex-end',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                marginTop: 2,
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
              {!received && (
                <MaterialCommunityIcons
                  name={status === 'sent' ? 'check' : 'check-all'}
                  size={14}
                  color={
                    status === 'read'
                      ? '#34B7F1'
                      : jersAppTheme.bubblesSenderSubTextColor || '#686868'
                  }
                />
              )}
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
  const scrollToEnd = (w, h) => {
    scrollViewRef?.current?.getScrollResponder()?.scrollTo({
      y: h - listViewHeight,
    });
  };

  const fetchData = () => {
    const userDetails = Data;
    setuserData(userDetails);
    getContactByUserId(userDetails._id).then(users => {
      if (users.data) {
        const res = users.data.find(user => user.ContactDetails._id == id);
        if (res) {
          setreceiverDetails(res);
        }
      }
    });
    getAllChats(userDetails._id, id).then(chat => {
      if (chat) {
        setchatID(chat._id);
        chatIDRef.current = chat._id;
        socket?.emit('roomID', chat._id);
        socket?.emit('mark_as_read', { chatID: chat._id, userID: userDetails._id });
        getMessage(chat._id).then(msg => {
          if (msg) {
            // scrollViewRef.current?.scrollToEnd({animated: true});
            // scrollToEnd();
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
      } else {
        createChat({ sender: userDetails._id, receiver: id }).then(newChat => {
          if (newChat) {
            setchatID(newChat._id);
            chatIDRef.current = newChat._id;
            socket?.emit('roomID', newChat._id);
          }
        });
      }
    });
  };
  useFocusEffect(
    React.useCallback(() => {
      handleSocket();
      if (Data) {
        fetchData();
      }
      setpageName('Message');
    }, [Data]),
  );
  const handleSubmit = () => {
    if (formDatas.msg !== '') {
      const msgPayload = {
        chatID: chatID,
        sender: userData._id,
        receiver: id,
        message: formDatas.msg,
        name: userData.name,
        Contact_id: receiverDetails?._id,
      };
      socket.emit('message', msgPayload);

      setformDatas({msg: '', userName: ''});
      Keyboard.dismiss();
    }
  };

  const handlePickDocument = async () => {
    try {
      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.allFiles],
      });
      if (res && chatID) {
        const formData = new FormData();
        formData.append('file', {
          uri: res.uri,
          name: res.name || 'file',
          type: res.type || 'application/octet-stream',
        });

        const uploadRes = await fetch(`${expressApi}/api/message/upload`, {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${Data.accessToken}`,
          },
        });
        const uploadData = await uploadRes.json();
        if (uploadData && uploadData.status === 'ok' && uploadData.fileUrl) {
          let fileType = 'document';
          if (res.type?.startsWith('image/')) fileType = 'image';
          else if (res.type?.startsWith('video/')) fileType = 'video';
          else if (res.type?.startsWith('audio/')) fileType = 'audio';

          const msgPayload = {
            chatID: chatID,
            sender: userData._id,
            receiver: id,
            message: `Sent a ${fileType}`,
            name: userData.name,
            Contact_id: receiverDetails?._id,
            fileUrl: uploadData.fileUrl,
            fileType: fileType,
          };
          socket.emit('message', msgPayload);
        }
      }
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        console.error('Document picker error:', err);
      }
    }
  };

  const startRecording = async () => {
    if (Platform.OS === 'android') {
      try {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);

        if (
          grants['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('permissions granted');
        } else {
          ToastAndroid.show('Microphone permission denied', ToastAndroid.SHORT);
          return;
        }
      } catch (err) {
        console.warn(err);
        return;
      }
    }

    try {
      setIsRecording(true);
      const result = await audioRecorderPlayer.startRecorder();
      console.log('Recording started at path:', result);
    } catch (err) {
      setIsRecording(false);
      console.error('startRecorder error:', err);
    }
  };

  const stopRecording = async () => {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      setIsRecording(false);
      console.log('Recording stopped. File at:', result);

      if (result && chatID) {
        const formData = new FormData();
        formData.append('file', {
          uri: result,
          name: `voice-note-${Date.now()}.mp4`,
          type: 'audio/mp4',
        });

        const uploadRes = await fetch(`${expressApi}/api/message/upload`, {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${Data.accessToken}`,
          },
        });
        const uploadData = await uploadRes.json();
        if (uploadData && uploadData.status === 'ok' && uploadData.fileUrl) {
          const msgPayload = {
            chatID: chatID,
            sender: userData._id,
            receiver: id,
            message: 'Voice note',
            name: userData.name,
            Contact_id: receiverDetails?._id,
            fileUrl: uploadData.fileUrl,
            fileType: 'audio',
          };
          socket.emit('message', msgPayload);
        }
      }
    } catch (err) {
      setIsRecording(false);
      console.error('stopRecorder error:', err);
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
  const handleSocket = () => {
    if (socket && !socketListenerRef.current) {
      socketListenerRef.current = true;
      // Listen for newMessage event (server now emits individual messages)
      socket.on('newMessage', data => {
        if (data && data.chatID === chatIDRef.current) {
          setchatArray(prev => {
            // Avoid duplicate messages
            const exists = prev.some(m => m._id === data._id);
            if (exists) return prev;
            return [...prev, {...data, time: getTime(data.createdAt)}];
          });
          setisMsgLongPressed(prev => [...prev, {isSelected: false}]);

          if (data.sender !== (userData._id || Data?._id)) {
            socket.emit('mark_as_read', { chatID: chatIDRef.current, userID: userData._id || Data?._id });
          }
        }
      });

      socket.on('messages_read', data => {
        if (data && data.chatID === chatIDRef.current) {
          setchatArray(prev =>
            prev.map(msg =>
              msg.receiver === data.userID ? { ...msg, status: 'read' } : msg
            )
          );
        }
      });

      socket.on('messages_delivered', data => {
        if (data && data.receiver === receiverId) {
          setchatArray(prev =>
            prev.map(msg =>
              msg.status === 'sent' ? { ...msg, status: 'delivered' } : msg
            )
          );
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
      height: '100%',
      resizeMode: 'cover',
      justifyContent: 'center',
      position: 'relative',
    },
    content: {
      flexDirection: 'column-reverse',
      padding: 10,
      gap: 2,
    },
    inputContainer: {
      marginBottom: 10,
      marginTop: 6,
      marginHorizontal: 8,
      justifyContent: 'center',
      alignItems: 'flex-end',
      flexDirection: 'row',
      gap: 8,
    },
    inputBar: {
      flex: 1,
      borderRadius: 25,
      paddingHorizontal: 16,
      paddingVertical: 8,
      minHeight: 48,
      justifyContent: 'center',
    },
    textInput: {
      fontSize: 15,
      maxHeight: 120,
      paddingVertical: 4,
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
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 3,
    },
  });

  const UserTyping =
    isTyping && isTyping?.id == receiverId ? isTyping.isTyping : false;
  const UserWatching =
    isWatching && isWatching?.id == receiverId ? isWatching.isWatching : false;

  const groupedMessages = groupMessagesByDate(chatArray);
  const sections = groupedMessages
    ? Object.keys(groupedMessages).map(date => ({
        title: date,
        data: groupedMessages[date],
      }))
    : [];
  const [listViewHeight, setListViewHeight] = useState(undefined);
  return (
    <View style={{flex: 1, backgroundColor: jersAppTheme.appBar}}>
      <TopBar
        isTyping={UserTyping}
        subtitle={isOnline(receiverId)}
        arrow={true}
        title={receiverDetails ? receiverDetails.name : 'Message'}
        lefOnPress={() => navigation.navigate('Home')}
        rightOnPress={() => {
          // setisModelOpen(true);
          navigation.navigate('VideoCall', {
            receiverId,
            name: receiverDetails?.name || paramName || 'User',
          });
          // setisOpenVideo(true);
        }}
        showVideo={true}
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
              return (
                <BubbleMsg
                  text={item.message}
                  time={item.time}
                  received={item.sender !== userData._id}
                  isSelected={isMsgLongPressed[index]?.isSelected}
                  handlePress={handlePress}
                  status={item.status}
                  fileUrl={item.fileUrl}
                  fileType={item.fileType}
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

          <View style={styles.inputContainer}>
            <TouchableOpacity
              onPress={handlePickDocument}
              style={[
                styles.sendBtn,
                {
                  backgroundColor: jersAppTheme.model || '#2D3544',
                  marginRight: -2,
                },
              ]}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="paperclip" size={22} color="white" />
            </TouchableOpacity>

            <View
              style={[
                styles.inputBar,
                {backgroundColor: jersAppTheme.model || '#2D3544'},
              ]}>
              <TextInput
                placeholder="Message..."
                placeholderTextColor={jersAppTheme.placeholderColor}
                style={[styles.textInput, {color: jersAppTheme.title}]}
                value={formDatas.msg ? formDatas.msg : ''}
                onChangeText={value => {
                  handleOnchange(value, 'msg');
                }}
                multiline
                maxLength={2000}
              />
            </View>
            {enableSendBtn ? (
              <TouchableOpacity
                onPress={handleSubmit}
                style={[
                  styles.sendBtn,
                  {
                    backgroundColor: jersAppTheme.badgeColor,
                  },
                ]}
                activeOpacity={0.8}>
                <Send color="white" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={isRecording ? stopRecording : startRecording}
                style={[
                  styles.sendBtn,
                  {
                    backgroundColor: isRecording ? '#E53E3E' : jersAppTheme.badgeColor,
                  },
                ]}
                activeOpacity={0.8}>
                <MaterialCommunityIcons
                  name={isRecording ? 'stop' : 'microphone'}
                  size={22}
                  color="white"
                />
              </TouchableOpacity>
            )}
          </View>
        </ImageBackground>
        <DeleteModal
          handleModelClose={handleModelClose}
          visible={isModelOpen}
          handleDelete={handleDeleteMsg}
        />
        <VideoCallModal
          receiverId={receiverId}
          Data={Data}
          handleModelClose={() => {
            setisOpenVideo(false);
          }}
          visible={isOpenVideo}
          // handleDelete={handleDeleteMsg}
        />
      </Pressable>
    </View>
  );
}
