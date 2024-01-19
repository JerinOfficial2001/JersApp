import * as React from 'react';
import {Image, TouchableOpacity, View} from 'react-native';
import {Text} from 'react-native-paper';

const MyComponent = ({onclick, style, status, contact, contactPg}) => (
  <TouchableOpacity onPress={onclick}>
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
      <Image
        source={require('../assets/user.png')}
        style={{height: 50, width: 50}}
      />
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
              {contact ? contact.displayName : 'Name'}
            </Text>
            {!contactPg && <Text style={{color: 'black'}}>11/01/24</Text>}
          </View>
        )}
        <Text style={{color: 'black'}}>Msg</Text>
      </View>
    </View>
  </TouchableOpacity>
);

export default MyComponent;
