import React from 'react';
import {ScrollView, Text, View} from 'react-native';
import MyComponent from '../src/components/MyComponent';

export default function Chats(props) {
  return (
    <ScrollView style={{padding: 10}}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(elem => {
        return (
          <MyComponent
            key={elem}
            onclick={() => {
              props.navigation.navigate('Message');
            }}
          />
        );
      })}
    </ScrollView>
  );
}
