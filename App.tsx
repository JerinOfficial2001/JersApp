import React, {useState} from 'react';
import Navigator from './navigations';
import {
  Appbar,
  Avatar,
  Icon,
  MD3Colors,
  Provider,
  Searchbar,
} from 'react-native-paper';
import Lens from './src/svg/Lens';
import {Image, TouchableOpacity, View} from 'react-native';
import TabNavigator from './navigations/tabNavigation';

export default function App() {
  const [openSearchBar, setopenSearchBar] = useState(false);

  return (
    <Provider>
      <Navigator />
    </Provider>
  );
}
