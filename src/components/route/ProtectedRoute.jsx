// ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');

  // Kiểm tra token, nếu không có thì điều hướng đến sign-in
  if (!token) {
    return <Navigate to="/sign-in" replace />;
  }

  return children; // Nếu có token, render children
};

export default ProtectedRoute;
