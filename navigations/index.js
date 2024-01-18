import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import AuthModal from '../src/components/AuthModal';
import Home from '../screens/Home';
import Message from '../screens/Message';
import PlayStatus from '../screens/PlayStatus';
import AllContacts from '../screens/AllContacts';

const Stack = createStackNavigator();

export default function Navigator() {
  const [visible, setVisible] = React.useState(false);

  return (
    <NavigationContainer>
      <Stack.Navigator>
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
