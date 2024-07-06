import axios from 'axios';
import {expressApi} from '../api';

export const GetMembers = async ({token, groupID, id}) => {
  try {
    const {data} = await axios.get(
      `${expressApi}/api/member/getMembers?userID=${id}&groupID=${groupID}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (data.status == 'ok') {
      return data.data;
    } else {
      console.log(data.message, 'GetMembersERR');
    }
  } catch (error) {
    console.log('GetMembers Err:', error);
  }
};
