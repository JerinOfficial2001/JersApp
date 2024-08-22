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
export const RemoveMembers = async ({token, groupID, id, memberID}) => {
  try {
    const {data} = await axios.delete(
      `${expressApi}/api/member/removeMember/${memberID}?userID=${id}&groupID=${groupID}`,

      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (data) {
      return data;
    } else {
      console.log(data.message, 'RemoveMembersERR');
    }
  } catch (error) {
    console.log('RemoveMembers Err:', error);
  }
};
export const AddMemberToGroup = async ({token, groupID, id, formData}) => {
  try {
    const {data} = await axios.post(
      `${expressApi}/api/member/createmember?userID=${id}&groupID=${groupID}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    console.log(data, 'groupCreation');
    if (data) {
      return data;
    } else {
      console.log(data.message, 'UpdateRoleERR');
    }
  } catch (error) {
    console.log('UpdateRole Err:', error);
  }
};
export const UpdateRole = async ({token, groupID, id, formData, memberID}) => {
  try {
    const {data} = await axios.put(
      `${expressApi}/api/member/updateMember/${memberID}?userID=${id}&groupID=${groupID}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (data) {
      return data;
    } else {
      console.log(data.message, 'UpdateRoleERR');
    }
  } catch (error) {
    console.log('UpdateRole Err:', error);
  }
};
