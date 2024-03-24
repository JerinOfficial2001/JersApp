import React, {useContext, useState} from 'react';
import {Image, ScrollView, Text, View} from 'react-native';
import MyComponent from '../src/components/MyComponent';
import {useFocusEffect} from '@react-navigation/native';
import {TopBarContext} from '../navigations/tabNavigation';
import {GetAllStatus} from '../src/controllers/status';

export default function Status(props) {
  const {setactiveTab, addStatus, setaddStatus} = useContext(TopBarContext);
  const [status, setstatus] = useState([]);
  useFocusEffect(
    React.useCallback(() => {
      setactiveTab('STATUS');
      GetAllStatus().then(data => {
        setstatus(data);
      });
    }, []),
  );
  return (
    <ScrollView style={{padding: 10}}>
      {status?.map(elem => {
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
  );
}
