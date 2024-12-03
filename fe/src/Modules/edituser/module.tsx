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
          const response = await fetch(`http://api.sales.zyrex.com/api/users/${id}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) return;
          const data = await response.json();
          setUsername(data.username || '');
          setFirstName(data.first_name || '');
          setLastName(data.last_name || '');
          setPosition(data.position || '');
          setRole(data.role || 'user');
          setOdooBatchId(data.odoo_batch_id || '');
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };
      fetchUser();
    }
  }, [id]);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const updatedUserData = {
      username,
      first_name: firstName,
      last_name: lastName,
      position,
      role,
      password,
      confirmPassword,
    };

    try {
      const response = await fetch(`http://api.sales.zyrex.com/api/users/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUserData),
      });

      if (response.ok) {
        alert('User updated successfully');
        router.push('/user-management');
      } else {
        alert('Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  return (
    <BaseLayout>
      <div className="p-4 pt-20 bg-red-800 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md bg-white shadow-md rounded p-6">
          {/* Back Button */}
          <button
            onClick={() => router.push('/user-management')}
            className="bg-green-500 text-white font-bold py-2 px-4 rounded mb-6 w-full font-roboto"
          >
            Back to User Management
          </button>
          {/* Form */}
          <h2 className="text-xl font-bold mb-4 text-center">Edit User</h2>
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <label className="block">
              <span className="text-gray-700 font-roboto">Username:</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 p-2 border rounded w-full"
                placeholder="Username"
              />
            </label>
            <label className="block">
              <span className="text-gray-700 font-roboto">First Name:</span>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-1 p-2 border rounded w-full"
                placeholder="First Name"
              />
            </label>
            <label className="block">
              <span className="text-gray-700 font-roboto">Last Name:</span>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-1 p-2 border rounded w-full font-roboto"
                placeholder="Last Name"
              />
            </label>
            <label className="block">
              <span className="text-gray-700 font-roboto">Position:</span>
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="mt-1 p-2 border rounded w-full font-roboto"
                placeholder="Position"
              />
            </label>
            <label className="block">
              <span className="text-gray-700 font-roboto">Role:</span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-1 p-2 border rounded w-full font-roboto"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <label className="block">
              <span className="text-gray-700 font-roboto">New Password (optional):</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 p-2 border rounded w-full font-roboto"
                placeholder="New Password"
              />
            </label>
            <label className="block">
              <span className="text-gray-700 font-roboto">Confirm Password:</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 p-2 border rounded w-full font-roboto"
                placeholder="Confirm Password"
              />
            </label>
            <label className="block">
              <span className="text-gray-700 font-roboto">Odoo Batch ID (if applicable):</span>
              <input
                type="text"
                value={odooBatchId}
                onChange={(e) => setOdooBatchId(e.target.value)}
                className="mt-1 p-2 border rounded w-full font-roboto"
                placeholder="Odoo Batch ID"
              />
            </label>
            <button
              type="submit"
              className="mt-4 bg-green-500 text-white font-bold py-2 px-4 rounded font-roboto"
            >
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </BaseLayout>
  );
};

export default EditUserModule;
