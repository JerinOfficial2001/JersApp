import React, {useEffect, useState} from 'react';
import {Image, TouchableOpacity, View} from 'react-native';
import {Avatar, Text} from 'react-native-paper';
import DonutChart from './DonutChart';
import {getLastMsg} from '../controllers/chats';
import {GetUsersByID} from '../controllers/auth';
import {DarkThemeSchema} from '../../utils/theme';

const MyComponent = ({
  onclick,
  style,
  status,
  contact,
  contactPg,
  onLongPress,
}) => {
  const [theme, settheme] = useState(DarkThemeSchema);

  const [lastMsgUserName, setlastMsgUserName] = useState('');
  const [lastMsg, setlastMsg] = useState(null);
  useEffect(() => {
    if (contact?.user_id && contact?.ContactDetails._id) {
      getLastMsg(contact?.user_id, contact?.ContactDetails._id).then(data => {
        setlastMsg(data);
        getUser(data.sender);
      });
    }
  }, [contact]);
  const getUser = async id => {
    const response = await GetUsersByID(id).then(data => data.name);
    setlastMsgUserName(response);
  };

  return (
    <TouchableOpacity onLongPress={onLongPress} onPress={onclick}>
      <View
        style={{
          height: 80,
          marginBottom: 5,
          width: '100%',
          flexDirection: 'row',
          gap: 15,
          alignItems: 'center',
          padding: 3,
        }}>
        {status && status.file ? (
          <View style={{position: 'relative'}}>
            <Avatar.Image
              size={50}
              source={{uri: status.file[status.file.length - 1]?.url}}
            />
            <DonutChart width={175} height={50} data={status?.file} />
          </View>
        ) : contact && contact.image ? (
          <Avatar.Image size={50} source={{uri: contact.image?.url}} />
        ) : contact &&
          contact.ContactDetails &&
          contact.ContactDetails.image ? (
          <Avatar.Image
            size={50}
            source={{uri: contact.ContactDetails.image?.url}}
          />
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
              <Text style={{color: theme.headerText, fontWeight: 'bold'}}>
                {!contactPg
                  ? contact.ContactDetails?.name
                  : contact
                  ? contact.name
                  : 'Name'}
              </Text>
              {!contactPg && (
                <Text style={{color: theme.subText}}>{contact.date}</Text>
              )}
            </View>
          )}
          <Text
            style={{
              color:
                status?.title || status?.userName
                  ? theme.headerText
                  : theme.subText,
            }}>
            {contactPg
              ? contact
                ? contact.mobNum
                : 'Phone Number'
              : status
              ? status?.title
                ? status?.title
                : status?.userName
              : lastMsg?.message
              ? lastMsg?.sender == contact?.user_id
                ? lastMsg?.message
                : `${lastMsgUserName}:` + lastMsg.message
              : ''}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default MyComponent;
