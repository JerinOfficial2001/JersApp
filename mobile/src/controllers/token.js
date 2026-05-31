import {expressApi} from '../api';

export const webAuthentication = async data => {
  try {
    const response = await fetch(expressApi + '/api/auth/getTokenByID', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(data),
    }).then(res => res.json());
    if (response.status == 'ok') {
      return response;
    }
  } catch (error) {
    console.error('Error at web Auth:', error.message);
  }
};
