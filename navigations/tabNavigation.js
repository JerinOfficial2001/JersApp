import {NavigationContainer} from '@react-navigation/native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {Image, TouchableOpacity, View, Text} from 'react-native';
import React from 'react';
import AuthModal from '../src/components/AuthModal';
import Chats from '../screens/Chats';
import Status from '../screens/Status';

const Tab = createMaterialTopTabNavigator();

export default function TabNavigator({props}) {
  const [visible, setVisible] = React.useState(false);

  const renderRightHeaderComponent = () => (
    <TouchableOpacity
      style={{bottom: 10, position: 'absolute', right: 10}}
      onPress={() => {
        props.navigation.navigate('AllContacts');
      }}>
      <Image
        style={{
          height: 60,
          width: 60,
        }}
        source={require('../src/assets/plus.png')}
      />
    </TouchableOpacity>
  );

  return (
    <View style={{height: '100%'}}>
      <View style={{backgroundColor: '#008169', padding: 15}}>
        <Text style={{color: 'white', fontWeight: 'bold', letterSpacing: 1}}>
          Whatsapp Clone
        </Text>
      </View>
      <Tab.Navigator
        initialRouteName="Chats"
        screenOptions={{
          tabBarActiveTintColor: 'white',
          tabBarLabelStyle: {
            fontSize: 16,
            fontWeight: 'bold',
          },
          tabBarIndicatorStyle: {
            backgroundColor: 'white',
            height: 3,
            borderRadius: 5,
          },
          tabBarStyle: {
            backgroundColor: '#008169',
          },
        }}>
        <Tab.Screen props={props} name="Chats" component={Chats} />
        <Tab.Screen props={props} name="Status" component={Status} />
      </Tab.Navigator>
      {renderRightHeaderComponent()}
      <AuthModal visible={visible} setVisible={setVisible} />
    </View>
  );
}
