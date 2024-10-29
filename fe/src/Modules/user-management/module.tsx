import React, { useState, useEffect } from 'react';
import BaseLayout from '@components/layouts/base/index';
import UserCard from '../../components/molecules/card/index';

interface User {
  _id: string;
  username: string;
  role: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error("No token found in localStorage.");
        alert("Authorization token not found.");
        return;
      }
  
      console.log("Token used for request:", token);  // Log the token
  
      const response = await fetch('http://localhost:5000/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,  // Attach the token
        },
      });
  
      if (!response.ok) throw new Error('Failed to fetch users');
  
      const data = await response.json();
      setUsers(data.users);  // Update state with fetched data
    } catch (error) {
        console.error('Error fetching users:', error);
      
        if (error instanceof Error) {
          alert(error.message); // Only show message if error is of type Error
        } else {
          alert("An unknown error occurred while fetching users.");
        }
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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Attach the token
        },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) throw new Error('Failed to add user');
      
      const data = await response.json();
      setUsers((prevUsers) => [...prevUsers, data.user]); // Add the new user to the state
    } catch (error) {
      console.error('Error adding user:', error);

      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("An unknown error occurred while adding a new user.");
      }
    }
  };

  return (
    <BaseLayout>
      <div className="p-6 bg-red-800 min-h-screen">
        <button
          onClick={addUser}
          className="mb-4 px-4 py-2 bg-blue-500 text-white font-bold rounded-lg"
        >
          Create New User
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
