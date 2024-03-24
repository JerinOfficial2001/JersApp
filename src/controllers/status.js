import axios from 'axios';
import {expressApi} from '../api';

export const AddStatus = async formData => {
  try {
    const response = await fetch(`${expressApi}/api/status/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    }).then(res => res.json());
    if (response.status == 'ok') {
      return response;
    } else {
      console.log(response.message, 'StatusERR');
    }
  } catch (error) {
    console.log('AddStatus Err:', error);
  }
};
export const GetAllStatus = async () => {
  try {
    const {data} = await axios.get(expressApi + '/api/status/get');
    if (data.status == 'ok') {
      return data.data;
    } else {
      console.log(data.message, 'StatusERR');
    }
  } catch (error) {
    console.log('AddStatus Err:', error);
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
    console.log('AddStatus Err:', error);
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
    console.log('AddStatus Err:', error);
  }
};
