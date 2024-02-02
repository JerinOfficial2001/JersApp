export const getAllMessages = async chatID => {
  try {
    const response = await fetch('/api/message', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Access-Control-Allow-Origin': "*",
      },
    }).then(res => res.json());
    if (response.status == 'ok') {
      const filteredMsg = response.data.filter(msg => msg.chatID == chatID);
      if (filteredMsg) {
        return filteredMsg;
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
};
