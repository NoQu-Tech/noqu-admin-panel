import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';
import logo from '../assets/logo.png';
import AdminLoginPicture from '../assets/AdminLogin.jpg';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://noqu.co.in/db/login-admin', { email, password });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('role', user.role);
      if (user.role === 'admin') {
        navigate('/');
      } else if (user.role === 'accounts') {
        navigate('/cp-requests');
      } else {
        navigate('/unauthorized');
      }
    } catch (err) {
      alert('Login failed: ' + (err.response?.data?.message || 'Server error'));
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-left">
        <img src={AdminLoginPicture} alt="Admin" />
      </div>

      <div className="admin-login-right">
        <form className="login-form" onSubmit={handleLogin}>
          {logo && <img src={logo} alt="logo" className="login-logo" />}
          <h2>Welcome Back</h2>
          <p className="login-sub">Admin Panel Access</p>

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <div className="password-input">
            <input
              type={showPass ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <span onClick={() => setShowPass(!showPass)} className="toggle-password">
              {showPass ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
