import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import zyrexLogo from '../../../assets/images/logo.png';

const Navbar: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <nav className="flex items-center justify-between p-4 bg-white shadow-md">
      <div className="flex items-center space-x-4">
        <img src={zyrexLogo} alt="Zyrex Logo" className="w-24" />
      </div>

      <div className="flex-1 flex justify-center space-x-8 font-roboto font-bold text-lg">
        <Link to="/dashboard" className="text-black hover:text-red-600">Dashboard</Link>
        <Link to="/user-management" className="text-black hover:text-red-600">User Management</Link>
        <Link to="/report" className="text-black hover:text-red-600">Report</Link>
        <Link to="/history" className="text-black hover:text-red-600">History</Link>
      </div>

      <div className="relative">
        <FaUserCircle 
          className="text-2xl text-black hover:text-red-600 cursor-pointer" 
          onClick={toggleDropdown} 
        />
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg font-roboto">
            <Link 
              to="/logout" 
              className="block px-4 py-2 text-black hover:bg-gray-300"
              onClick={() => setIsDropdownOpen(false)}
            >
              Log Out
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
