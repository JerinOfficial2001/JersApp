import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {Image, View, ToastAndroid} from 'react-native';
import React, {createContext, useContext, useEffect, useState} from 'react';
import AuthModal from '../src/components/AuthModal';
import Chats from '../screens/Chats';
import Status from '../screens/Status';
import TopBar from '../src/components/TopBar';
import {ActivityIndicator, Avatar, IconButton, Menu} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {GetUsersByID} from '../src/controllers/auth';
import Plus from '../src/assets/svg/plus';
import Camera from '../src/assets/svg/camera';
import {MyContext} from '../App';
import {useSocketHook} from '../utils/socket';

const Tab = createMaterialTopTabNavigator();

export const TopBarContext = createContext();

export default function TabNavigator({props, navigation}) {
  const {socketLogout} = useSocketHook();
  const [visible, setVisible] = useState(false);
  const [isDelete, setisDelete] = useState(false);
  const [isModelOpen, setisModelOpen] = useState(false);
  const [openMenu, setopenMenu] = useState(false);
  const [isloading, setisloading] = useState(false);
  const [userData, setuserData] = useState({});
  const [activeTab, setactiveTab] = useState('CHATS');
  const [addStatus, setaddStatus] = useState(false);
  const [userProfile, setuserProfile] = useState(null);
  // const [jersAppTheme, setjersApptheme] = useState(JersAppThemeSchema);
  const {jersAppTheme, setpageName} = useContext(MyContext);
  useEffect(() => {
    AsyncStorage.getItem('userData').then(res => {
      const data = JSON.parse(res);
      setuserData(data);
      GetUsersByID(data._id).then(res => {
        setuserProfile(res?.image?.url);
      });
    });
    setpageName('Home');
  }, []);
  const renderRightHeaderComponent = () => (
    <IconButton
      style={{
        bottom: 10,
        position: 'absolute',
        right: 10,
        backgroundColor: jersAppTheme.appBar,
        padding: 10,
      }}
      icon={() => (
        <View>
          {activeTab == 'CHATS' ? (
            <Plus color={jersAppTheme.title} />
          ) : (
            <Camera color={jersAppTheme.title} />
          )}
        </View>
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
    socketLogout(userData._id);
    AsyncStorage.removeItem('userData');
    props.navigation.navigate('Login');
    handleCloseMenu();
    ToastAndroid.show('Logged out successfully', ToastAndroid.SHORT);
    setisloading(false);
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
          title={'JersApp'}
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
            backgroundColor: jersAppTheme.model,
            borderRadius: 10,
            shadowColor: jersAppTheme.shadows,
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
            titleStyle={{color: jersAppTheme.title}}
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
            title="Linked devices"
            titleStyle={{color: jersAppTheme.title}}
            onPress={() => {
              handleCloseMenu();
              props.navigation.navigate('QRScanner');
            }}
          />
          <Menu.Item
            leadingIcon={() => (
              <Image
                style={{
                  height: 30,
                  width: 30,
                }}
                source={require('../src/assets/logo.png')}
              />
            )}
            title="Theme"
            titleStyle={{color: jersAppTheme.title}}
            onPress={() => {
              handleCloseMenu();
              props.navigation.navigate('Themes');
            }}
          />
          <Menu.Item
            leadingIcon={() => (
              <View>
                {isloading ? (
                  <ActivityIndicator
                    animating={true}
                    color={jersAppTheme.appBar}
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
            titleStyle={{color: jersAppTheme.title}}
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
              backgroundColor: jersAppTheme.tabBarIndicator,
              height: 3,
              borderRadius: 5,
            },
            tabBarStyle: {
              backgroundColor: jersAppTheme.appBar,
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
