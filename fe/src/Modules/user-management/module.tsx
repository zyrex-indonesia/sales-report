import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import BaseLayout from '@components/layouts/base/index';
import UserCard from '../../components/molecules/card/index';

interface User {
  _id?: string;
  id?: string;
  username: string;
  role: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter(); // Initialize useRouter for navigation

  const fetchUsers = async () => {
    try {
      console.log("Fetching users...");
      const response = await fetch('http://localhost:5000/api/users');

      if (!response.ok) {
        console.error("Failed to fetch users. Status:", response.status);
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      console.log("Fetched user data:", data);

      if (Array.isArray(data)) {
        setUsers(data);
      } else if (data && Array.isArray(data.users)) {
        setUsers(data.users);
      } else {
        console.warn("No users found in response");
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };

  const navigateToAddUser = () => {
    router.push('/add-user'); // Navigate to the add-user page
  };

  const editUser = async (userId: string, updatedUserData: Partial<User>) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
        body: JSON.stringify(updatedUserData),
      });
      if (!response.ok) throw new Error('Failed to edit user');

      const data = await response.json();
      setUsers(prevUsers => prevUsers.map(user => (user._id === userId || user.id === userId ? data.user : user)));
      setIsEditing(null);
      setError(null);
    } catch (error) {
      console.error('Error editing user:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred while editing the user.');
    }
  };

  const toggleEditMode = (userId: string | null) => {
    setIsEditing(prev => (prev === userId ? null : userId));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <BaseLayout>
      <div className="p-6 bg-red-800 min-h-screen">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button
          onClick={navigateToAddUser} // Update button to navigate
          className="mb-4 px-4 py-2 bg-green-500 text-white font-bold rounded-lg"
        >
          Add New User
        </button>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.length > 0 ? (
            users.map(user => (
              <UserCard
                key={user._id || user.id}
                user={{
                  _id: user._id || user.id || '',
                  username: user.username,
                  role: user.role,
                }}
                onEdit={(updatedUserData) => editUser(user._id || user.id || '', updatedUserData)}
              />
            ))
          ) : (
            <p className="text-white">No users available.</p>
          )}
        </div>
      </div>
    </BaseLayout>
  );
};

export default UserManagement;
