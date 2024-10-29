import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import zyrexLogo from '../../assets/images/logo.png';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Response data:", data); // Add this line for debugging

      if (data.success) {
        localStorage.setItem('authToken', data.token);
        console.log("Login successful, token stored in localStorage.");
        navigate('/dashboard');
      } else {
        alert('Login failed: ' + data.message);
      }
    } catch (error) {
      console.error("Fetch error: ", error);
      alert('Failed to connect to the server. Please try again later.');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-red-800">
      <form onSubmit={handleSubmit} className="bg-white p-10 rounded-lg shadow-lg text-center">
        <img src={zyrexLogo} alt="Zyrex Logo" className="mb-8 mx-auto w-32" />
        <div className="mb-4 text-left">
          <label className="block text-gray-700 font-bold mb-2">Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>
        <div className="mb-6 text-left">
          <label className="block text-gray-700 font-bold mb-2">Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-green-500 text-white py-2 rounded-lg font-bold hover:bg-green-600"
        >
          LOGIN
        </button>
      </form>
    </div>
  );
};

export default LoginPage;