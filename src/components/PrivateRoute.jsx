import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) return null; // ou un loader
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

export default PrivateRoute; 