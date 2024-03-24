import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React, {useState} from 'react';
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

const Stack = createStackNavigator();

export default function Navigator() {
  const [visible, setVisible] = useState(false);

  return (
    <NavigationContainer>
      <Stack.Navigator>
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
              backgroundColor: '#008169',
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
              backgroundColor: '#008169',
            },
            headerTintColor: 'white',
          }}
          name="AllContacts"
          component={AllContacts}
        />
        <Stack.Screen
          options={{
            headerStyle: {
              backgroundColor: '#008169',
            },
            headerTintColor: 'white',
          }}
          name="PlayStatus"
          component={PlayStatus}
        />
        <Stack.Screen
          options={{
            headerStyle: {
              backgroundColor: '#008169',
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
              backgroundColor: '#008169',
            },
            title: 'My Profile',
            headerTintColor: 'white',
          }}
          name="MyProfile"
          component={MyProfile}
        />
      </Stack.Navigator>

      <AuthModal visible={visible} setVisible={setVisible} />
    </NavigationContainer>
  );
}
