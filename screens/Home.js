import React from 'react';
import {View} from 'react-native';
import {Text} from 'react-native-paper';
import TabNavigator from '../navigations/tabNavigation';

export default function Home(props) {
  return (
    <View>
      <TabNavigator props={props} />
    </View>
  );
}
