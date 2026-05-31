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
import Swipeable from 'react-native-gesture-handler/Swipeable';
import Video from 'react-native-video';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { expressApi } from '../src/api';
import {addContact, getContactByUserId} from '../src/controllers/contacts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createChat,
  deleteMessageById,
  deleteMessageForMe,
  deleteMessageForEveryone,
  addReaction,
  removeReaction,
  getAllChats,
  getMessage,
} from '../src/controllers/chats';
import {useFocusEffect} from '@react-navigation/native';
import TopBar from '../src/components/TopBar';
import MessageActionModal from '../src/components/MessageActionModal';
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
  const [replyingTo, setReplyingTo] = useState(null);
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
    deletedForEveryone,
    reactions = [],
    msgId,
    onReactionPress,
    replyTo,
    onSwipeToReply,
  }) => {
    const fullFileUrl = fileUrl ? (fileUrl.startsWith('http') ? fileUrl : expressApi + fileUrl) : '';

    const renderRightActions = () => (
      <View style={{ width: 60, justifyContent: 'center', alignItems: 'center' }}>
        <MaterialCommunityIcons name="reply" size={24} color={jersAppTheme.placeholderColor || 'gray'} />
      </View>
    );

    if (fileType === 'call_log') {
      return (
        <View style={{ alignSelf: 'center', marginVertical: 8, padding: 8, backgroundColor: jersAppTheme.model || '#2D3544', borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <MaterialCommunityIcons name="phone" size={16} color="white" />
          <Text style={{ color: 'white', fontSize: 12 }}>{text}</Text>
        </View>
      );
    }

    return (
      <Swipeable
        renderRightActions={renderRightActions}
        onSwipeableOpen={(direction) => {
          if (onSwipeToReply) {
            onSwipeToReply(msgId, text, received ? 'Them' : 'You', fileType);
          }
        }}
      >
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
            {replyTo && (
              <View style={{
                backgroundColor: 'rgba(0,0,0,0.1)',
                borderLeftWidth: 4,
                borderLeftColor: jersAppTheme.badgeColor || '#34B7F1',
                borderRadius: 4,
                padding: 6,
                marginBottom: 4,
              }}>
                <Text style={{ color: jersAppTheme.badgeColor || '#34B7F1', fontSize: 12, fontWeight: 'bold' }}>{replyTo.sender === userData._id ? 'You' : (replyTo.senderName || 'Contact')}</Text>
                <Text style={{ color: received ? jersAppTheme.bubbleReceiverTextColor : jersAppTheme.bubbleSenderTextColor, fontSize: 11 }} numberOfLines={2}>
                  {replyTo.fileType ? `📷 ${replyTo.fileType}` : replyTo.message}
                </Text>
              </View>
            )}
            {isSelected && !deletedForEveryone && (
              <View style={{
                position: 'absolute',
                top: -45,
                left: received ? 0 : undefined,
                right: received ? undefined : 0,
                backgroundColor: jersAppTheme.model || '#2D3544',
                flexDirection: 'row',
                padding: 8,
                borderRadius: 20,
                gap: 12,
                zIndex: 10,
                elevation: 5,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
              }}>
                {['👍', '❤️', '😂', '😮', '😢', '🙏'].map(emoji => (
                  <TouchableOpacity key={emoji} onPress={() => onReactionPress(msgId, emoji)}>
                    <Text style={{ fontSize: 24 }}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {deletedForEveryone ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4 }}>
                <MaterialCommunityIcons name="block-helper" size={14} color={jersAppTheme.placeholderColor || 'gray'} />
                <Text style={{ color: jersAppTheme.placeholderColor || 'gray', fontStyle: 'italic', fontSize: 13 }}>
                  This message was deleted
                </Text>
              </View>
            ) : (
              <>
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
              </>
            )}
            
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
            
            {reactions && reactions.length > 0 && (
              <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                backgroundColor: jersAppTheme.model || '#2D3544',
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 12,
                position: 'absolute',
                bottom: -10,
                right: received ? undefined : 10,
                left: received ? 10 : undefined,
                borderWidth: 1,
                borderColor: jersAppTheme.appBar,
              }}>
                {[...new Set(reactions.map(r => r.emoji))].map(emoji => (
                  <Text key={emoji} style={{ fontSize: 12 }}>
                    {emoji} {reactions.filter(r => r.emoji === emoji).length > 1 ? reactions.filter(r => r.emoji === emoji).length : ''}
                  </Text>
                ))}
              </View>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Swipeable>
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
        replyTo: replyingTo ? {
          messageId: replyingTo.msgId,
          sender: replyingTo.sender === 'You' ? userData._id : id,
          senderName: replyingTo.sender,
          message: replyingTo.text,
          fileType: replyingTo.fileType,
        } : null,
      };
      socket.emit('message', msgPayload);

      setformDatas({msg: '', userName: ''});
      setReplyingTo(null);
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
  const handleDeleteForMe = () => {
    if (msgID) {
      deleteMessageForMe(msgID, userData._id || Data?._id).then(res => {
        if (res.status === 'ok') {
          // Optimistically update UI
          setchatArray(prev => prev.filter(msg => msg._id !== msgID));
          handlePress();
          setisModelOpen(false);
          ToastAndroid.show('Message deleted for me', ToastAndroid.SHORT);
        } else {
          setisModelOpen(false);
          ToastAndroid.show('Failed to delete', ToastAndroid.SHORT);
        }
      });
    }
  };

  const handleDeleteForEveryone = () => {
    if (msgID) {
      deleteMessageForEveryone(msgID, userData._id || Data?._id).then(res => {
        if (res.status === 'ok') {
          // Optimistically update UI
          setchatArray(prev =>
            prev.map(msg =>
              msg._id === msgID
                ? { ...msg, deletedForEveryone: true, message: '', fileUrl: null, fileType: null, reactions: [] }
                : msg
            )
          );
          // Emit socket event
          socket?.emit('delete_for_everyone', { chatID: chatIDRef.current, messageId: msgID });
          
          handlePress();
          setisModelOpen(false);
          ToastAndroid.show('Message deleted for everyone', ToastAndroid.SHORT);
        } else {
          setisModelOpen(false);
          ToastAndroid.show(res.message || 'Failed to delete', ToastAndroid.SHORT);
        }
      });
    }
  };

  const handleReaction = (messageId, emoji) => {
    const userId = userData._id || Data?._id;
    const msg = chatArray.find(m => m._id === messageId);
    if (!msg) return;

    // Check if the user already reacted with this emoji
    const existingReaction = msg.reactions?.find(r => r.userId === userId);
    
    if (existingReaction && existingReaction.emoji === emoji) {
      // Remove reaction if it's the same emoji
      removeReaction(messageId, userId).then(res => {
        if (res.status === 'ok') {
          socket?.emit('message_reaction', { chatID: chatIDRef.current, messageId, userId, type: 'remove' });
          handlePress(); // Close reaction bar
        }
      });
    } else {
      // Add or update reaction
      addReaction(messageId, userId, emoji).then(res => {
        if (res.status === 'ok') {
          socket?.emit('message_reaction', { chatID: chatIDRef.current, messageId, userId, emoji, type: 'add' });
          handlePress(); // Close reaction bar
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

      socket.on('delete_for_everyone', data => {
        if (data && data.chatID === chatIDRef.current) {
          setchatArray(prev =>
            prev.map(msg =>
              msg._id === data.messageId ? { ...msg, deletedForEveryone: true, message: '', fileUrl: null, fileType: null } : msg
            )
          );
        }
      });

      socket.on('message_reaction', data => {
        if (data && data.chatID === chatIDRef.current) {
          setchatArray(prev =>
            prev.map(msg => {
              if (msg._id === data.messageId) {
                let newReactions = msg.reactions ? [...msg.reactions] : [];
                if (data.type === 'add') {
                  newReactions = newReactions.filter(r => r.userId !== data.userId);
                  newReactions.push({ userId: data.userId, emoji: data.emoji });
                } else if (data.type === 'remove') {
                  newReactions = newReactions.filter(r => r.userId !== data.userId);
                }
                return { ...msg, reactions: newReactions };
              }
              return msg;
            })
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
    setisModelOpen(true);
  };
  const handleSingleTap = (index, id) => {
    const isCurrentlySelected = isMsgLongPressed[index]?.isSelected;
    const updatedStates = isMsgLongPressed?.map(() => ({isSelected: false}));
    
    if (!isCurrentlySelected) {
      updatedStates[index].isSelected = true;
      setmsgID(id);
    }
    
    setisMsgLongPressed(updatedStates);
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
                  handlePress={() => {
                    handleSingleTap(index, item._id);
                  }}
                  status={item.status}
                  fileUrl={item.fileUrl}
                  fileType={item.fileType}
                  deletedForEveryone={item.deletedForEveryone}
                  reactions={item.reactions}
                  msgId={item._id}
                  replyTo={item.replyTo}
                  onSwipeToReply={(msgId, text, sender, fileType) => {
                    setReplyingTo({ msgId, text, sender, fileType });
                  }}
                  onReactionPress={handleReaction}
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

          {replyingTo && (
            <View style={{
              backgroundColor: jersAppTheme.model || '#2D3544',
              marginHorizontal: 8,
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              padding: 10,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderLeftWidth: 4,
              borderLeftColor: jersAppTheme.badgeColor || '#34B7F1',
              marginBottom: -6,
            }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: jersAppTheme.badgeColor || '#34B7F1', fontWeight: 'bold', fontSize: 12 }}>
                  Replying to {replyingTo.sender}
                </Text>
                <Text style={{ color: jersAppTheme.placeholderColor, fontSize: 12 }} numberOfLines={1}>
                  {replyingTo.fileType ? `📷 ${replyingTo.fileType}` : replyingTo.text}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setReplyingTo(null)}>
                <MaterialCommunityIcons name="close" size={20} color={jersAppTheme.placeholderColor} />
              </TouchableOpacity>
            </View>
          )}

          <View style={[styles.inputContainer, replyingTo ? { marginTop: 0 } : {}]}>
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
        <MessageActionModal
          visible={isModelOpen}
          handleClose={handleModelClose}
          handleDeleteForMe={handleDeleteForMe}
          handleDeleteForEveryone={handleDeleteForEveryone}
          showDeleteForEveryone={(() => {
            if (!msgID) return false;
            const selectedMsg = chatArray.find(m => m._id === msgID);
            if (!selectedMsg) return false;
            if (selectedMsg.sender !== (userData._id || Data?._id)) return false;
            const ONE_HOUR = 3600000;
            const now = new Date();
            const msgTime = new Date(selectedMsg.createdAt || new Date());
            return (now - msgTime) <= ONE_HOUR;
          })()}
          jersAppTheme={jersAppTheme}
        />
        <VideoCallModal
          receiverId={id}
          Data={Data}
          chatID={chatIDRef.current}
          handleModelClose={() => {
            setisOpenVideo(false);
          }}
          visible={isOpenVideo}
        />
      </Pressable>
    </View>
  );
}
