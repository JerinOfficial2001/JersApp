import React, {createContext, useEffect, useState} from 'react';
import Navigator from './navigations';
import {Provider} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {themeSchema} from './utils/theme';
import {QueryClientProvider, QueryClient} from '@tanstack/react-query';
import {SocketProvider} from './utils/socket';
import {SheetProvider} from 'react-native-actions-sheet';

export const MyContext = createContext({});

export const queryClient = new QueryClient();
export default function App() {
  const [Data, setuserData] = useState(null);
  const [themeHandler, setthemeHandler] = useState('JersApp');
  const [jersAppTheme, setjersAppTheme] = useState(themeSchema[themeHandler]);
  const [pageName, setpageName] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    setjersAppTheme(themeSchema[themeHandler]);
  }, [themeHandler, pageName]);

  useEffect(() => {
    AsyncStorage.getItem('userData').then(res => {
      const data = res ? JSON.parse(res) : false;
      if (data) {
        setuserData(data);
        setthemeHandler(data.theme ? data.theme : themeHandler);
      }
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SocketProvider>
        <MyContext.Provider
          value={{
            Data,
            themeHandler,
            setthemeHandler,
            jersAppTheme,
            pageName,
            setpageName,
            setuserData,
            selectedIds,
            setSelectedIds,
          }}>
          <Provider>
            <SheetProvider context="global">
              <Navigator />
            </SheetProvider>
          </Provider>
        </MyContext.Provider>
      </SocketProvider>
    </QueryClientProvider>
  );
}
