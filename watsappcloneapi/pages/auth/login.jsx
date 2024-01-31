import {login} from '@/api/controller/auth';
import React from 'react';
import {useState} from 'react';

export default function Login() {
  const [formData, setformData] = useState({
    mobNum: '',
    password: '',
  });
  const handleOnchange = event => {
    const {value, name} = event.target;
    setformData({
      ...formData,
      [name]: value,
    });
  };
  const [ErrMsg, setErrMsg] = useState({
    state: false,
    msg: '',
  });
  const handleSubmit = e => {
    e.preventDefault();
    if (formData.password !== '' && formData.password !== '') {
      login(formData.mobNum, formData.password).then(data => {
        if (data?.status === 'error') {
          setErrMsg({
            state: true,
            msg: data.message,
          });
        }
      });
    }
  };
  return (
    <div
      style={{
        height: '100vh',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        gap: 3,
      }}>
      <form
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          gap: 3,
        }}
        action=""
        onSubmit={handleSubmit}>
        <label htmlFor="mobNum"> Phone Number</label>
        <input
          style={{padding: 10}}
          type="number"
          name="mobNum"
          value={formData.mobNum}
          onChange={handleOnchange}
        />
        <label htmlFor="password">Password</label>
        <input
          style={{padding: 10}}
          type="password"
          name="password"
          value={formData.password}
          onChange={handleOnchange}
        />
        {ErrMsg.state && (
          <p style={{color: 'red', fontWeight: 'bold'}}>{ErrMsg?.msg}</p>
        )}
        <button style={{padding: 10}} type="submit">
          Login
        </button>
      </form>
    </div>
  );
}
