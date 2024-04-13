import React, {useContext, useState} from 'react';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import {DarkThemeSchema, JersAppThemeSchema} from '../../utils/theme';
import {MyContext} from '../../App';

export default function TopBar({
  title,
  rightOnPress,
  isDelete,
  lefOnPress,
  arrow,
  subtitle,
  isTyping,
}) {
  // const [theme, settheme] = useState(JersAppThemeSchema);
  const {jersAppTheme, setpageName} = useContext(MyContext);

  return (
    <View
      style={{
        backgroundColor: jersAppTheme.appBar,
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
        <View>
          <Text style={{color: 'white', fontWeight: 'bold', letterSpacing: 1}}>
            {title}
          </Text>
          {subtitle && (
            <Text style={{color: 'white', letterSpacing: 1, fontSize: 10}}>
              {isTyping ? 'typing...' : 'Online'}
            </Text>
          )}
        </View>
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
