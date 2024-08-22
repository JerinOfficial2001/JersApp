import {
  GET_FROM_STORAGE,
  POST_TO_STORAGE,
} from '../../../utils/ayncStorage/getAndSet';

export const getGroupedMessages = async groupedMessages => {
  const sections = groupedMessages
    ? Object.keys(groupedMessages).map(date => ({
        title: date,
        data: groupedMessages[date],
      }))
    : [];
  if (sections.length > 0) {
    await POST_TO_STORAGE('JersApp_Grouped_Messages', sections);
    const data = await GET_FROM_STORAGE('JersApp_Grouped_Messages');
    if (data) {
      return data;
    } else {
      return [];
    }
  } else {
    const data = await GET_FROM_STORAGE('JersApp_Grouped_Messages');
    if (data) {
      return data;
    } else {
      return [];
    }
  }
};
