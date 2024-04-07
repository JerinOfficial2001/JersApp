import {useEffect, useState} from 'react';
import {socketServerApi} from '../src/api';
import {io} from 'socket.io-client';

export default function useSocket() {
  const SocketAPI = socketServerApi;

  const [socket, setSocketIo] = useState(null);
  const [activeUsers, setactiveUsers] = useState([]);
  const [watchingUsers, setwatchingUsers] = useState([]);
  const [typingUsers, settypingUsers] = useState([]);
  useEffect(() => {
    if (!socket) {
      const socketIO = io(SocketAPI, {
        //   path: '/socket',
      });
      setSocketIo(socketIO);
      socketIO.on('user_connected', data => {
        console.log(data);
        setactiveUsers(data);
      });
      socketIO.on('user_watching', data => {
        setwatchingUsers(data);
      });
      socketIO.on('user_typing', data => {
        console.log(data, 'user_typing');
        settypingUsers(data);
      });
    }
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
  const isOnline = id => {
    const isActive = activeUsers?.find(res => res.id == id);
    return isActive;
  };
  const isWatching = id => {
    const isActive = watchingUsers?.find(res => res.id == id);

    return isActive;
  };
  const isTyping = id => {
    const isActive = typingUsers?.find(res => res.id == id);
    return isActive;
  };
  return {
    socket,
    socketUserWatching,
    socketUserTyping,
    socketUserTyped,
    socketUserWatched,
    socketUserID,
    socketUserConnected,
    isOnline,
    isTyping,
    isWatching,
  };
}
