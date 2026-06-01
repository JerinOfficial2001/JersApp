import apiClient from '../services/apiClient';

export const GetMembers = async ({groupID, id}) => {
  try {
    const {data} = await apiClient.get(
      `/api/member/getMembers?userID=${id}&groupID=${groupID}`
    );
    if (data.status == 'ok') {
      return data.data;
    } else {
      console.log(data.message, 'GetMembersERR');
    }
  } catch (error) {
    console.log('GetMembers Err:', error.message);
  }
};

export const RemoveMembers = async ({groupID, id, memberID}) => {
  try {
    const {data} = await apiClient.delete(
      `/api/member/removeMember/${memberID}?userID=${id}&groupID=${groupID}`
    );
    if (data) {
      return data;
    } else {
      console.log(data.message, 'RemoveMembersERR');
    }
  } catch (error) {
    console.log('RemoveMembers Err:', error.message);
  }
};

export const AddMemberToGroup = async ({groupID, id, formData}) => {
  try {
    const {data} = await apiClient.post(
      `/api/member/createmember?userID=${id}&groupID=${groupID}`,
      formData
    );
    if (data) {
      return data;
    } else {
      console.log(data.message, 'AddMemberERR');
    }
  } catch (error) {
    console.log('AddMember Err:', error.message);
  }
};

export const UpdateRole = async ({groupID, id, formData, memberID}) => {
  try {
    const {data} = await apiClient.put(
      `/api/member/updateMember/${memberID}?userID=${id}&groupID=${groupID}`,
      formData
    );
    if (data) {
      return data;
    } else {
      console.log(data.message, 'UpdateRoleERR');
    }
  } catch (error) {
    console.log('UpdateRole Err:', error.message);
  }
};
