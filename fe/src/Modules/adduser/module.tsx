import React, { useState } from 'react';
import { useRouter } from 'next/router';
import BaseLayout from '@components/layouts/base';

const AddUserModule: React.FC = () => {
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user');
  const [position, setPosition] = useState('');
  const [odooBatchId, setOdooBatchId] = useState('');
  const router = useRouter();

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if password and confirmPassword match
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          username,
          firstName,
          lastName,
          password,
          role,
          position,
          odooBatchId,
        }),
      });

      if (response.ok) {
        alert('User added successfully!');
        // Clear fields after successful save
        setUsername('');
        setFirstName('');
        setLastName('');
        setPassword('');
        setConfirmPassword('');
        setRole('user');
        setPosition('');
        setOdooBatchId('');
      } else {
        alert('Failed to add user.');
      }
    } catch (error) {
      console.error('Error adding user:', error);
      alert('An error occurred while adding the user.');
    }
  };

  return (
    <BaseLayout>
      <div className="p-6 bg-red-800 min-h-screen flex justify-center items-center">
        <div className="w-full max-w-lg bg-gray-100 p-6 rounded-lg shadow-md">
          <button
            onClick={() => router.push('/user-management')}
            className="bg-green-500 text-white font-bold py-2 px-4 rounded mb-4"
          >
            Back to User Management
          </button>
          <form onSubmit={handleAddUser}>
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-6xl text-gray-500">👤</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label>Username:</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded mb-4"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required // Username is required
                />
              </div>
              <div>
                <label>Position:</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded mb-4"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                />
              </div>
              <div>
                <label>First name:</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded mb-4"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div>
                <label>Last name:</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded mb-4"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <div>
                <label>Password:</label>
                <input
                  type="password"
                  className="w-full p-2 border rounded mb-4"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required // Password is required
                />
              </div>
              <div>
                <label>Confirm Password:</label>
                <input
                  type="password"
                  className="w-full p-2 border rounded mb-4"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required // Confirm password is required for validation
                />
              </div>
              <div>
                <label>Role:</label>
                <select
                  className="w-full p-2 border rounded mb-4"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required // Role is required
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label>Odoo Batch ID (if applicable):</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded mb-4"
                  value={odooBatchId}
                  onChange={(e) => setOdooBatchId(e.target.value)}
                />
              </div>
            </div>
            <button type="submit" className="w-full bg-red-600 text-white py-2 rounded font-bold">
              Save
            </button>
          </form>
        </div>
      </div>
    </BaseLayout>
  );
};

export default AddUserModule;
