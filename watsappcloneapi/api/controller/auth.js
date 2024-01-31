export const login = async (mobNum, password) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Access-Control-Allow-Origin': true,
      },
      body: JSON.stringify({mobNum, password}),
    });

    const data = await response.json();

    // Uncomment and modify the following based on your data structure
    if (data.status === 'ok') {
      const {token} = data.data;

      const userDataResponse = await fetch('/api/auth/login', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const userData = await userDataResponse.json();

      if (userData.status === 'ok') {
        // Store user data in AsyncStorage
        localStorage.setItem('userData', JSON.stringify(userData.data.user));

        // Check if 'userData' key exists before navigating
        const storedUserData = JSON.parse(localStorage.getItem('userData'));
        if (storedUserData) {
          // 'userData' key exists, navigate to 'Home'
          window.location.href = '/homepg';
        } else {
          // 'userData' key does not exist, handle accordingly
          console.error('Error: userData key not found in AsyncStorage');
        }
      } else {
        console.error('Error:', userData.data);
      }
    } else if (data.status == 'error' && data.message == 'User not found') {
      props.navigation.navigate('Register', {
        mobNum: mobNum,
        password: password,
      });
    } else {
      console.error('Error:', data.data);
    }
  } catch (error) {
    console.error('Error:', error.message);
    // Handle the error appropriately (e.g., show an error message to the user)
  }
};
export const register = async (data, props) => {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Access-Control-Allow-Origin': true,
      },
      body: JSON.stringify({
        mobNum: data.mobNum,
        password: data.password,
        name: data.name,
      }),
    }).then(res => res.json());
    console.log(response);
    if (response.status == 'ok') {
      login(data.mobNum, data.password, props);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
};
export const getAllUsers = async userID => {
  try {
    try {
      const response = await fetch('/api/auth/getUsers', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'Access-Control-Allow-Origin': true,
        },
      }).then(res => res.json());
      if (response.status == 'ok') {
        const particularUsers = response.data.filter(
          user => user._id !== userID,
        );
        if (particularUsers) {
          return particularUsers;
        }
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
};
