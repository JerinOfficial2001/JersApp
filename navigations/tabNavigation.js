import {NavigationContainer} from '@react-navigation/native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {Image, TouchableOpacity, View, Text, ToastAndroid} from 'react-native';
import React, {createContext, useEffect, useState} from 'react';
import AuthModal from '../src/components/AuthModal';
import Chats from '../screens/Chats';
import Status from '../screens/Status';
import TopBar from '../src/components/TopBar';
import {
  ActivityIndicator,
  Avatar,
  IconButton,
  MD2Colors,
  Menu,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {GetUsersByID, logoutWithToken} from '../src/controllers/auth';

const Tab = createMaterialTopTabNavigator();

export const TopBarContext = createContext();

export default function TabNavigator({props, navigation}) {
  const [visible, setVisible] = useState(false);
  const [isDelete, setisDelete] = useState(false);
  const [isModelOpen, setisModelOpen] = useState(false);
  const [openMenu, setopenMenu] = useState(false);
  const [isloading, setisloading] = useState(false);
  const [userData, setuserData] = useState({});
  const [activeTab, setactiveTab] = useState('CHATS');
  const [addStatus, setaddStatus] = useState(false);
  const [userProfile, setuserProfile] = useState(null);
  useEffect(() => {
    AsyncStorage.getItem('userData').then(res => {
      const data = JSON.parse(res);
      setuserData(data);
      GetUsersByID(data._id).then(res => {
        setuserProfile(res.image.url);
      });
    });
  }, []);
  const renderRightHeaderComponent = () => (
    <IconButton
      style={{
        bottom: 10,
        position: 'absolute',
        right: 10,
        backgroundColor: '#008069',
        padding: 10,
      }}
      icon={() => (
        <Image
          style={{
            height: 25,
            width: 25,
          }}
          source={
            activeTab == 'CHATS'
              ? require('../src/assets/plus.png')
              : require('../src/assets/camera.png')
          }
        />
      )}
      size={40}
      onPress={() => {
        activeTab == 'CHATS'
          ? props.navigation.navigate('AllContacts')
          : props.navigation.navigate('AddStatus', {
              onlyCamera: false,
              id: userData._id,
            });
      }}
    />
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
      value={{
        setopenMenu,
        setisDelete,
        isModelOpen,
        setisModelOpen,
        setactiveTab,
        addStatus,
        setaddStatus,
      }}>
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
            leadingIcon={() =>
              userProfile ? (
                <Avatar.Image size={30} source={{uri: userProfile}} />
              ) : (
                <Avatar.Image
                  size={30}
                  source={require('../src/assets/user.png')}
                />
              )
            }
            title={userData?.name}
            titleStyle={{color: 'black'}}
            onPress={() => {
              handleCloseMenu();
              props.navigation.navigate('MyProfile', {
                id: userData._id,
              });
            }}
          />
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
