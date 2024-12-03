import React, { useState } from 'react';

interface LoginModuleProps {
  onLoginSuccess: () => void; // Callback to redirect or update parent state
}

const LoginModule: React.FC<LoginModuleProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('${process.env.NEXT_PUBLIC_API_URL}/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorText = `Login failed with status: ${response.status}`;
        console.error(errorText);
        setError(errorText);
        return;
      }

      const data = await response.json();
      if (data.role) {
        console.log('Role received:', data.role);
        localStorage.setItem('role', data.role); // Save role to localStorage
        onLoginSuccess();
      } else {
        setError('Role is undefined in login response.');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setError('Error connecting to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-red-800">
      <form onSubmit={handleSubmit} className="bg-white p-10 rounded-lg shadow-lg text-center max-w-sm w-full">
        <img src="/logo.png" className="mb-8 mx-auto w-32" alt="Logo" />

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

        <div className="mb-6 text-left relative">
          <label htmlFor="password" className="block text-gray-700 font-bold mb-2">Password:</label>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'} // Toggle between 'text' and 'password'
            value={password}
            onChange={({ target }) => setPassword(target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            required
            aria-label="Password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-11 text-sm text-gray-500"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
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
