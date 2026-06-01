import apiClient from '../services/apiClient';

export const getGroupMsg = async ({id, groupID}) => {
  try {
    const {data} = await apiClient.get(
      `/api/groupMsg?userID=${id}&groupID=${groupID}`,
    );
    if (data && data.status === 'ok') {
      return data.data;
    } else {
      console.log(data?.message, 'getGroupMsgERR');
      return [];
    }
  } catch (error) {
    console.log('getGroupMsgERR', error);
    return [];
  }
};

export const deleteGroupMsgForMe = async (messageId, userId) => {
  try {
    const {data} = await apiClient.post('/api/groupMsg/deleteForMe', {
      messageId,
      userId,
    });
    return data;
  } catch (error) {
    console.error('deleteGroupMsgForMe Err:', error.message);
    return {status: 'error', message: error.message};
  }
};

export const deleteGroupMsgForEveryone = async (messageId, userId) => {
  try {
    const {data} = await apiClient.post('/api/groupMsg/deleteForEveryone', {
      messageId,
      userId,
    });
    return data;
  } catch (error) {
    console.error('deleteGroupMsgForEveryone Err:', error.message);
    return {status: 'error', message: error.message};
  }
};

export const addGroupReaction = async (messageId, userId, emoji) => {
  try {
    const {data} = await apiClient.post('/api/groupMsg/react', {
      messageId,
      userId,
      emoji,
    });
    return data;
  } catch (error) {
    console.error('addGroupReaction Err:', error.message);
    return {status: 'error', message: error.message};
  }
};

export const removeGroupReaction = async (messageId, userId) => {
  try {
    const {data} = await apiClient.delete('/api/groupMsg/react', {
      data: { messageId, userId },
    });
    return data;
  } catch (error) {
    console.error('removeGroupReaction Err:', error.message);
    return {status: 'error', message: error.message};
  }
};

export const markGroupMsgAsRead = async (messageId, userId) => {
  try {
    const {data} = await apiClient.post('/api/groupMsg/read', {
      messageId,
      userId,
    });
    return data;
  } catch (error) {
    console.error('markGroupMsgAsRead Err:', error.message);
    return {status: 'error', message: error.message};
  }
};
