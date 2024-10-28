import React from 'react';
import { Link } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import zyrexLogo from '../../../assets/images/logo.png';

const Navbar: React.FC = () => {
  return (
    <nav className="flex items-center justify-between p-4 bg-white shadow-md">
      <div className="flex items-center space-x-4">
        <img src={zyrexLogo} alt="Zyrex Logo" className="w-24" />
        <Link to="/dashboard" className="text-black hover:text-red-600">Dashboard</Link>
        <Link to="/user-management" className="text-black hover:text-red-600">User Management</Link>
        <Link to="/report" className="text-black hover:text-red-600">Report</Link>
        <Link to="/history" className="text-black hover:text-red-600">History</Link>
      </div>
      <div>
        <FaUserCircle className="text-2xl text-black hover:text-red-600 cursor-pointer" />
      </div>
    </nav>
  );
};

export default Navbar;
