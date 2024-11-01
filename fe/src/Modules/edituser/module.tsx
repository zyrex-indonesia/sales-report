import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import BaseLayout from '@components/layouts/base';

const EditUserModule: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [position, setPosition] = useState('');
  const [role, setRole] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [odooBatchId, setOdooBatchId] = useState('');

  useEffect(() => {
    if (id) {
      const fetchUser = async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/users/${id}`, {
            method: 'GET',
            credentials: 'include', // Ensure cookies are sent with the request
            headers: {
              'Content-Type': 'application/json'
            }
          });
      
          if (!response.ok) {
            console.error(`Failed to fetch user data. Status: ${response.status}`);
            if (response.status === 403) {
              alert("You don't have permission to view this user.");
            }
            return;
          }
      
          const data = await response.json();
          setUsername(data.username || '');
          setFirstName(data.first_name || '');
          setLastName(data.last_name || '');
          setPosition(data.position || '');
          setRole(data.role || 'user');
          setOdooBatchId(data.odoo_batch_id || '');
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };
      fetchUser();
    }
  }, [id]);
  

  const handleSave = async () => {
    if (password && password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const updatedUserData = {
      username,
      first_name: firstName,
      last_name: lastName,
      position,
      role,
      odoo_batch_id: odooBatchId,
      ...(password && { password })
    };

    try {
      const response = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: 'PUT',
        credentials: 'include', // Ensures session cookie is sent
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUserData),
      });
  
      if (response.ok) {
        alert("User updated successfully");
        router.push('/user-management');
      } else {
        alert("Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  return (
    <BaseLayout>
      <div className="p-6 bg-red-800 min-h-screen flex items-center justify-center">
        <div className="max-w-lg w-full bg-white shadow-md rounded p-6">
          <h2 className="text-xl font-bold mb-6">Edit User</h2>
          <div className="flex flex-col gap-4">
            <label className="block">
              <span className="text-gray-700">Username:</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 p-2 border rounded w-full"
                placeholder="Username"
              />
            </label>
            <label className="block">
              <span className="text-gray-700">First Name:</span>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-1 p-2 border rounded w-full"
                placeholder="First Name"
              />
            </label>
            <label className="block">
              <span className="text-gray-700">Last Name:</span>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-1 p-2 border rounded w-full"
                placeholder="Last Name"
              />
            </label>
            <label className="block">
              <span className="text-gray-700">Position:</span>
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="mt-1 p-2 border rounded w-full"
                placeholder="Position"
              />
            </label>
            <label className="block">
              <span className="text-gray-700">Role:</span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-1 p-2 border rounded w-full"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <label className="block">
              <span className="text-gray-700">New Password (optional):</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 p-2 border rounded w-full"
                placeholder="New Password"
              />
            </label>
            <label className="block">
              <span className="text-gray-700">Confirm Password:</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 p-2 border rounded w-full"
                placeholder="Confirm Password"
              />
            </label>
            <label className="block">
              <span className="text-gray-700">Odoo Batch ID (if applicable):</span>
              <input
                type="text"
                value={odooBatchId}
                onChange={(e) => setOdooBatchId(e.target.value)}
                className="mt-1 p-2 border rounded w-full"
                placeholder="Odoo Batch ID"
              />
            </label>
            <button
              onClick={handleSave}
              className="mt-4 bg-green-500 text-white font-bold py-2 px-4 rounded"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
};

export default EditUserModule;
