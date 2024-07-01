import {View, Text} from 'react-native';
import React, {useContext} from 'react';
import {MyContext} from '../../App';

export default function SurfaceLayout({children}) {
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
        {children}
      </View>
    </View>
  );
}
