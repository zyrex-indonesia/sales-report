import React, { useState, useEffect } from 'react';
import BaseLayout from '../../components/layouts/BaseLayout';
import UserCard from '../../components/molecules/card/index';

interface User {
  _id: string;
  username: string;
  role: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  // Fetch users from the database
  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      console.log(data); // Log the fetched data
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };
  

  useEffect(() => {
    fetchUsers();
  }, []);

  // Add a new user to the database
  const addUser = async () => {
    const newUser = { username: 'New User', role: 'user' };
    
    try {
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      if (!response.ok) throw new Error('Failed to add user');
      const data = await response.json();
      setUsers((prevUsers) => [...prevUsers, data]); // Add the new user to the state
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  return (
    <BaseLayout>
      <div className="p-6 bg-red-800 min-h-screen">
        <button
          onClick={addUser}
          className="mb-4 px-4 py-2 bg-green-500 text-white font-bold rounded-lg"
        >
          Add New User
        </button>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <UserCard key={user._id} username={user.username} role={user.role} />
          ))}
        </div>
      </div>
    </BaseLayout>
  );
};

export default UserManagement;
