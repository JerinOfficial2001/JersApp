import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React, {useContext, useState} from 'react';
import AuthModal from '../src/components/AuthModal';
import Home from '../screens/Home';
import Message from '../screens/Message';
import PlayStatus from '../screens/PlayStatus';
import AllContacts from '../screens/AllContacts';
import Login from '../screens/auth/Login';
import Register from '../screens/auth/Register';
import Settings from '../screens/Settings';
import QRScanner from '../screens/QRScanner';
import AddStatus from '../screens/AddStatus';
import MyProfile from '../screens/MyProfile';
import PreviewStatus from '../screens/PreviewStatus';
import InitialPage from '../screens/InitialPage';
import {DarkThemeSchema, JersAppThemeSchema} from '../utils/theme';
import Themes from '../screens/Themes';
import {MyContext} from '../App';
import AddParticipants from '../screens/AddParticipants';
import CreateGroup from '../screens/CreateGroup';
import GroupMsg from '../screens/GroupMsg';
import ViewGroupProfile from '../screens/ViewGroupProfile';
import VideoCall from '../screens/VideoCall';

const Stack = createStackNavigator();

export default function Navigator() {
  const [visible, setVisible] = useState(false);
  // const [theme, settheme] = useState(JersAppThemeSchema);
  const {jersAppTheme, setpageName} = useContext(MyContext);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
          name="InitialPage"
          component={InitialPage}
        />
        <Stack.Screen
          options={{
            headerShown: false,
          }}
          name="Login"
          component={Login}
        />
        <Stack.Screen
          options={{
            headerStyle: {
              backgroundColor: jersAppTheme.appBar,
              elevation: 0,
            },
            headerTintColor: 'white',
            title: 'Add Personal Details',
          }}
          name="Register"
          component={Register}
        />
        <Stack.Screen
          options={{
            headerShown: false,
          }}
          name="Settings"
          component={Settings}
        />
        <Stack.Screen
          options={{
            headerShown: false,
          }}
          name="Home"
          component={Home}
        />
        <Stack.Screen
          options={{
            headerShown: false,
          }}
          name="Message"
          component={Message}
        />
        <Stack.Screen
          options={{
            headerStyle: {
              backgroundColor: jersAppTheme.appBar,
              elevation: 0,
            },
            headerTintColor: 'white',
          }}
          name="AllContacts"
          component={AllContacts}
        />
        <Stack.Screen
          options={{
            headerStyle: {
              backgroundColor: jersAppTheme.appBar,
              elevation: 0,
            },
            headerTintColor: 'white',
          }}
          name="PlayStatus"
          component={PlayStatus}
        />
        <Stack.Screen
          options={{
            headerStyle: {
              backgroundColor: jersAppTheme.appBar,
              elevation: 0,
            },
            headerTintColor: 'white',
          }}
          name="QRScanner"
          component={QRScanner}
        />
        <Stack.Screen
          options={{
            headerShown: false,
          }}
          name="AddStatus"
          component={AddStatus}
        />
        <Stack.Screen
          options={{
            headerShown: false,
          }}
          name="PreviewStatus"
          component={PreviewStatus}
        />
        <Stack.Screen
          options={{
            headerStyle: {
              backgroundColor: jersAppTheme.appBar,
              elevation: 0,
            },
            title: 'My Profile',
            headerTintColor: 'white',
          }}
          name="MyProfile"
          component={MyProfile}
        />
        <Stack.Screen
          options={{
            headerStyle: {
              backgroundColor: jersAppTheme.appBar,
              elevation: 0,
            },
            title: 'Theme',
            headerTintColor: 'white',
          }}
          name="Themes"
          component={Themes}
        />
        <Stack.Screen
          options={{
            headerStyle: {
              backgroundColor: jersAppTheme.appBar,
              elevation: 0,
            },
            title: 'New Group',
            headerTintColor: 'white',
          }}
          name="AddParticipants"
          component={AddParticipants}
        />
        <Stack.Screen
          options={{
            headerStyle: {
              backgroundColor: jersAppTheme.appBar,
              elevation: 0,
            },
            title: 'New Group',
            headerTintColor: 'white',
          }}
          name="CreateGroup"
          component={CreateGroup}
        />
        <Stack.Screen
          options={{
            headerStyle: {
              backgroundColor: jersAppTheme.appBar,
              elevation: 0,
            },
            title: 'Group',
            headerTintColor: 'white',
          }}
          name="GroupMsg"
          component={GroupMsg}
        />
        <Stack.Screen
          options={{
            headerStyle: {
              backgroundColor: jersAppTheme.appBar,
              elevation: 0,
            },
            title: 'Group',
            headerTintColor: 'white',
          }}
          name="ViewGroupProfile"
          component={ViewGroupProfile}
        />
        <Stack.Screen
          options={{
            headerStyle: {
              backgroundColor: jersAppTheme.appBar,
              elevation: 0,
            },
            title: 'VideoCall',
            headerTintColor: 'white',
          }}
          name="VideoCall"
          component={VideoCall}
        />
      </Stack.Navigator>

      <AuthModal visible={visible} setVisible={setVisible} />
    </NavigationContainer>
  );
}
