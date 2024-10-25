import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './pages/login/LoginPage';
import Dashboard from './pages/dashboard/dashboard';
import './global.css';  // Import global CSS here

const isAuthenticated = () => {
  // Add your logic here to check if the user is authenticated (for example, checking if a token exists)
  return localStorage.getItem('authToken') ? true : false;
};

ReactDOM.render(
  <Router>
    <Routes>
      {/* Default route goes to LoginPage */}
      <Route path="/" element={<LoginPage />} />

      {/* If authenticated, allow access to Dashboard, else redirect to login */}
      <Route
        path="/dashboard"
        element={
          isAuthenticated() ? <Dashboard /> : <Navigate to="/" />
        }
      />
    </Routes>
  </Router>,
  document.getElementById('root')
);
