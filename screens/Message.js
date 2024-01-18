import React, {useEffect, useState} from 'react';
import {ScrollView, Text} from 'react-native';
import {requestContactsPermission} from '../src/controllers/contacts';
import {login} from '../src/controllers/auth';

export default function Message({route, navigation, ...props}) {
  const {id} = route.params;

  useEffect(() => {
    requestContactsPermission().then(res => {
      if (res) {
        const particularData = res.find(i => i.rawContactId == id);
        navigation.setOptions({
          title: particularData ? particularData.displayName : 'Message',
        });
      }
    });
    login();
  }, []);
  return (
    <ScrollView>
      <Text>Hello</Text>
    </ScrollView>
  );
}
