import {View, Text} from 'react-native';
import React, {useContext} from 'react';
import {MyContext} from '../../App';

export default function SurfaceLayout({children, title}) {
  const {jersAppTheme} = useContext(MyContext);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: jersAppTheme.appBar,
      }}>
      <View
        style={{
          flex: 1,
          borderTopRightRadius: 25,
          borderTopLeftRadius: 25,
          backgroundColor: jersAppTheme.main,
          elevation: 2,
          shadowColor: 'white',
          shadowOpacity: 2,
          marginTop: 1,
        }}>
        {title && (
          <View
            style={{
              width: '100%',
              alignItems: 'center',
              height: 50,
              justifyContent: 'center',
            }}>
            <Text
              style={{
                color: jersAppTheme.themeText,
                fontWeight: 'bold',
                fontSize: 20,
                textTransform: 'uppercase',
              }}>
              {title}
            </Text>
          </View>
        )}
        {children}
      </View>
    </View>
  );
}
