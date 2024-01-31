import {getAllUsers} from '@/api/controller/auth';
import {createChat, getAllChats} from '@/api/controller/chats';
import {getAllMessages} from '@/api/controller/message';
import {useRouter} from 'next/router';
import React, {useEffect, useState} from 'react';
import {io} from 'socket.io-client';

export default function Homepg() {
  const router = useRouter();
  const [users, setusers] = useState([]);
  const [userData, setuserData] = useState({});
  const [formDatas, setformDatas] = useState({
    msg: '',
    userName: '',
  });
  const handleOnchange = event => {
    const {value, name} = event.target;
    setformDatas({
      ...formDatas,
      [name]: value,
    });
  };
  const [socket, setsocket] = useState(null);
  const [chatArray, setchatArray] = useState([]);
  const [currentChatPg, setcurrentChatPg] = useState({});
  const handleSocket = async () => {
    const socketData = io('https://whatsapp-clone-socket-api.vercel.app');
    if (socketData) {
      setsocket(socketData);
    }
    if (socket) {
      socket.on('message', data => {
        if (chatID && data) {
          const filteredMsg = data.filter(msg => msg.chatID == chatID);
          if (filteredMsg) {
            setchatArray(filteredMsg);
          }
        }
      });
    }
  };
  const getUsers = data => {
    getAllUsers(data._id).then(res => {
      if (res) {
        setusers(res);
      }
    });
  };
  useEffect(() => {
    handleSocket();
    const storageData = localStorage.getItem('userData');
    if (storageData) {
      const userDetails = JSON.parse(storageData);
      setuserData(userDetails);
      getUsers(userDetails);
    }
  }, []);
  const [chatID, setchatID] = useState('');

  console.log(chatID, 'ID');
  const handleSubmit = e => {
    e.preventDefault();
    if (formDatas.msg !== '') {
      socket.emit('message', {
        chatID: chatID,
        sender: userData.name,
        receiver: currentChatPg?.receiver,
        message: formDatas.msg,
      });
      handleSocket();
    }
  };
  const addChat = data => {
    if (data.sender && data.receiver) {
      createChat(data);
      setcurrentChatPg(data);
      handleSocket();
      getAllChats(data.sender, data.receiver).then(chat => {
        if (chat) {
          setchatID(chat._id);
          getAllMessages(chat._id).then(msg => {
            if (msg) {
              setchatArray(msg);
            }
          });
        }
      });
    }
  };
  const getUserNameByID = id => {
    const res = users.find(user => user._id === id);
    if (res) {
      return res?.name;
    } else {
      return 'Name';
    }
  };
  return (
    <div
      style={{
        height: '100vh',
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 3,
        padding: 5,
      }}>
      <button
        onClick={() => {
          localStorage.clear();
          router.push('/');
        }}>
        Logout
      </button>
      <div
        style={{
          width: '40%',
          height: '400px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          gap: 3,
          background: 'white',
        }}>
        <h3 style={{color: 'black'}}>{userData?.name}</h3>
        {users?.map((elem, index) => {
          return (
            <div
              onClick={() => {
                addChat({sender: userData._id, receiver: elem._id});
              }}
              key={index}
              style={{
                height: '60px',
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                gap: 3,
                borderRadius: '10px',
                border: '1px solid green',
                color: 'black',
              }}>
              <p>{elem.name}</p>
            </div>
          );
        })}
      </div>
      <div
        style={{
          height: '100vh',
          width: '60%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexDirection: 'column',
          gap: 3,
          background: 'gray',
        }}>
        <h1>{getUserNameByID(currentChatPg?.receiver)}</h1>
        <div
          style={{
            minHeight: '90vh',
            width: '90%',
            display: 'flex',
            alignItems: 'end',
            flexDirection: 'column',
            gap: 3,
            background: 'slategray',
            padding: 5,
            paddingBottom: 70,
            overflowY: 'scroll',
          }}>
          {chatArray.map((chat, index) => {
            const isCurrentUser = chat.sender === userData.name;
            return (
              <div
                key={index}
                style={{
                  height: 'auto',
                  width: '100%',
                  display: 'flex',
                  justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                  alignItems: 'center',
                  padding: 3,
                  gap: 3,
                }}>
                <p
                  style={{
                    borderRadius: isCurrentUser
                      ? '10px 10px 0 10px'
                      : '0 10px 10px 10px',
                    border: '1px solid black',
                    color: 'black',
                    background: 'white',
                    padding: 10,
                  }}>
                  {chat.message}
                </p>
              </div>
            );
          })}
        </div>

        <form style={{position: 'fixed', bottom: 10}} onSubmit={handleSubmit}>
          <input
            type="text"
            value={formDatas.msg}
            name="msg"
            onChange={handleOnchange}
          />
          <button type="submit">send</button>
        </form>
      </div>
    </div>
  );
}
