import {Dimensions, StyleSheet, Text, View, ViewStyle} from 'react-native';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import React, {FC} from 'react';
import {TouchableOpacity} from 'react-native-gesture-handler';

interface CustomBottomTabBarProps extends BottomTabBarProps {}

const {width} = Dimensions.get('screen');

const CustomBottomTabBar = ({
  descriptors,
  insets,
  navigation,
  state,
}: CustomBottomTabBarProps) => {
  return (
    <View
      style={{
        backgroundColor: 'transparent',
        minHeight: 50,
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
      }}>
      {state?.routes?.map((route, index) => (
        <TouchableOpacity
          key={index}
          style={{
            flex: 1,

            width: width / state.routes.length,
            alignItems: 'center',
            backgroundColor: 'blue',
            justifyContent: 'center',
          }}
          onPress={() => navigation.navigate(route.name)}>
          <Text style={{color: 'red'}}>{route.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default CustomBottomTabBar;

const styles = StyleSheet.create({});
