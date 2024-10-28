import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './pages/login/LoginPage';
import Dashboard from './pages/dashboard/dashboard';
import UserManagement from './pages/user-management/user-management';
import History from './pages/history/history';
import Report from './pages/report/report';
import BaseLayout from './components/layouts/BaseLayout';  // Adjusted path to BaseLayout
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

      {/* Wrap authenticated routes with BaseLayout */}
      <Route
        path="/dashboard"
        element={
          isAuthenticated() ? (        
              <Dashboard />         
          ) : (
            <Navigate to="/" />
          )
        }
      />
      <Route
        path="/user-management"
        element={
          isAuthenticated() ? (         
              <UserManagement />          
          ) : (
            <Navigate to="/" />
          )
        }
      />
      <Route
        path="/history"
        element={
          isAuthenticated() ? (       
              <History />         
          ) : (
            <Navigate to="/" />
          )
        }
      />
      <Route
        path="/report"
        element={
          isAuthenticated() ? (        
              <Report />       
          ) : (
            <Navigate to="/" />
          )
        }
      />
    </Routes>
  </Router>,
  document.getElementById('root')
);
