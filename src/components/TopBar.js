import React from 'react';
import {Image, Text, TouchableOpacity, View} from 'react-native';

export default function TopBar({
  title,
  rightOnPress,
  isDelete,
  lefOnPress,
  arrow,
}) {
  return (
    <View
      style={{
        backgroundColor: '#008169',
        padding: 15,
        justifyContent: 'space-between',
        flexDirection: 'row',
      }}>
      <View
        style={{
          justifyContent: 'space-between',
          flexDirection: 'row',
          gap: 5,
          alignItems: 'center',
        }}>
        {arrow && (
          <TouchableOpacity onPress={lefOnPress}>
            <Image
              source={require('../assets/leftArrow.png')}
              style={{height: 25, width: 25}}
            />
          </TouchableOpacity>
        )}
        <Text style={{color: 'white', fontWeight: 'bold', letterSpacing: 1}}>
          {title}
        </Text>
      </View>
      <TouchableOpacity onPress={rightOnPress}>
        {isDelete ? (
          <Image
            source={require('../assets/delete.png')}
            style={{height: 25, width: 25}}
          />
        ) : (
          <>
            {!arrow && (
              <Image
                source={require('../assets/vertIcon.png')}
                style={{height: 20, width: 20}}
              />
            )}
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}
