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
            headerShown: false,
          }}
          name="Register"
          component={Register}
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
            headerStyle: {
              backgroundColor: '#008169',
            },
            headerTintColor: 'white',
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
      </Stack.Navigator>

      <AuthModal visible={visible} setVisible={setVisible} />
    </NavigationContainer>
  );
}
