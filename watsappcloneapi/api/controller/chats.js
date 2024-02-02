export const createChat = async data => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Access-Control-Allow-Origin': *,
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
    const response = await fetch('/api/chat', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Access-Control-Allow-Origin': *,
      },
    }).then(res => res.json());
    if (response.status == 'ok') {
      const chatIDs = [sender, receiver];
      const filteredChats = response.data.find(i =>
        chatIDs.every(id => i.sender == id || i.receiver == id),
      );
      if (filteredChats) {
        return filteredChats;
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
};
