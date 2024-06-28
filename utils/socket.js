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
  const [isWatching, setisWatching] = useState(null);
  const [isTyping, setisTyping] = useState(null);
  const [newMsgCount, setnewMsgCount] = useState(null);
  const [ID, setID] = useState('');
  useEffect(() => {
    const connection = io(socketServerApi);
    setsocket(connection);
    connection.on('notification', data => {
      showNotification(data.name, data.msg);
    });
    connection.on('user_connected', data => {
      setactiveUsers(data);
    });
    connection.on('user_watching', data => {
      setisWatching(data);
    });
    connection.on('user_typing', data => {
      setisTyping(data);
    });
    connection.on('newMsgs', data => {
      setnewMsgCount(data);
    });
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);
  const socketUserID = data => {
    socket?.emit('set_user_id', data);
  };
  const socketUserConnected = data => {
    socket?.emit('user_connected', data);
  };
  const socketUserWatching = data => {
    socket?.emit('user_watching', data);
  };
  const socketUserTyping = data => {
    socket?.emit('user_typing', data);
  };
  const socketUserTyped = data => {
    socket?.emit('user_typed', data);
  };
  const socketUserWatched = data => {
    socket?.emit('user_watchout', data);
  };
  const socketLogout = data => {
    socket?.emit('removeUser', data);
  };
  const isOnline = id => {
    const isActive = activeUsers?.find(res => res.id == id);
    return isActive;
  };

  return (
    <SocketContext.Provider
      value={{
        socketUserWatching,
        socketUserTyping,
        socketUserTyped,
        socketUserWatched,
        socketUserID,
        socketUserConnected,
        isOnline,
        isTyping,
        isWatching,
        socket,
        activeUsers,
        newMsgCount,
        setnewMsgCount,
        socketLogout,
        setisWatching,
        setisTyping,
      }}>
      {children}
    </SocketContext.Provider>
  );
};
