import {createContext, useContext, useEffect, useState} from 'react';
import {io} from 'socket.io-client';
import {socketServerApi} from '../src/api';
import {showNotification} from '../src/notification.android';
const SocketContext = createContext(null);
export const useSocketHook = () => {
  const socket = useContext(SocketContext);
  return socket;
};
export const SocketProvider = ({children}) => {
  const [socket, setsocket] = useState(null);
  const [activeUsers, setactiveUsers] = useState([]);
  const [watchingUsers, setwatchingUsers] = useState([]);
  const [typingUsers, settypingUsers] = useState([]);
  useEffect(() => {
    const connection = io(socketServerApi);
    setsocket(connection);
    connection.on('notification', data => {
      console.log(data, 'notification');
      showNotification(data.name, data.msg);
    });
    connection.on('user_connected', data => {
      setactiveUsers(data);
    });
    connection.on('user_watching', data => {
      setwatchingUsers(data);
    });
    connection.on('user_typing', data => {
      settypingUsers(data);
    });
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{socket, typingUsers, watchingUsers, activeUsers}}>
      {children}
    </SocketContext.Provider>
  );
};
