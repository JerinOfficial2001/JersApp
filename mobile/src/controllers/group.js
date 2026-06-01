import {ToastAndroid} from 'react-native';
import apiClient from '../services/apiClient';

export const GetGroups = async ({id}) => {
  try {
    const {data} = await apiClient.get(`/api/group/getGroups?userID=${id}`);
    if (data.status == 'ok') {
      return data.data;
    } else {
      ToastAndroid.show(data.message, ToastAndroid.SHORT);
      console.log(data.message, 'GetGroupsERR');
    }
  } catch (error) {
    console.log('GetGroupsERR Err:', error.message);
  }
};

export const GetGroupByID = async ({id, groupID}) => {
  try {
    const {data} = await apiClient.get(
      `/api/group/getgroupbyid/${groupID}?userID=${id}`
    );
    if (data.status == 'ok') {
      return data.data;
    } else {
      console.log(data.message, 'GetGroupByID ERR');
    }
  } catch (error) {
    console.log('GetGroupByID Err:', error.message);
  }
};

export const CreateNewGroup = async ({id, formData}) => {
  try {
    const {data} = await apiClient.post(
      `/api/group/creategroup?userID=${id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    if (data) {
      return data;
    } else {
      console.log('CreateGroupERR');
    }
  } catch (error) {
    console.log('CreateGroup Err:', error.message);
  }
};

export const UpdateGroup = async ({id, formData, groupID}) => {
  try {
    const {data} = await apiClient.put(
      `/api/group/updategroup/${groupID}?userID=${id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    if (data) {
      return data;
    } else {
      console.log('UpdateGroupERR');
    }
  } catch (error) {
    console.log('UpdateGroup Err:', error.message);
  }
};
