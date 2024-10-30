import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaUserCircle } from 'react-icons/fa';

const Navbar: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    // Clear any session or token data from localStorage
    localStorage.removeItem('authToken'); // Remove token from localStorage
    setIsDropdownOpen(false); // Close dropdown

    // Redirect to login page
    router.push('/');
  };

  return (
    <nav className="flex items-center justify-between p-4 bg-white shadow-md">
      <div className="flex items-center space-x-4">
        <img src="/logo.png" className="w-24" alt="Logo" />
      </div>

      <div className="flex-1 flex justify-center space-x-8 font-roboto font-bold text-lg">
        <Link href="/dashboard" className="text-black hover:text-red-600">Dashboard</Link>
        <Link href="/user-management" className="text-black hover:text-red-600">User Management</Link>
        <Link href="/report" className="text-black hover:text-red-600">Report</Link>
        <Link href="/history" className="text-black hover:text-red-600">History</Link>
      </div>

      <div className="relative">
        <FaUserCircle 
          className="text-2xl text-black hover:text-red-600 cursor-pointer" 
          onClick={toggleDropdown} 
        />
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg font-roboto">
            <button 
              className="block w-full text-left px-4 py-2 text-black hover:bg-gray-300"
              onClick={handleLogout}
            >
              Log Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
