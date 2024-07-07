import axios from 'axios';
import {expressApi} from '../api';

export const getGroupMsg = async ({token, id, groupID}) => {
  try {
    const {data} = await axios.get(
      `${expressApi}/api/groupMsg?userID=${id}&groupID=${groupID}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (data) {
      return data.data;
    } else {
      console.log(data.message, 'getGroupMsgERR');
    }
  } catch (error) {
    console.log('getGroupMsgERR', error);
  }
};
