import React, { useState } from 'react';

interface LoginModuleProps {
  onLoginSuccess: (token: string) => void;
}

const LoginModule: React.FC<LoginModuleProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null); // Reset error state on new attempt

    if (!username || !password) {
      setError("Both username and password are required.");
      setIsLoading(false);
      return;
    }

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
      console.log("Response data:", data);

      if (data.success) {
        console.log("Login successful.");
        onLoginSuccess(data.token);
      } else {
        setError(data.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error("Fetch error: ", error);
      setError('Failed to connect to the server. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-red-800">
      <form onSubmit={handleSubmit} className="bg-white p-10 rounded-lg shadow-lg text-center max-w-sm w-full">
        <img src="/logo.png" className="mb-8 mx-auto w-32" />

        {error && (
          <div className="mb-4 text-red-500 text-sm">
            {error}
          </div>
        )}

        <div className="mb-4 text-left">
          <label htmlFor="username" className="block text-gray-700 font-bold mb-2">Username:</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={({ target }) => setUsername(target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            required
            aria-label="Username"
          />
        </div>

        <div className="mb-6 text-left">
          <label htmlFor="password" className="block text-gray-700 font-bold mb-2">Password:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            required
            aria-label="Password"
          />
        </div>

        <button
          type="submit"
          className={`w-full bg-green-500 text-white py-2 rounded-lg font-bold ${isLoading ? 'cursor-not-allowed opacity-50' : 'hover:bg-green-600'}`}
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'LOGIN'}
        </button>
      </form>
    </div>
  );
};

export default LoginModule;
