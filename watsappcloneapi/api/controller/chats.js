export const createChat = async data => {
  try {
    const response = await fetch('/api/chat', {
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
      return response.data;
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
};
export const getAllChats = async (sender, receiver) => {
  try {
    const response = await fetch(`/api/chat/?senderID=${sender}&receiverID=${receiver}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }).then(res => res.json());
    if (response.status == 'ok') {
      return response.data
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
};
