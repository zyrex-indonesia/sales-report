import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    <div className="login-container" style={{ textAlign: 'center', marginTop: '50px' }}>
      <form onSubmit={handleSubmit} style={{ display: 'inline-block', padding: '20px', background: 'white', borderRadius: '10px' }}>
        <h2 style={{ color: '#b22222' }}>zyrex</h2>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ display: 'block', margin: '10px auto', padding: '10px', borderRadius: '5px', width: '200px' }}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ display: 'block', margin: '10px auto', padding: '10px', borderRadius: '5px', width: '200px' }}
            required
          />
        </div>
        <button
          type="submit"
          style={{
            backgroundColor: '#32CD32',
            border: 'none',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '5px',
            marginTop: '10px',
            cursor: 'pointer',
          }}
        >
          LOGIN
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
