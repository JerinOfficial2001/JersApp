import {NavigationContainer} from '@react-navigation/native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {Image, TouchableOpacity, View, Text, ToastAndroid} from 'react-native';
import React, {createContext, useState} from 'react';
import AuthModal from '../src/components/AuthModal';
import Chats from '../screens/Chats';
import Status from '../screens/Status';
import TopBar from '../src/components/TopBar';
import {ActivityIndicator, MD2Colors, Menu} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {logoutWithToken} from '../src/controllers/auth';

const Tab = createMaterialTopTabNavigator();

export const TopBarContext = createContext();

export default function TabNavigator({props}) {
  const [visible, setVisible] = useState(false);
  const [isDelete, setisDelete] = useState(false);
  const [isModelOpen, setisModelOpen] = useState(false);
  const [openMenu, setopenMenu] = useState(false);
  const [isloading, setisloading] = useState(false);
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
  const logout = () => {
    setisloading(true);
    AsyncStorage.getItem('token').then(data => {
      const parsedToken = data ? JSON.parse(data) : false;
      if (parsedToken) {
        logoutWithToken(parsedToken).then(res => {
          if (res.status == 'ok') {
            AsyncStorage.removeItem('userData');
            props.navigation.navigate('Login');
            handleCloseMenu();
            ToastAndroid.show(res.message, ToastAndroid.SHORT);
          }
          setisloading(false);
        });
      } else {
        ToastAndroid.show('Logout Failed', ToastAndroid.SHORT);
        setisloading(false);
      }
    });
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
            leadingIcon={() => (
              <Image
                style={{
                  height: 30,
                  width: 30,
                }}
                source={require('../src/assets/qrscan.png')}
              />
            )}
            title="Whatsapp web"
            titleStyle={{color: 'black'}}
            onPress={() => {
              handleCloseMenu();
              props.navigation.navigate('QRScanner');
            }}
          />
          <Menu.Item
            leadingIcon={() => (
              <View>
                {isloading ? (
                  <ActivityIndicator
                    animating={true}
                    color={MD2Colors.greenA100}
                  />
                ) : (
                  <Image
                    style={{
                      height: 30,
                      width: 30,
                    }}
                    source={require('../src/assets/logout.png')}
                  />
                )}
              </View>
            )}
            title="Logout"
            titleStyle={{color: 'black'}}
            onPress={logout}
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
