import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  FlatList,
  TextInput,
  Keyboard,
  SectionList,
  Platform,
  PermissionsAndroid,
  ToastAndroid,
  Linking,
} from 'react-native';
import React, {
  useCallback,
  useContext,
  useState,
  useRef,
  useEffect,
} from 'react';
import SurfaceLayout from '../src/Layouts/SurfaceLayout';
import {useFocusEffect} from '@react-navigation/native';
import {useQuery} from '@tanstack/react-query';
import {MyContext} from '../App';
import {GetGroupByID} from '../src/controllers/group';
import Loader from '../src/components/Loader';
import IoniconsIcon from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';
import {useSocketHook} from '../utils/socket';
import {
  getGroupMsg,
  deleteGroupMsgForMe,
  deleteGroupMsgForEveryone,
  addGroupReaction,
  removeGroupReaction,
  markGroupMsgAsRead,
} from '../src/controllers/groupMsg';
import {Avatar} from 'react-native-paper';
import {getTime, groupMessagesByDate} from '../utils/methods/Date&Time';
import SectionHeader from '../src/components/SectionHeader';
import {GetMembers} from '../src/controllers/members';
import DocumentPicker from 'react-native-document-picker';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import Video from 'react-native-video';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {expressApi} from '../src/api';
import MessageActionModal from '../src/components/MessageActionModal';
import apiClient from '../src/services/apiClient';

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

export default function GroupMsg({navigation, route}) {
  const {Data, jersAppTheme} = useContext(MyContext);
  const {socketSendGroupMsg, socket, socketJoinGroup, socketRemoveGroup} =
    useSocketHook();
  const {id} = route.params;
  const {
    data: GroupData,
  } = useQuery({
    queryKey: ['group'],
    queryFn: () =>
      GetGroupByID({id: Data?._id, token: Data?.accessToken, groupID: id}),
    enabled: !!Data && !!Data._id,
  });
  const {
    data: Messages,
    refetch: fetchMessages,
    isLoading: isMsgLoading,
  } = useQuery({
    queryKey: ['messages'],
    queryFn: () =>
      getGroupMsg({id: Data?._id, groupID: id}),
    enabled: !!Data && !!Data._id && !!id,
  });
  const {data: allMembers} = useQuery({
    queryKey: ['DBcontacts'],
    queryFn: () =>
      GetMembers({token: Data.accessToken, id: Data._id, groupID: id}),
    enabled: !!Data && !!Data._id,
  });
  const idsToSendMsg = allMembers
    ?.map(i => i.user_id)
    ?.filter(i => i !== Data?._id);

  const [formDatas, setformDatas] = useState({
    msg: '',
    sender_id: Data?._id,
    group_id: id,
  });
  const [enableSendBtn, setenableSendBtn] = useState(false);
  const [chatArray, setchatArray] = useState([]);
  const [isMsgLongPressed, setisMsgLongPressed] = useState([]);
  const [isModelOpen, setisModelOpen] = useState(false);
  const [msgID, setmsgID] = useState('');
  const [isDelete, setisDelete] = useState(false);
  const [usersInGroup, setusersInGroup] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const audioRecorderPlayer = useRef(new AudioRecorderPlayer()).current;
  const scrollViewRef = useRef();

  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        headerTitle: () => (
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
            <Image
              source={
                GroupData && GroupData.image && GroupData.image.url && GroupData.image.url !== 'null'
                  ? {uri: GroupData.image.url}
                  : require('../src/assets/user.png')
              }
              style={{width: 40, height: 40, borderRadius: 15}}
            />
            <TouchableOpacity
              onPress={() => {
                if (GroupData)
                  navigation.navigate('ViewGroupProfile', {
                    id,
                    name: GroupData?.group_name,
                    image:
                      GroupData?.image && GroupData?.image?.url && GroupData?.image?.url !== 'null'
                        ? GroupData.image.url
                        : null,
                    members: GroupData?.members?.length,
                  });
              }}>
              <View style={{flexDirection: 'column'}}>
                <Text
                  style={{
                    color: jersAppTheme.headerText,
                    fontSize: 20,
                    fontWeight: 'bold',
                  }}>
                  {GroupData ? GroupData.group_name : 'MyGroup'}
                </Text>

                <Text
                  style={{
                    color: jersAppTheme.headerText,
                    fontSize: 10,
                  }}>
                  tap here for group info
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        ),
      });
    }, [navigation, id, GroupData]),
  );

  useEffect(() => {
    if (Messages) {
      setchatArray(
        Messages.map(elem => ({
          ...elem,
          time: getTime(elem.createdAt),
        })),
      );
      setisMsgLongPressed(Messages.map(() => ({isSelected: false})));
    }
  }, [Messages]);

  const handlePickDocument = async () => {
    try {
      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.allFiles],
      });
      if (res && id) {
        const formData = new FormData();
        formData.append('file', {
          uri: res.uri,
          name: res.name || 'file',
          type: res.type || 'application/octet-stream',
        });

        const { data: uploadData } = await apiClient.post('/api/message/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        if (uploadData && uploadData.status === 'ok' && uploadData.fileUrl) {
          let fileType = 'document';
          if (res.type?.startsWith('image/')) fileType = 'image';
          else if (res.type?.startsWith('video/')) fileType = 'video';
          else if (res.type?.startsWith('audio/')) fileType = 'audio';

          const msgPayload = {
            group_id: id,
            sender_id: Data._id,
            receivers: idsToSendMsg,
            msg: `Sent a ${fileType}`,
            name: Data.name,
            group_name: GroupData?.group_name,
            fileUrl: uploadData.fileUrl,
            fileType: fileType,
            replyTo: replyingTo ? {
              messageId: replyingTo.msgId,
              sender: replyingTo.sender === 'You' ? Data._id : replyingTo.senderId,
              senderName: replyingTo.sender,
              message: replyingTo.text,
              fileType: replyingTo.fileType,
            } : null,
          };
          socketSendGroupMsg(msgPayload);
          setReplyingTo(null);
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
        if (grants['android.permission.RECORD_AUDIO'] !== PermissionsAndroid.RESULTS.GRANTED) {
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
    } catch (err) {
      setIsRecording(false);
      console.error('startRecorder error:', err);
    }
  };

  const stopRecording = async () => {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      setIsRecording(false);

      if (result && id) {
        const formData = new FormData();
        formData.append('file', {
          uri: result,
          name: `voice-note-${Date.now()}.mp4`,
          type: 'audio/mp4',
        });

        const { data: uploadData } = await apiClient.post('/api/message/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        if (uploadData && uploadData.status === 'ok' && uploadData.fileUrl) {
          const msgPayload = {
            group_id: id,
            sender_id: Data._id,
            receivers: idsToSendMsg,
            msg: 'Voice note',
            name: Data.name,
            group_name: GroupData?.group_name,
            fileUrl: uploadData.fileUrl,
            fileType: 'audio',
            replyTo: replyingTo ? {
              messageId: replyingTo.msgId,
              sender: replyingTo.sender === 'You' ? Data._id : replyingTo.senderId,
              senderName: replyingTo.sender,
              message: replyingTo.text,
              fileType: replyingTo.fileType,
            } : null,
          };
          socketSendGroupMsg(msgPayload);
          setReplyingTo(null);
        }
      }
    } catch (err) {
      setIsRecording(false);
      console.error('stopRecorder error:', err);
    }
  };

  const BubbleMsg = ({
    text,
    received,
    isSelected,
    handleLongPress,
    handlePress,
    time,
    elem,
    onSwipeToReply,
    onReactionPress,
  }) => {
    const isValidFileUrl = elem.fileUrl && elem.fileUrl !== 'null' && elem.fileUrl !== 'undefined';
    const fullFileUrl = isValidFileUrl ? (elem.fileUrl.startsWith('http') ? elem.fileUrl : expressApi + elem.fileUrl) : '';
    const isDeleted = elem.deletedForEveryone;

    const renderRightActions = () => (
      <View style={{ width: 60, justifyContent: 'center', alignItems: 'center' }}>
        <MaterialCommunityIcons name="reply" size={24} color={jersAppTheme.placeholderColor || 'gray'} />
      </View>
    );

    // Calculate ticks based on readBy and usersInGroup/allMembers
    // For groups, single tick = sent, double gray = delivered, double blue = read by everyone (or a certain threshold)
    let tickStatus = 'sent';
    if (!received) {
      // Basic check: if readBy has some users, it's delivered. If readBy has everyone except sender, it's read.
      const totalMembers = allMembers ? allMembers.length - 1 : 1;
      const readCount = elem.readBy ? elem.readBy.filter(u => u !== Data._id).length : 0;
      if (readCount > 0) tickStatus = 'delivered';
      if (readCount >= totalMembers && totalMembers > 0) tickStatus = 'read';
    }

    return (
      <Swipeable
        renderRightActions={renderRightActions}
        onSwipeableOpen={(direction) => {
          if (onSwipeToReply && !isDeleted) {
            onSwipeToReply(elem._id, text, received ? elem.name : 'You', elem.fileType, elem.sender_id);
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
              backgroundColor: isSelected ? 'rgba(0,0,0,0.05)' : 'transparent',
              justifyContent: 'center',
              paddingVertical: 6,
              paddingHorizontal: 16,
            }}>
            <View style={{flexDirection: 'row', gap: 8, alignItems: 'flex-end', maxWidth: '85%'}}>
              {received && (
                <View style={{ marginBottom: 2, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 3 }}>
                    <Avatar.Image
                      size={32}
                      source={
                        elem && elem.image && elem.image.url && elem.image.url !== 'null'
                          ? {uri: elem.image.url}
                          : require('../src/assets/user.png')
                      }
                    />
                </View>
              )}
              <View
                style={{
                  backgroundColor: received
                    ? jersAppTheme.bubbleReceiverBgColor
                    : jersAppTheme.bubbleSenderBgColor,
                  borderRadius: 20,
                  borderBottomLeftRadius: received ? 4 : 20,
                  borderBottomRightRadius: received ? 20 : 4,
                  padding: 12,
                  paddingBottom: 8,
                  shadowColor: received ? '#000' : jersAppTheme.bubbleSenderBgColor,
                  shadowOffset: {width: 0, height: 3},
                  shadowOpacity: 0.15,
                  shadowRadius: 5,
                  elevation: 2,
                }}>
                {elem.replyTo && !isDeleted && (
                  <View style={{
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    borderLeftWidth: 4,
                    borderLeftColor: jersAppTheme.badgeColor || '#34B7F1',
                    borderRadius: 4,
                    padding: 6,
                    marginBottom: 4,
                  }}>
                    <Text style={{ color: jersAppTheme.badgeColor || '#34B7F1', fontSize: 12, fontWeight: 'bold' }}>{elem.replyTo.sender === Data._id ? 'You' : (elem.replyTo.senderName || 'Member')}</Text>
                    <Text style={{ color: received ? jersAppTheme.bubbleReceiverTextColor : jersAppTheme.bubbleSenderTextColor, fontSize: 11 }} numberOfLines={2}>
                      {elem.replyTo.fileType ? `📷 ${elem.replyTo.fileType}` : elem.replyTo.message}
                    </Text>
                  </View>
                )}
                {isSelected && !isDeleted && (
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
                  }}>
                    {['👍', '❤️', '😂', '😮', '😢', '🙏'].map(emoji => (
                      <TouchableOpacity key={emoji} onPress={() => onReactionPress(elem._id, emoji)}>
                        <Text style={{ fontSize: 24 }}>{emoji}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                {received && !isDeleted && (
                  <Text
                    style={{
                      color: jersAppTheme.bubbleReceiverTextColor,
                      fontWeight: '700',
                      fontSize: 12,
                      marginBottom: 4,
                      opacity: 0.8,
                    }}>
                    {elem?.name}
                  </Text>
                )}
                {isDeleted ? (
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
                        {elem.fileType === 'image' && (
                          <Image
                            source={{ uri: fullFileUrl }}
                            style={{ width: 220, height: 160, borderRadius: 12 }}
                            resizeMode="cover"
                          />
                        )}
                        {elem.fileType === 'video' && (
                          <Video
                            source={{ uri: fullFileUrl }}
                            style={{ width: 220, height: 160, borderRadius: 12, backgroundColor: 'black' }}
                            controls={true}
                            paused={true}
                            resizeMode="contain"
                          />
                        )}
                        {elem.fileType === 'audio' && (
                          <AudioPlayer fileUrl={fullFileUrl} received={received} theme={jersAppTheme} />
                        )}
                        {elem.fileType === 'document' && (
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
                              {elem.fileUrl.split('/').pop() || 'Download File'}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    ) : null}
                    
                    <View style={{flexDirection: 'row', alignItems: 'flex-end', flexWrap: 'wrap'}}>
                        {text ? (
                        <Text
                          style={{
                            color: received
                              ? jersAppTheme.bubbleReceiverTextColor
                              : jersAppTheme.bubbleSenderTextColor,
                            fontSize: 15,
                            lineHeight: 22,
                            marginRight: 12
                          }}>
                          {text}
                        </Text>
                        ) : null}
                        
                        <View style={{flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, alignSelf: 'flex-end'}}>
                          <Text
                            style={{
                              color: received
                                ? jersAppTheme.bubblesReceiverSubTextColor
                                : jersAppTheme.bubblesSenderSubTextColor,
                              fontSize: 10,
                              fontWeight: '500',
                              opacity: 0.7,
                            }}>
                            {time}
                          </Text>
                          {!received && (
                            <MaterialCommunityIcons
                              name={tickStatus === 'sent' ? 'check' : 'check-all'}
                              size={14}
                              color={
                                tickStatus === 'read'
                                  ? '#34B7F1'
                                  : jersAppTheme.bubblesSenderSubTextColor || '#686868'
                              }
                            />
                          )}
                        </View>
                    </View>
                  </>
                )}
                {elem.reactions && elem.reactions.length > 0 && (
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
                    {[...new Set(elem.reactions.map(r => r.emoji))].map(emoji => (
                      <Text key={emoji} style={{ fontSize: 12 }}>
                        {emoji} {elem.reactions.filter(r => r.emoji === emoji).length > 1 ? elem.reactions.filter(r => r.emoji === emoji).length : ''}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Swipeable>
    );
  };

  useFocusEffect(
    React.useCallback(() => {
      if (socket) {
        socketJoinGroup({groupID: id, userID: Data?._id});
        socket.on('new_group_msg', data => {
          if (data && data.group_id === id) {
             setchatArray(prev => {
                const exists = prev.some(m => m._id === data._id);
                if (exists) return prev;
                return [...prev, {...data, time: getTime(data.createdAt)}];
             });
             setisMsgLongPressed(prev => [...prev, {isSelected: false}]);
             if (data.sender_id !== Data?._id) {
                markGroupMsgAsRead(data._id, Data?._id);
             }
          }
          fetchMessages();
        });
        socket.on('userInGroup', data => {
          setusersInGroup(data);
        });
        // You could also add socket.on('delete_group_msg_for_everyone') if you emitted it from backend
      }
      return () => {
        if (socket) {
          socketRemoveGroup({groupID: id, userID: Data?._id});
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

  const handleSubmit = e => {
    e?.preventDefault();
    if (
      (formDatas.msg !== '' || replyingTo) &&
      formDatas.group_id !== '' &&
      formDatas.sender_id !== ''
    ) {
      const msgPayload = {
        ...formDatas,
        receivers: idsToSendMsg,
        name: Data?.name,
        group_name: GroupData?.group_name,
        replyTo: replyingTo ? {
          messageId: replyingTo.msgId,
          sender: replyingTo.sender === 'You' ? Data._id : replyingTo.senderId,
          senderName: replyingTo.sender,
          message: replyingTo.text,
          fileType: replyingTo.fileType,
        } : null,
      };
      socketSendGroupMsg(msgPayload);
      setformDatas(prev => ({...prev, msg: ''}));
      setReplyingTo(null);
      fetchMessages();
      Keyboard.dismiss();
    }
  };

  const handleDeleteForMe = () => {
    if (msgID) {
      deleteGroupMsgForMe(msgID, Data?._id).then(res => {
        if (res.status === 'ok') {
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
      deleteGroupMsgForEveryone(msgID, Data?._id).then(res => {
        if (res.status === 'ok') {
          setchatArray(prev =>
            prev.map(msg =>
              msg._id === msgID
                ? { ...msg, deletedForEveryone: true, msg: '', fileUrl: null, fileType: null, reactions: [] }
                : msg
            )
          );
          handlePress();
          setisModelOpen(false);
          ToastAndroid.show('Message deleted for everyone', ToastAndroid.SHORT);
          fetchMessages(); // refresh from backend to ensure state is clean
        } else {
          setisModelOpen(false);
          ToastAndroid.show(res.message || 'Failed to delete', ToastAndroid.SHORT);
        }
      });
    }
  };

  const handleReaction = (messageId, emoji) => {
    const userId = Data?._id;
    const msg = chatArray.find(m => m._id === messageId);
    if (!msg) return;

    const existingReaction = msg.reactions?.find(r => r.userId === userId);
    
    if (existingReaction && existingReaction.emoji === emoji) {
      removeGroupReaction(messageId, userId).then(res => {
        if (res.status === 'ok') {
          fetchMessages();
          handlePress();
        }
      });
    } else {
      addGroupReaction(messageId, userId, emoji).then(res => {
        if (res.status === 'ok') {
          fetchMessages();
          handlePress();
        }
      });
    }
  };

  const handleOnchange = (value, name) => {
    setformDatas(prev => ({...prev, [name]: value}));
  };
  const handleLongPress = (index, msgId) => {
    const updatedStates = [...isMsgLongPressed];
    updatedStates[index].isSelected = true;
    setisMsgLongPressed(updatedStates);
    setmsgID(msgId);
    setisDelete(true);
    setisModelOpen(true);
  };
  const handlePress = () => {
    const updatedStates = isMsgLongPressed?.map(() => ({isSelected: false}));
    setisMsgLongPressed(updatedStates);
    setisDelete(false);
    setisModelOpen(false);
  };

  const handleModelClose = () => {
    setisModelOpen(false);
    handlePress();
  };

  const styles = StyleSheet.create({
    content: {
      flexDirection: 'column-reverse',
      padding: 10,
      gap: 2,
    },
    inputContainer: {
      marginBottom: 12,
      marginTop: 8,
      paddingHorizontal: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    sendBtn: {
      backgroundColor: jersAppTheme.badgeColor,
      height: 48,
      width: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: jersAppTheme.badgeColor,
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 5,
    },
  });

  const groupedMessages = groupMessagesByDate(chatArray);
  const sections = groupedMessages
    ? Object.keys(groupedMessages).map(date => ({
        title: date,
        data: groupedMessages[date],
      }))
    : [];

  const [listViewHeight, setListViewHeight] = useState(undefined);
  return (
    <SurfaceLayout
      ids={usersInGroup
        ?.filter(i => i.userID != Data?._id && i.groupID == id)
        .map(i => i.userID)}>
      {isMsgLoading ? (
        <Loader />
      ) : sections?.length > 0 ? (
        <SectionList
          stickySectionHeadersEnabled
          ref={scrollViewRef}
          onLayout={event => {
            setListViewHeight(event.nativeEvent.layout.height);
          }}
          onContentSizeChange={(w, h) => {
            scrollViewRef?.current?.getScrollResponder()?.scrollTo({
              y: h - listViewHeight,
            });
          }}
          contentContainerStyle={{
            justifyContent: 'flex-end',
            paddingBottom: 0,
            flexGrow: 1,
          }}
          scrollEnabled
          sections={sections}
          keyExtractor={(item, index) => item._id}
          renderItem={({item, index}) => {
            return (
              <BubbleMsg
                text={item.msg}
                time={item.time}
                elem={item}
                received={item.sender_id !== Data?._id}
                isSelected={isMsgLongPressed[index]?.isSelected}
                handlePress={handlePress}
                handleLongPress={() => {
                  handleLongPress(index, item._id);
                }}
                onReactionPress={handleReaction}
                onSwipeToReply={(msgId, text, sender, fileType, senderId) => {
                  setReplyingTo({ msgId, text, sender, fileType, senderId });
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
      ) : (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <FastImage
            style={{width: 400, height: 400, opacity: 0.3}}
            source={require('../src/assets/gifs/Chat.gif')}
            resizeMode={FastImage.resizeMode.contain}
          />
        </View>
      )}

      {/* Reply Card */}
      {replyingTo && (
        <View style={{
          backgroundColor: jersAppTheme.appBar,
          marginHorizontal: 12,
          marginTop: 8,
          borderRadius: 12,
          padding: 12,
          borderLeftWidth: 4,
          borderLeftColor: jersAppTheme.badgeColor || '#34B7F1',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <View>
            <Text style={{ color: jersAppTheme.badgeColor || '#34B7F1', fontWeight: 'bold', fontSize: 13 }}>
              Replying to {replyingTo.sender}
            </Text>
            <Text style={{ color: jersAppTheme.themeText, fontSize: 12, marginTop: 2 }} numberOfLines={1}>
              {replyingTo.fileType ? `📷 ${replyingTo.fileType}` : replyingTo.text}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setReplyingTo(null)}>
            <IoniconsIcon name="close" size={20} color={jersAppTheme.placeholderColor} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.inputContainer}>
        <View style={{
          flex: 1,
          backgroundColor: jersAppTheme.appBar,
          borderRadius: 25,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.05,
          shadowRadius: 5,
          elevation: 2,
        }}>
            <TouchableOpacity onPress={handlePickDocument} style={{marginRight: 8}}>
              <IoniconsIcon name="attach" size={24} color={jersAppTheme.placeholderColor} />
            </TouchableOpacity>
            <TextInput
              placeholder={isRecording ? "Recording..." : "Type a message..."}
              style={{
                color: isRecording ? 'red' : jersAppTheme.title,
                flex: 1,
                paddingVertical: 12,
                fontSize: 16,
              }}
              value={formDatas.msg ? formDatas.msg : ''}
              onChangeText={value => {
                handleOnchange(value, 'msg');
              }}
              placeholderTextColor={isRecording ? 'red' : jersAppTheme.placeholderColor}
              multiline
              maxLength={500}
              editable={!isRecording}
            />
            {formDatas.msg === '' && !isRecording && (
              <TouchableOpacity onPress={startRecording} style={{marginLeft: 8}}>
                <IoniconsIcon name="mic" size={24} color={jersAppTheme.placeholderColor} />
              </TouchableOpacity>
            )}
            {isRecording && (
              <TouchableOpacity onPress={stopRecording} style={{marginLeft: 8}}>
                <MaterialCommunityIcons name="stop-circle" size={26} color="red" />
              </TouchableOpacity>
            )}
        </View>
        {(enableSendBtn || replyingTo) && !isRecording && (
          <TouchableOpacity onPress={handleSubmit} style={styles.sendBtn}>
            <IoniconsIcon
              size={20}
              name="send"
              color="#fff"
              style={{ marginLeft: 3 }}
            />
          </TouchableOpacity>
        )}
      </View>
      <MessageActionModal
        visible={isModelOpen}
        handleClose={handleModelClose}
        handleDeleteForMe={handleDeleteForMe}
        handleDeleteForEveryone={handleDeleteForEveryone}
        showDeleteForEveryone={
          chatArray.find(m => m._id === msgID)?.sender_id === Data?._id
        }
        jersAppTheme={jersAppTheme}
      />
    </SurfaceLayout>
  );
}
