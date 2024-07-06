import axios from 'axios';
import {expressApi} from '../api';

export const GetGroups = async ({token, id}) => {
  try {
    const {data} = await axios.get(
      `${expressApi}/api/group/getGroups?userID=${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (data.status == 'ok') {
      return data.data;
    } else {
      console.log(data.message, 'GetGroupsERR');
    }
  } catch (error) {
    console.log('GetGroupsERR Err:', error);
  }
};
export const GetGroupByID = async ({token, id, groupID}) => {
  try {
    const {data} = await axios.get(
      `${expressApi}/api/group/getgroupbyid/${groupID}?userID=${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (data.status == 'ok') {
      return data.data;
    } else {
      console.log(data.message, 'GetGroupsERR');
    }
  } catch (error) {
    console.log('GetGroupsERR Err:', error);
  }
};
export const CreateNewGroup = async ({token, id, formData}) => {
  try {
    const {data} = await axios.post(
      `${expressApi}/api/group/creategroup?userID=${id}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    if (data) {
      return data;
    } else {
      console.log('CreateGroupERR');
    }
  } catch (error) {
    console.log('CreateGroup Err:', error);
  }
};
