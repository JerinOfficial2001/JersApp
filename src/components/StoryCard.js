import React from 'react';
import {View} from 'react-native';

export default function StoryCard() {
  return (
    <View
      style={{
        width: '100%',
        height: 120,
        display: 'flex',
        flexDirection: 'row',
        gap: 3,
      }}>
      {[1, 2, 3, 4, 5].map(item => {
        return (
          <View
            key={item}
            style={{
              backgroundColor: 'lavender',
              width: 73,
              height: 110,
              display: 'flex',
              flexDirection: 'row',
              gap: 3,
              borderRadius: 10,
            }}></View>
        );
      })}
    </View>
  );
}
