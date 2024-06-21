import React, {createContext, useEffect, useState} from 'react';
import Navigator from './navigations';
import {Provider} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {themeSchema} from './utils/theme';
export const MyContext = createContext({});
export default function App() {
  const [Data, setuserData] = useState({});
  const [themeHandler, setthemeHandler] = useState('JersApp');
  const [jersAppTheme, setjersAppTheme] = useState(themeSchema[themeHandler]);
  const [pageName, setpageName] = useState('');
  useEffect(() => {
    setjersAppTheme(themeSchema[themeHandler]);
  }, [themeHandler, pageName]);
  console.log(themeHandler);

  useEffect(() => {
    AsyncStorage.getItem('userData').then(res => {
      const data = res ? JSON.parse(res) : false;
      if (data) {
        setuserData(data);
      }
    });
  }, []);

  return (
    <MyContext.Provider
      value={{
        Data,
        themeHandler,
        setthemeHandler,
        jersAppTheme,
        pageName,
        setpageName,
      }}>
      <Provider>
        <Navigator />
      </Provider>
    </MyContext.Provider>
  );
}
