import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import zyrexLogo from '../../../assets/images/logo.png';
import './global.css'

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Call the backend to authenticate the user
    const response = await fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (data.success) {
      // Store the token in localStorage (or wherever you want)
      localStorage.setItem('authToken', data.token);

      // Redirect to the dashboard
      navigate('/dashboard');
    } else {
      alert('Login failed: ' + data.message);
    }
  };

  return (
      <div className="login-container">
        <form onSubmit={handleSubmit} className="login-form">
          <img src={zyrexLogo} alt="Zyrex Logo" className="login-logo" />
          <div>
            <label className="login-label">Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="login-input"
              required
            />
          </div>
          <div>
            <label className="login-label">Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              required
            />
          </div>
          <button type="submit" className="login-button">LOGIN</button>
        </form>
      </div>
    );
};

export default LoginPage;