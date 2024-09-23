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
import {MyContext, queryClient} from '../App';
import {GetGroupByID} from '../src/controllers/group';
import Loader from '../src/components/Loader';
import IoniconsIcon from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';
import {useSocketHook} from '../utils/socket';
import {getGroupMsg} from '../src/controllers/groupMsg';
import {Avatar} from 'react-native-paper';
import {getTime, groupMessagesByDate} from '../utils/methods/Date&Time';
import SectionHeader from '../src/components/SectionHeader';
import {GetMembers} from '../src/controllers/members';

export default function GroupMsg({navigation, route}) {
  const {Data, jersAppTheme} = useContext(MyContext);
  const {socketSendGroupMsg, socket, socketJoinGroup, socketRemoveGroup} =
    useSocketHook();
  const {id} = route.params;
  const {
    data: GroupData,
    refetch,
    isLoading,
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
    queryKey: ['grpmessages'],
    queryFn: () =>
      getGroupMsg({id: Data?._id, token: Data?.accessToken, groupID: id}),
    enabled: !!Data && !!Data._id && !!Data.accessToken && !!id,
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
  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        headerTitle: () => (
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
            <Image
              source={
                GroupData && GroupData.image && GroupData.image !== 'null'
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
                      GroupData?.image && GroupData?.image !== 'null'
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
                  tab here for group info
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        ),
      });
    }, [navigation, id, GroupData]),
  );

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
  const scrollViewRef = useRef();

  const BubbleMsg = ({
    text,
    received,
    isSelected,
    handleLongPress,
    handlePress,
    time,
    elem,
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
            paddingHorizontal: 20,
          }}>
          <View style={{flexDirection: 'row', gap: 3}}>
            {received && (
              <Avatar.Image
                size={30}
                source={
                  elem && elem.image
                    ? {uri: elem.image.url}
                    : require('../src/assets/user.png')
                }
              />
            )}
            <View
              style={{
                minWidth: 50,
                marginTop: received ? 10 : 0,
                backgroundColor: received
                  ? jersAppTheme.bubbleReceiverBgColor
                  : jersAppTheme.bubbleSenderBgColor,
                borderRadius: 15,
                borderTopLeftRadius: received ? 0 : 15,
                borderTopEndRadius: received ? 15 : 0,
                flexDirection: 'column',
              }}>
              {received && (
                <Text
                  style={{
                    color: received
                      ? jersAppTheme.bubbleReceiverTextColor
                      : jersAppTheme.bubbleSenderTextColor,
                    marginLeft: 4,
                  }}>
                  {elem?.name}
                </Text>
              )}
              <View
                style={{
                  marginBottom: 10,
                  marginTop: 5,
                  flexDirection: 'row',
                  paddingHorizontal: 10,
                  gap: 8,
                  alignItems: 'center',
                  justifyContent: 'center',
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
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  };
  useFocusEffect(
    React.useCallback(() => {
      if (socket) {
        socketJoinGroup({groupID: id, userID: Data?._id});
        //  Keyboard.addListener('keyboardDidHide', () => {
        //    socketUserTyped({id: userID ? userID : userData._id, receiverId});
        //  });
        //  Keyboard.addListener('keyboardDidShow', () => {
        //    socketUserTyping({
        //      id: userID ? userID : userData._id,
        //      receiverId,
        //    });
        //    setisTyping(null);
        //  });
        // socket.on('new_group_msg', () => {
        //   fetchMessages();
        // });
        socket.on('userInGroup', data => {
          setusersInGroup(data);
        });
      }
      return () => {
        if (socket) {
          socketRemoveGroup({groupID: id, userID: Data?._id});
          //  socketUserWatched({id: userID ? userID : userData._id, receiverId});
          //  setisWatching(null);
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
    e.preventDefault();
    if (
      formDatas.msg !== '' &&
      formDatas.group_id !== '' &&
      formDatas.sender_id !== ''
    ) {
      formDatas.receivers = idsToSendMsg;
      formDatas.name = Data?.name;
      formDatas.group_name = GroupData?.group_name;
      socketSendGroupMsg(formDatas);
      setformDatas(prev => ({...prev, msg: ''}));
      fetchMessages();
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
      padding: 10,
      borderRadius: 50,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
  const groupedMessages = groupMessagesByDate(Messages);
  const sections = groupedMessages
    ? Object.keys(groupedMessages).map(date => ({
        title: date,
        data: groupedMessages[date].map(elem => ({
          ...elem,
          time: getTime(elem.createdAt),
        })),
      }))
    : [];

  const [listViewHeight, setListViewHeight] = useState(undefined);
  return (
    <SurfaceLayout
      ids={usersInGroup
        ?.filter(i => i.userID != Data?._id && i.groupID == id)
        .map(i => i.userID)}>
      {isLoading || isMsgLoading ? (
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
            //   paddingBottom: UserWatching ? 40 : 0,
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
                // handlePress={handlePress}
                // handleLongPress={() => {
                //   handleLongPress(index, item._id);
                // }}
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
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Message"
          style={{
            backgroundColor: jersAppTheme.selectedColor,
            color: jersAppTheme.title,
            borderRadius: 30,
            width: enableSendBtn ? '80%' : '95%',
            padding: 13,
          }}
          value={formDatas.msg ? formDatas.msg : ''}
          onChangeText={value => {
            handleOnchange(value, 'msg');
          }}
          placeholderTextColor={jersAppTheme.placeholderColor}
        />
        {enableSendBtn && (
          <TouchableOpacity onPress={handleSubmit} style={styles.sendBtn}>
            <IoniconsIcon
              size={25}
              name="send"
              color={jersAppTheme.headerText}
            />
          </TouchableOpacity>
        )}
      </View>
    </SurfaceLayout>
  );
}
