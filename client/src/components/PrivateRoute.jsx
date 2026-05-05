// Protects routes based on authentication and role
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ children, roleRequired }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roleRequired && user.role !== roleRequired) {
    // Redirect to the correct dashboard instead of / to avoid infinite loops
    if (user.role === 'admin') return <Navigate to="/admin" />;
    return <Navigate to="/" />;
  }

  return children;
};

export default PrivateRoute;
