import {iprotecsLapIP} from '../api';

export const sendMessage = async data => {
  console.log(data, 'ADDMSG');
  try {
    const response = await fetch(iprotecsLapIP + '/api/chat/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        from: data.username,
        to: data.recipient,
        text: data.text,
      }),
    }).then(res => res.json());
  } catch (error) {
    console.error('Error sending private message:', error);
  }
};
export const getMessage = async () => {
  try {
    const response = await fetch(iprotecsLapIP + '/api/chat/get', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }).then(res => res.json());
    return response;
  } catch (error) {
    console.error('Error sending private message:', error);
  }
};
