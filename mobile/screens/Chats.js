import {useFocusEffect} from '@react-navigation/native';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  Animated,
  FlatList,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
  StyleSheet,
  Pressable,
} from 'react-native';
import {Avatar} from 'react-native-paper';
import {MyContext} from '../App';
import {TopBarContext} from '../navigations/tabNavigation';
import SurfaceLayout from '../src/Layouts/SurfaceLayout';
import DeleteModal from '../src/components/DeleteModel';
import {
  deleteContactById,
  getContactByUserId,
} from '../src/controllers/contacts';
import {checkApplicationPermission} from '../src/controllers/permissions';
import {eventEmitter} from '../src/notification.android';
import {useSocketHook} from '../utils/socket';
import {getCreatedDay} from '../utils/methods/Date&Time';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

function getAvatarColor(name) {
  const colors = ['#E53E3E', '#DD6B20', '#D69E2E', '#38A169', '#3182CE', '#805AD5', '#D53F8C'];
  return colors[(name?.charCodeAt(0) || 0) % colors.length];
}

function ChatItem({elem, isSelected, jersAppTheme, newMsgcount, onPress, onLongPress}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {toValue: 0.97, useNativeDriver: true}).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {toValue: 1, useNativeDriver: true}).start();
  };

  const contactName = elem.ContactDetails?.name || elem.name || 'Unknown';
  const lastMsg = elem.lastMsg?.msg || '';
  const lastMsgName = elem.lastMsg?.name || '';
  const hasUnread = newMsgcount && newMsgcount !== '0' && newMsgcount !== 0;

  return (
    <Animated.View style={{transform: [{scale: scaleAnim}]}}>
      <TouchableOpacity
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={[
          styles.chatItem,
          {
            backgroundColor: isSelected
              ? jersAppTheme.selectedColor || jersAppTheme.badgeColor + '20'
              : 'transparent',
          },
        ]}>
        {/* Avatar */}
        <View style={styles.avatarWrapper}>
          {elem.image?.url ? (
            <Avatar.Image size={54} source={{uri: elem.image.url}} />
          ) : (
            <View
              style={[
                styles.avatarFallback,
                {backgroundColor: getAvatarColor(contactName)},
              ]}>
              <Text style={styles.avatarInitial}>
                {contactName[0]?.toUpperCase() || '?'}
              </Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.chatContent}>
          <View style={styles.chatTop}>
            <Text
              style={[styles.chatName, {color: jersAppTheme.title}]}
              numberOfLines={1}>
              {contactName}
            </Text>
            <Text style={[styles.chatTime, {color: jersAppTheme.placeholderColor}]}>
              {elem.date || ''}
            </Text>
          </View>
          <View style={styles.chatBottom}>
            <Text
              style={[
                styles.chatLastMsg,
                {
                  color: hasUnread
                    ? jersAppTheme.title
                    : jersAppTheme.placeholderColor,
                  fontWeight: hasUnread ? '500' : '400',
                },
              ]}
              numberOfLines={1}>
              {lastMsg
                ? lastMsgName === 'You'
                  ? `You: ${lastMsg}`
                  : lastMsgName
                  ? `${lastMsgName}: ${lastMsg}`
                  : lastMsg
                : 'Tap to chat'}
            </Text>
            {hasUnread ? (
              <View
                style={[
                  styles.badge,
                  {backgroundColor: jersAppTheme.badgeColor},
                ]}>
                <Text style={[styles.badgeText, {color: jersAppTheme.badgeTextColor || 'white'}]}>
                  {newMsgcount > 99 ? '99+' : newMsgcount}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function Chats(props) {
  useEffect(() => {
    checkApplicationPermission();
    const subscription = eventEmitter.addListener('notificationPressed', () => {
      props.navigation.navigate('Chats');
    });
  }, []);

  const {Data, jersAppTheme} = useContext(MyContext);
  const [isMsgLongPressed, setisMsgLongPressed] = useState([]);
  const [receiversId, setreceiversId] = useState('');
  const [Contact_id, setContact_id] = useState('');

  const {setisDelete, isModelOpen, setisModelOpen, setopenMenu, setactiveTab} =
    useContext(TopBarContext);

  const getAllChats = async () => {
    const response = await getContactByUserId(Data._id);
    if (response?.status === 'ok') {
      setisMsgLongPressed(response.data.map(() => ({isSelected: false})));
      return response.data;
    }
    return [];
  };

  const {data, refetch, isLoading} = useQuery({
    queryKey: ['chats'],
    queryFn: () => getAllChats(),
    enabled: !!Data?._id,
  });

  const {
    newMsgCount,
    setnewMsgCount,
    socket,
    socketUserID,
    socketUserConnected,
  } = useSocketHook();

  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [newMsgCount]),
  );

  useFocusEffect(
    React.useCallback(() => {
      if (socket) {
        socketUserID(Data._id);
        socketUserConnected({id: Data._id, status: 'online'});
      }
    }, [socket]),
  );

  const handleDeleteContact = () => {
    if (receiversId && Contact_id) {
      deleteContactById(Data._id, receiversId, Contact_id).then(res => {
        if (res?.status === 'ok' && res?.message !== 'failed') {
          refetch();
          handlePress();
          setisModelOpen(false);
          ToastAndroid.show('Chat deleted', ToastAndroid.SHORT);
        } else {
          ToastAndroid.show('Failed to delete', ToastAndroid.SHORT);
          setisModelOpen(false);
        }
      });
    }
  };

  const handleLongPress = (index, id, contactId) => {
    setContact_id(contactId);
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

  const renderItem = ({item: elem, index}) => {
    const isSelected = isMsgLongPressed[index]?.isSelected;
    elem.date = getCreatedDay(elem);
    const receiverId = elem.ContactDetails?._id;
    const contactName = elem.ContactDetails?.name || elem.name || 'Unknown';
    const roomID = receiverId
      ? [Data._id, receiverId].sort().join('_')
      : '';

    return (
      <ChatItem
        key={elem._id || index}
        elem={elem}
        isSelected={isSelected}
        jersAppTheme={jersAppTheme}
        newMsgcount={elem.msgCount}
        onPress={() => {
          if (!receiverId) return;
          socket?.emit('clearNewMsg', {
            id: Data._id,
            Contact_id: elem._id,
          });
          setnewMsgCount(null);
          handlePress();
          props.navigation.navigate('Message', {
            id: receiverId,
            userID: Data._id,
            receiverId,
            roomID,
            name: contactName,
            image: elem.image || null,
          });
        }}
        onLongPress={() => {
          handleLongPress(index, receiverId, elem._id);
        }}
      />
    );
  };

  return (
    <SurfaceLayout title="Chats">
      {isLoading ? (
        <SkeletonList jersAppTheme={jersAppTheme} />
      ) : (
        <Pressable style={{flex: 1}} onPress={handlePress}>
          {data && data.length > 0 ? (
            <FlatList
              data={data}
              renderItem={renderItem}
              keyExtractor={(item, index) => item._id || String(index)}
              contentContainerStyle={{paddingBottom: 80}}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => (
                <View
                  style={[
                    styles.separator,
                    {backgroundColor: jersAppTheme.placeholderColor + '10'},
                  ]}
                />
              )}
            />
          ) : (
            <EmptyState jersAppTheme={jersAppTheme} />
          )}
          <DeleteModal
            handleModelClose={handleModelClose}
            visible={isModelOpen}
            handleDelete={handleDeleteContact}
          />
        </Pressable>
      )}
    </SurfaceLayout>
  );
}

function SkeletonList({jersAppTheme}) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {toValue: 0.4, duration: 700, useNativeDriver: true}),
        Animated.timing(pulseAnim, {toValue: 1, duration: 700, useNativeDriver: true}),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <View style={{paddingHorizontal: 16, paddingTop: 8}}>
      {[...Array(6)].map((_, i) => (
        <Animated.View key={i} style={[styles.skeletonRow, {opacity: pulseAnim}]}>
          <View style={[styles.skeletonAvatar, {backgroundColor: jersAppTheme.placeholderColor + '25'}]} />
          <View style={{flex: 1, gap: 8}}>
            <View style={[styles.skeletonLine, {backgroundColor: jersAppTheme.placeholderColor + '25', width: '55%'}]} />
            <View style={[styles.skeletonLine, {backgroundColor: jersAppTheme.placeholderColor + '15', width: '80%', height: 10}]} />
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

function EmptyState({jersAppTheme}) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {toValue: -8, duration: 1500, useNativeDriver: true}),
        Animated.timing(floatAnim, {toValue: 0, duration: 1500, useNativeDriver: true}),
      ]),
    ).start();
  }, []);

  return (
    <View style={styles.emptyContainer}>
      <Animated.View style={{transform: [{translateY: floatAnim}]}}>
        <MaterialCommunityIcons
          name="chat-outline"
          size={80}
          color={jersAppTheme.placeholderColor + '50'}
        />
      </Animated.View>
      <Text style={[styles.emptyTitle, {color: jersAppTheme.title}]}>
        No chats yet
      </Text>
      <Text style={[styles.emptySubtitle, {color: jersAppTheme.placeholderColor}]}>
        Start a conversation from your contacts!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 14,
    borderRadius: 4,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarFallback: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
  },
  chatContent: {
    flex: 1,
    gap: 4,
  },
  chatTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatName: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  chatTime: {
    fontSize: 11,
    marginLeft: 8,
  },
  chatBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatLastMsg: {
    fontSize: 13,
    flex: 1,
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  separator: {
    height: 0.5,
    marginLeft: 84,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 14,
  },
  skeletonAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  skeletonLine: {
    height: 13,
    borderRadius: 6,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
});
