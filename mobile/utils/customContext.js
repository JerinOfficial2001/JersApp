import React, {createContext, useState, useContext, useEffect} from 'react';
import {io} from 'socket.io-client';
import {socketServerApi} from '../src/api';

// Step 1: Create a context
const CustomContext = createContext();

// Step 2: Create a provider component
export const CustomProvider = ({children}) => {
  const [socket, setSocketIo] = useState(null);
  function useSocket() {
    const SocketAPI = socketServerApi;

    useEffect(() => {
      useSocket();
      const socketIO = io(SocketAPI, {
        // path: '/socket',
      });
      setSocketIo(socketIO);

      return () => {
        socketIO.disconnect();
      };
    }, [socket]);
    return socket;
  }

  return (
    <CustomContext.Provider value={{useSocket, socket}}>
      {children}
    </CustomContext.Provider>
  );
};

// Step 3: Create a custom hook to access the context
export const useCustomContext = () => useContext(CustomContext);
