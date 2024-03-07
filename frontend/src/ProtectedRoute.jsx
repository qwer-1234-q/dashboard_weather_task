import { Navigate } from 'react-router-dom';
import React from 'react';

const ProtectedRoute = (Component) => {
  const token = localStorage.getItem('token');
  return token ? <Component.Component /> : <Navigate to="/login"/>
}
export default ProtectedRoute;
