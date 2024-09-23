import axios from 'axios';
import {expressApi} from '../api';
import {GET_USERDATA} from '../../utils/ayncStorage/getAndSet';

export const AddStatus = async formData => {
  try {
    const {data} = await axios.post(`${expressApi}/api/status/add`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (data.status == 'ok') {
      return data;
    } else {
      console.log(data.message, 'StatusERR');
    }
  } catch (error) {
    console.log('AddStatus Err:', error);
  }
};
export const GetAllStatus = async () => {
  const userData = await GET_USERDATA();
  try {
    const {data} = await axios.get(
      expressApi + '/api/status/get?userID=' + userData._id,
    );

    if (data.status == 'ok') {
      return data.data;
    } else {
      return [];
    }
  } catch (error) {
    console.log('GETStatus Err:', error);
  }
};
export const GetStatusByID = async id => {
  try {
    const {data} = await axios.get(`${expressApi}/api/status/get/${id}`);
    if (data.status == 'ok') {
      return data.data;
    } else {
      console.log(data.message, 'StatusERR');
    }
  } catch (error) {
    console.log('GETBYIDStatus Err:', error);
  }
};
export const DeleteStatus = async id => {
  try {
    const {data} = await axios.get(`${expressApi}/api/status/delete/${id}`);
    if (data.status == 'ok') {
      return data.data;
    } else {
      console.log(data.message, 'StatusERR');
    }
  } catch (error) {
    console.log('DELETEStatus Err:', error);
  }
};
