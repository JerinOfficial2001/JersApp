import React, {useContext} from 'react';
import {StyleSheet, View} from 'react-native';
import {ActivityIndicator, Surface} from 'react-native-paper';
import {MyContext} from '../../App';
import SurfaceLayout from '../Layouts/SurfaceLayout';

export default function Loader() {
  const {jersAppTheme} = useContext(MyContext);

  return (
    <SurfaceLayout>
      <View
        style={{
          width: '100%',
          alignItems: 'center',
          flex: 1,
          justifyContent: 'center',
        }}>
        <ActivityIndicator
          animating={true}
          color={jersAppTheme.appBar}
          size="large"
        />
      </View>
    </SurfaceLayout>
  );
}

const styles = StyleSheet.create({});
