import {iprotecsLapIP} from '../api';

export const sendMessage = async data => {
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
    });
    console.log(response, 'SEND MSG');
  } catch (error) {
    console.error('Error sending private message:', error);
  }
};
