import React from 'react';

interface UserCardProps {
  username: string;
  role: string;
}

const UserCard: React.FC<UserCardProps> = ({ username, role }) => {
  return (
    <div className="p-4 border rounded-lg shadow-md flex flex-col items-center bg-gray-100">
      <div className="w-16 h-16 mb-4 rounded-full bg-gray-300 flex items-center justify-center">
        <span className="text-2xl">👤</span>
      </div>
      <p className="text-lg font-semibold">{username}</p>
      <p className="text-sm text-gray-500 mb-4">{role}</p>
      <button className="bg-red-500 text-white py-1 px-4 rounded">
        Edit user
      </button>
    </div>
  );
};

export default UserCard;
