export const login = async (mobNum, password) => {
  fetch('/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({mobNum, password}),
  })
    .then(response => response.json())
    .then(data => {
      if (data.status === 'ok') {
        const {token} = data.data;

        // Step 2: Use the obtained token to make a GET request to retrieve user data
        fetch('/api/getUserData', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then(response => response.json())
          .then(userData => {
            if (userData.status === 'ok') {
              console.log('User Data:', userData.data.user);
            } else {
              console.error('Error:', userData.data);
            }
          })
          .catch(error => console.error('Error:', error));
      } else {
        console.error('Error:', data.data);
      }
    })
    .catch(error => console.error('Error:', error));
};
