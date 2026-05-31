import {View, Text} from 'react-native';
import React, {useContext} from 'react';
import {MyContext} from '../../App';

export default function SectionHeader({title}) {
  const {jersAppTheme} = useContext(MyContext);
  return (
    <View
      style={{
        padding: 10,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <View
        style={{
          backgroundColor: jersAppTheme.loader,
          padding: 5,
          paddingHorizontal: 10,
          borderRadius: 20,
        }}>
        <Text
          style={{fontWeight: 'bold', color: jersAppTheme.placeholderColor}}>
          {title}
        </Text>
      </View>
    </View>
  );
}
