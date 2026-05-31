import {expressApi} from '../api';
import apiClient from '../services/apiClient';

export const sendMessage = async data => {
  try {
    const response = await apiClient.post('/api/message', {
      chatID: data.chatID,
      sender: data.sender,
      receiver: data.receiver,
      message: data.message,
      fileType: data.fileType,
      replyTo: data.replyTo,
    });
    return response.data;
  } catch (error) {
    console.error('sendMessage Err:', error.message);
  }
};

/**
 * Fetch messages for a specific chatID — server filters by chatID now
 */
export const getMessage = async chatID => {
  try {
    const {data} = await apiClient.get(`/api/message?chatID=${chatID}`);
    if (data.status === 'ok') {
      return data.data;
    }
    return [];
  } catch (error) {
    console.error('getMessage Err:', error.message);
    return [];
  }
};

/**
 * Create or find a chat between two users (now on Express, not nextApi)
 */
export const createChat = async data => {
  try {
    const {data: resData} = await apiClient.post('/api/chat', {
      receiver: data.receiver,
      sender: data.sender,
    });
    if (resData.status === 'ok') {
      return resData.message;
    }
  } catch (error) {
    console.error('createChat Err:', error.message);
  }
};

/**
 * Get or create the chat room between sender and receiver
 */
export const getAllChats = async (sender, receiver) => {
  try {
    const {data} = await apiClient.get(
      `/api/chat/?senderID=${sender}&receiverID=${receiver}`,
    );
    if (data.status === 'ok') {
      return data.data;
    }
  } catch (error) {
    console.error('getAllChats Err:', error.message);
  }
};

export const getLastMsg = async (sender, receiver) => {
  try {
    const {data} = await apiClient.get(`/api/lastMsg/${sender}/${receiver}`);
    if (data.status === 'ok') {
      return data.data;
    }
  } catch (error) {
    console.error('getLastMsg Err:', error.message);
  }
};

export const deleteMessageById = async id => {
  try {
    const {data} = await apiClient.delete(`/api/message?id=${id}`);
    return data;
  } catch (error) {
    console.error('deleteMessageById Err:', error.message);
    return {status: 'error', message: error.message};
  }
};

export const deleteMessageForMe = async (messageId, userId) => {
  try {
    const {data} = await apiClient.post('/api/message/deleteForMe', {
      messageId,
      userId,
    });
    return data;
  } catch (error) {
    console.error('deleteMessageForMe Err:', error.message);
    return {status: 'error', message: error.message};
  }
};

export const deleteMessageForEveryone = async (messageId, userId) => {
  try {
    const {data} = await apiClient.post('/api/message/deleteForEveryone', {
      messageId,
      userId,
    });
    return data;
  } catch (error) {
    console.error('deleteMessageForEveryone Err:', error.message);
    return {status: 'error', message: error.message};
  }
};

export const addReaction = async (messageId, userId, emoji) => {
  try {
    const {data} = await apiClient.post('/api/message/react', {
      messageId,
      userId,
      emoji,
    });
    return data;
  } catch (error) {
    console.error('addReaction Err:', error.message);
    return {status: 'error', message: error.message};
  }
};

export const removeReaction = async (messageId, userId) => {
  try {
    const {data} = await apiClient.delete('/api/message/react', {
      data: { messageId, userId },
    });
    return data;
  } catch (error) {
    console.error('removeReaction Err:', error.message);
    return {status: 'error', message: error.message};
  }
};
