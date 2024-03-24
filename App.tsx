import React, {createContext, useEffect, useState} from 'react';
import Navigator from './navigations';
import {Provider} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
export const MyContext = createContext({});
export default function App() {
  const [Data, setuserData] = useState({});
  useEffect(() => {
    AsyncStorage.getItem('userData').then(res => {
      const data = res ? JSON.parse(res) : false;
      if (data) {
        setuserData(data);
      }
    });
  }, []);

  return (
    <MyContext.Provider value={{Data}}>
      <Provider>
        <Navigator />
      </Provider>
    </MyContext.Provider>
  );
}
