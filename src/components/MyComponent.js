import React, {useContext, useEffect, useState} from 'react';
import {Image, TouchableOpacity, View} from 'react-native';
import {Avatar, Text} from 'react-native-paper';
import DonutChart from './DonutChart';
import {getLastMsg} from '../controllers/chats';
import {GetUsersByID} from '../controllers/auth';
import {DarkThemeSchema, JersAppThemeSchema} from '../../utils/theme';
import {MyContext} from '../../App';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';

const MyComponent = ({
  onclick,
  style,
  status,
  contact,
  contactPg,
  onLongPress,
  newMsgcount,
  isSelected,
  showSelectedIcon,
  customImg,
  isDisabled,
}) => {
  const navigation = useNavigation();
  // const [theme, settheme] = useState(JersAppThemeSchema);
  const {jersAppTheme, setpageName} = useContext(MyContext);

  const [lastMsgUserName, setlastMsgUserName] = useState('');
  useEffect(() => {
    if (contact?.user_id && contact?.ContactDetails?._id) {
      getUser(contact?.user_id);
    }
  }, [contact]);
  const getUser = async id => {
    const response = await GetUsersByID(id).then(data => data.name);
    setlastMsgUserName(response);
  };

  return (
    <TouchableOpacity
      style={{
        backgroundColor: isSelected
          ? jersAppTheme.selectedColor
          : 'transparent',
        borderRadius: 10,
      }}
      onLongPress={onLongPress}
      onPress={onclick}>
      <View
        style={{
          height: 80,
          marginBottom: 5,
          width: '100%',
          flexDirection: 'row',
          gap: 15,
          alignItems: 'center',
          padding: 3,
          borderRadius: 20,
          paddingHorizontal: 10,
          // backgroundColor: '#00000030',
        }}>
        {status && status.file ? (
          <View style={{position: 'relative'}}>
            <Avatar.Image
              size={50}
              source={{uri: status.file[status.file.length - 1]?.url}}
            />
            <DonutChart width={175} height={50} data={status?.file} />
            {status.title == 'My status' && (
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('AddStatus', {
                    onlyCamera: false,
                    id: status?.id,
                  });
                }}
                style={{
                  position: 'absolute',
                  right: -6,
                  bottom: -3,
                  backgroundColor: jersAppTheme.loader,
                  borderRadius: 50,
                }}>
                <Ionicons
                  name="add-circle-sharp"
                  size={25}
                  color={jersAppTheme.statusIndicator}
                />
              </TouchableOpacity>
            )}
          </View>
        ) : contact && contact.image ? (
          <Avatar.Image size={50} source={{uri: contact.image?.url}} />
        ) : contact &&
          contact.ContactDetails &&
          contact.ContactDetails.image ? (
          <Avatar.Image
            size={50}
            source={{uri: contact.ContactDetails.image.url}}
          />
        ) : status?.title == 'My status' ? (
          <View style={{position: 'relative'}}>
            <Image
              source={require('../assets/user.png')}
              style={{height: 50, width: 50}}
            />
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('AddStatus', {
                  onlyCamera: false,
                  id: status?.id,
                });
              }}
              style={{
                position: 'absolute',
                right: -6,
                bottom: -3,
                backgroundColor: jersAppTheme.main,
                borderRadius: 50,
              }}>
              <Ionicons
                name="add-circle-sharp"
                size={25}
                color={jersAppTheme.badgeColor}
              />
            </TouchableOpacity>
          </View>
        ) : customImg ? (
          <View
            style={{
              height: 50,
              width: 50,
              borderRadius: 100,
              backgroundColor: jersAppTheme.appBar,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            {customImg}
          </View>
        ) : (
          <Image
            source={require('../assets/user.png')}
            style={{height: 50, width: 50}}
          />
        )}
        <View
          style={{
            gap: 7,
            width: '82%',
          }}>
          {!status && (
            <View
              style={{
                gap: 7,
                justifyContent: 'space-between',
                flexDirection: 'row',
              }}>
              <Text
                style={{
                  color: isDisabled
                    ? jersAppTheme.disabled
                    : jersAppTheme.title,
                  fontWeight: 'bold',
                  fontSize: 15,
                }}>
                {!contactPg
                  ? contact.ContactDetails?.name
                  : contact
                  ? contact.name
                  : 'Name'}
              </Text>
              {!contactPg && (
                <View
                  style={{
                    position: 'absolute',
                    right: 0,
                    gap: 7,
                    alignItems: 'center',
                    zIndex: 1,
                  }}>
                  <Text style={{color: jersAppTheme.subText}}>
                    {contact?.date}
                  </Text>
                  {newMsgcount != 0 && newMsgcount && newMsgcount !== '' && (
                    <View
                      style={{
                        backgroundColor: jersAppTheme.badgeColor,
                        height: 25,
                        width: 25,
                        borderRadius: 100,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Text
                        style={{
                          color: jersAppTheme.badgeTextColor,
                          fontWeight: 'bold',
                          fontSize: newMsgcount > '99' ? 10 : 15,
                        }}>
                        {newMsgcount > '99' ? '99+' : newMsgcount}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}
          {(contact?.mobNum ||
            contact?.lastMsg ||
            status?.title ||
            contact?.lastMsg ||
            status?.userName) && (
            <Text
              style={{
                color: isDisabled
                  ? jersAppTheme.disabled
                  : status?.title || status?.userName
                  ? jersAppTheme.title
                  : jersAppTheme.subText,
                width: '85%',
              }}
              numberOfLines={1}>
              {contactPg
                ? contact
                  ? contact.mobNum
                  : 'Phone Number'
                : status
                ? status?.title
                  ? status?.title
                  : status?.userName
                : contact?.lastMsg?.msg
                ? contact?.lastMsg?.id == contact?.user_id
                  ? contact?.lastMsg?.msg
                  : `${lastMsgUserName}:` + contact.lastMsg?.msg
                : ''}
            </Text>
          )}
        </View>
        {showSelectedIcon && (
          <View
            style={{
              position: 'absolute',
              right: 10,
              gap: 7,
              alignItems: 'center',
              zIndex: 1,
            }}>
            <View
              style={{
                backgroundColor: isSelected
                  ? jersAppTheme.badgeColor
                  : 'transparent',
                height: 30,
                width: 30,
                borderRadius: 100,
                alignItems: 'center',
                justifyContent: 'center',
                borderColor: jersAppTheme.selectedColor,
                borderWidth: 2,
              }}>
              {isSelected && (
                <AntDesignIcon
                  size={24}
                  name="check"
                  color={jersAppTheme.headerText}
                />
              )}
            </View>
          </View>
        )}
        {((contact && contact.role && contact.role !== 'MEMBER') ||
          isDisabled) && (
          <View
            style={{
              position: 'absolute',
              right: 10,
              gap: 7,
              alignItems: 'center',
              zIndex: 1,
              borderColor: 'green',
              borderWidth: 2,
              padding: 2,
              borderRadius: 50,
              paddingHorizontal: 10,
            }}>
            <Text style={{color: 'green'}}>
              {isDisabled ? 'Already in group' : contact.role}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default MyComponent;
