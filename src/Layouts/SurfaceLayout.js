import {View, Text} from 'react-native';
import React, {useContext} from 'react';
import {MyContext} from '../../App';

export default function SurfaceLayout({children}) {
  const {jersAppTheme} = useContext(MyContext);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#151B26',
      }}>
      <View
        style={{
          flex: 1,
          borderTopRightRadius: 25,
          borderTopLeftRadius: 25,
          backgroundColor: jersAppTheme.main,
        }}>
        {children}
      </View>
    </View>
  );
}
