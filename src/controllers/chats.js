import axios from 'axios';
import {GET_USERDATA} from '../../utils/ayncStorage/getAndSet';
import {nextApi, expressApi} from '../api';

export const sendMessage = async formData => {
  const userData = await GET_USERDATA();

  try {
    const {data} = await axios.post(expressApi + '/api/message', formData, {
      headers: {
        Authorization: `Bearer ${userData?.accessToken}`,
      },
    });

    return data;
  } catch (error) {
    console.error('Error sending private message:', error);
  }
};
export const getMessage = async chatID => {
  const userData = await GET_USERDATA();
  try {
    const response = await fetch(expressApi + '/api/message', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${userData?.accessToken}`,
      },
    }).then(res => res.json());

    if (response.status == 'ok') {
      const filteredMsg = response.data.filter(
        msg => msg.chatID == chatID.queryKey[1],
      );

      if (filteredMsg) {
        return filteredMsg;
      } else {
        return [];
      }
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error sending private message:', error);
  }
};
export const createChat = async data => {
  try {
    const response = await fetch(nextApi + '/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        receiver: data.receiver,
        sender: data.sender,
        endpoint: 'createChat',
      }),
    }).then(res => res.json());
    if (response.status == 'ok') {
      return response.message;
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
};
export const getAllChats = async (sender, receiver) => {
  try {
    const response = await fetch(
      `${nextApi}/api/chat/?senderID=${sender}&receiverID=${receiver}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
    ).then(res => res.json());

    if (response.status == 'ok') {
      return response.data;
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
};
export const getLastMsg = async (sender, receiver) => {
  try {
    const response = await fetch(
      `${expressApi}/api/lastMsg/${sender}/${receiver}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
    ).then(res => res.json());

    if (response.status == 'ok') {
      return response.data;
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
};
export const deleteMessageById = async id => {
  try {
    const response = await fetch(expressApi + `/api/message?id=${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }).then(res => res.json());

    return response;
  } catch (error) {
    console.log(error);
  }
};
