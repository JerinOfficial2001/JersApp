import React, {useContext, useState} from 'react';
import {Image, Pressable, ScrollView, Text, View} from 'react-native';
import MyComponent from '../src/components/MyComponent';
import {useFocusEffect} from '@react-navigation/native';
import {TopBarContext} from '../navigations/tabNavigation';
import {GetAllStatus} from '../src/controllers/status';
import StatusIndicator from '../src/components/StatusIndicator';
import DonutChart from '../src/components/DonutChart';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Status(props) {
  const {setactiveTab, addStatus, setaddStatus, setopenMenu} =
    useContext(TopBarContext);
  const [status, setstatus] = useState([]);
  const [userData, setuserData] = useState(null);
  useFocusEffect(
    React.useCallback(() => {
      setactiveTab('STATUS');
      GetAllStatus().then(data => {
        setstatus(data);
      });
      AsyncStorage.getItem('userData').then(data => {
        setuserData(data ? JSON.parse(data) : null);
      });
    }, []),
  );
  const handlePress = () => {
    setopenMenu(false);
  };
  const userStatus = status?.find(data => data.userID == userData._id);
  const otherUserStatus = status?.filter(data => data.userID !== userData._id);
  return (
    <Pressable style={{flex: 1}} onPress={handlePress}>
      <ScrollView style={{padding: 10}}>
        <MyComponent
          status={{
            title: 'My status',
            file: userStatus?.file,
          }}
          onclick={() => {
            if (!userStatus) {
              props.navigation.navigate('AddStatus', {
                id: userData?._id,
              });
            } else {
              props.navigation.navigate('PlayStatus', {
                id: userStatus?._id,
              });
            }
          }}
        />
        {otherUserStatus?.map(elem => {
          return (
            <MyComponent
              status={elem}
              key={elem._id}
              onclick={() => {
                props.navigation.navigate('PlayStatus', {
                  id: elem._id,
                });
              }}
            />
          );
        })}
      </ScrollView>
    </Pressable>
  );
}
