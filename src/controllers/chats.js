import {nextApi, expressApi} from '../api';

export const sendMessage = async data => {
  try {
    const response = await fetch(expressApi + '/api/chat/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        from: data.username,
        to: data.recipient,
        text: data.text,
        recipient: data.recipient,
      }),
    }).then(res => res.json());
  } catch (error) {
    console.error('Error sending private message:', error);
  }
};
export const getMessage = async chatID => {
  try {
    const response = await fetch(expressApi + '/api/message', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }).then(res => res.json());

    if (response.status == 'ok') {
      const filteredMsg = response.data.filter(msg => msg.chatID == chatID);

      if (filteredMsg) {
        return filteredMsg;
      }
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
