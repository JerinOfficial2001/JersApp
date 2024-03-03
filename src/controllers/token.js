import {api} from '../api';

export const webAuthentication = async data => {
  try {
    const response = await fetch(api + '/api/auth/getTokenByID', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(data),
    }).then(res => res.json());
    console.log(response);
    if (response.status == 'ok') {
      return response;
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
};
