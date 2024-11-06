// src/components/layout/AuthLayout.js
import React from 'react';

const AuthLayout = ({ children }) => {
  return (
    <div>
      {/* Không có menu và navbar ở đây */}
      {children}
    </div>
  );
};

export default AuthLayout;
