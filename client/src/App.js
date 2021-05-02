import { useEffect, useState } from 'react';
import axios from 'axios'
import './App.css';

function App() {
  const [usernameReg, setUsernameReg] = useState('')
  const [passwordReg, setpasswordReg] = useState('')
  const [username, setUsername] = useState('')
  const [password, setpassword] = useState('')
  const [loginStatus, setLoginStatus] = useState(false)
  axios.defaults.withCredentials = true
  const register = () => {
    axios.post('http://localhost:3001/register', {
      username: usernameReg,
      password: passwordReg
    })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      })
  }
  const login = () => {
    axios.post('http://localhost:3001/login', {
      username,
      password
    })
      .then((res) => {
        // console.log(res.data);
        if (!res.data.auth) {
          setLoginStatus(false)
        } else {
          // console.log(res.data);
          localStorage.setItem('token', res.data.token)
          setLoginStatus(true)
        }
      })
      .catch((err) => {
        console.log(err);
      })
  }
  const userAuthenticated = () => {
    axios.get('http://localhost:3001/isUserAuth', {
      headers: {
        'x-access-token': localStorage.getItem('token')
      }
    })
      .then((res) => {
        console.log(res);
      })
  }
  useEffect(() => {
    axios.get('http://localhost:3001/login')
      .then((res) => {
        if (res.data.loggedIn == true) {
          console.log(res);
          setLoginStatus(res.data.user[0].username)
        }
      })
  }, [])
  return (
    <div className="App">
      <div>
        <h1>Registration</h1>
        <label htmlFor="account">Account</label>
        <input type="text" id='account' onChange={(e) => { setUsernameReg(e.target.value) }} />
        <label htmlFor="password">Password</label>
        <input type="text" id='password' onChange={(e) => { setpasswordReg(e.target.value) }} />
        <button onClick={register}>register</button>
      </div>
      <div>
        <h1>Login</h1>
        <label htmlFor="account">Account</label>
        <input type="text" id='account' onChange={(e) => { setUsername(e.target.value) }} />
        <label htmlFor="password">Password</label>
        <input type="text" id='password' onChange={(e) => { setpassword(e.target.value) }} />
        <button onClick={login}>login</button>
      </div>
      <h1>{loginStatus && (
        <button onClick={userAuthenticated}>Check</button>
      )}</h1>
    </div>
  );
}

export default App;
