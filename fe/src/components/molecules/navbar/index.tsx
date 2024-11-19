import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaUserCircle } from 'react-icons/fa';

const Navbar: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  // Fetch the role from localStorage
  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    setRole(storedRole); // Set role to state for rendering
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = async () => {
    try {
      // Call backend to clear the session
      const response = await fetch('http://localhost:5000/logout', {
        method: 'POST',
        credentials: 'include', // Include session cookie
      });

      if (!response.ok) {
        console.error('Logout failed:', response.statusText);
      }

      // Clear localStorage and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('role'); // Clear role as well
      setIsDropdownOpen(false); // Close dropdown
      router.push('/'); // Redirect to login
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Determine if the current route matches the link
  const getLinkClass = (path: string) => {
    return router.pathname === path ? 'text-[#a40000]' : 'text-black';
  };

  return (
    <nav className="flex items-center justify-between p-4 bg-white shadow-md">
      <div className="flex items-center space-x-4">
        <img src="/logo.png" className="w-24" alt="Logo" />
      </div>

      <div className="flex-1 flex justify-center space-x-8 font-roboto font-bold text-lg">
        {/* Conditionally render links based on role */}
        {role === 'admin' && (
          <>
            <Link href="/dashboard" className={`${getLinkClass('/dashboard')} hover:text-red-600`}>
              Dashboard
            </Link>
            <Link href="/user-management" className={`${getLinkClass('/user-management')} hover:text-red-600`}>
              User Management
            </Link>
          </>
        )}
        <Link href="/report" className={`${getLinkClass('/report')} hover:text-red-600`}>
          Report
        </Link>
        <Link href="/history" className={`${getLinkClass('/history')} hover:text-red-600`}>
          History
        </Link>
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
