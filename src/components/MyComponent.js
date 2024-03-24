import * as React from 'react';
import {Image, TouchableOpacity, View} from 'react-native';
import {Avatar, Text} from 'react-native-paper';

const MyComponent = ({
  onclick,
  style,
  status,
  contact,
  contactPg,
  onLongPress,
}) => {
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
          <Avatar.Image size={50} source={{uri: status.file?.url}} />
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
              <Text style={{color: 'black', fontWeight: 'bold'}}>
                {!contactPg
                  ? contact.ContactDetails?.name
                  : contact
                  ? contact.name
                  : 'Name'}
              </Text>
              {!contactPg && (
                <Text style={{color: 'black'}}>{contact.date}</Text>
              )}
            </View>
          )}
          <Text style={{color: 'black'}}>
            {contactPg ? (contact ? contact.mobNum : 'Phone Number') : 'msg'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default MyComponent;
