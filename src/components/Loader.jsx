import React, {useContext} from 'react';
import {StyleSheet, View} from 'react-native';
import {ActivityIndicator, Portal, Surface} from 'react-native-paper';
import {MyContext} from '../../App';
import SurfaceLayout from '../Layouts/SurfaceLayout';

export default function Loader({color}) {
  const {jersAppTheme} = useContext(MyContext);

  return (
    <View style={{flex: 1}}>
      <Portal>
        <View
          style={{
            width: '100%',
            alignItems: 'center',
            flex: 1,
            justifyContent: 'center',
          }}>
          <ActivityIndicator
            animating={true}
            color={color ? color : jersAppTheme.appBar}
            size="large"
          />
        </View>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({});
