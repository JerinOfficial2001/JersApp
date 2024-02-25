import {NavigationContainer} from '@react-navigation/native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {Image, TouchableOpacity, View, Text} from 'react-native';
import React, {createContext, useState} from 'react';
import AuthModal from '../src/components/AuthModal';
import Chats from '../screens/Chats';
import Status from '../screens/Status';
import TopBar from '../src/components/TopBar';
import {Menu} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Tab = createMaterialTopTabNavigator();

export const TopBarContext = createContext();

export default function TabNavigator({props}) {
  const [visible, setVisible] = useState(false);
  const [isDelete, setisDelete] = useState(false);
  const [isModelOpen, setisModelOpen] = useState(false);
  const [openMenu, setopenMenu] = useState(false);
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
  const handleCloseMenu = () => {
    setopenMenu(false);
  };

  return (
    <TopBarContext.Provider
      value={{setopenMenu, setisDelete, isModelOpen, setisModelOpen}}>
      <View style={{height: '100%'}}>
        <TopBar
          title={'Whatsapp Clone'}
          rightOnPress={() => {
            if (isDelete) {
              setisModelOpen(true);
            } else {
              // props.navigation.navigate('Settings');
              setopenMenu(true);
            }
          }}
          isDelete={isDelete}
        />
        <View
          style={{
            display: openMenu ? 'flex' : 'none',
            position: 'absolute',
            right: 5,
            top: 40,
            zIndex: 2,
            backgroundColor: 'white',
            borderRadius: 10,
            shadowColor: 'gray',
            shadowOpacity: 10,
          }}>
          <Menu.Item
            title="Whatsapp web"
            titleStyle={{color: 'black'}}
            onPress={() => {
              handleCloseMenu();

              props.navigation.navigate('QRScanner');
            }}
          />
          <Menu.Item
            title="Logout"
            titleStyle={{color: 'black'}}
            onPress={() => {
              AsyncStorage.removeItem('userData');
              props.navigation.navigate('Login');
              handleCloseMenu();
            }}
          />
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
    </TopBarContext.Provider>
  );
}
