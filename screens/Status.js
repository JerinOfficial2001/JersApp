import React from 'react';
import {Image, ScrollView, Text, View} from 'react-native';
import MyComponent from '../src/components/MyComponent';

export default function Status(props) {
  return (
    <ScrollView style={{padding: 10}}>
      {[1, 2, 3, 4, 5, 6, 7, 8].map(elem => {
        return (
          <MyComponent
            status={true}
            key={elem}
            onclick={() => {
              props.navigation.navigate('PlayStatus');
            }}
          />
        );
      })}
    </ScrollView>
  );
}
