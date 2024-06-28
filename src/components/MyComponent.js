import React, {useContext, useEffect, useState} from 'react';
import {Image, TouchableOpacity, View} from 'react-native';
import {Avatar, Text} from 'react-native-paper';
import DonutChart from './DonutChart';
import {getLastMsg} from '../controllers/chats';
import {GetUsersByID} from '../controllers/auth';
import {DarkThemeSchema, JersAppThemeSchema} from '../../utils/theme';
import {MyContext} from '../../App';

const MyComponent = ({
  onclick,
  style,
  status,
  contact,
  contactPg,
  onLongPress,
  newMsgcount,
}) => {
  // const [theme, settheme] = useState(JersAppThemeSchema);
  const {jersAppTheme, setpageName} = useContext(MyContext);

  const [lastMsgUserName, setlastMsgUserName] = useState('');
  useEffect(() => {
    if (contact?.user_id && contact?.ContactDetails._id) {
      getUser(contact?.user_id);
      // getLastMsg(contact?.user_id, contact?.ContactDetails._id).then(data => {
      //   setlastMsg(data);
      // });
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
          borderRadius: 20,
          paddingHorizontal: 10,
          backgroundColor: '#00000030',
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
              <Text style={{color: jersAppTheme.title, fontWeight: 'bold'}}>
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
                    gap: 10,
                    alignItems: 'center',
                  }}>
                  <Text style={{color: jersAppTheme.subText}}>
                    {contact?.date}
                  </Text>
                  {newMsgcount !== 0 &&
                    newMsgcount !== '0' &&
                    newMsgcount !== '' && (
                      <View
                        style={{
                          backgroundColor: 'green',
                          padding: 3,
                          height: 25,
                          width: 25,
                          borderRadius: 100,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                        <Text
                          style={{
                            color: 'white',
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
          <Text
            style={{
              color:
                status?.title || status?.userName
                  ? jersAppTheme.title
                  : jersAppTheme.subText,
            }}>
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
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default MyComponent;
