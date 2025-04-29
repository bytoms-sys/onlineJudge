// src/Components/Auth/ProtectedRoute.jsx
import { useAuth } from './auth';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const { user } = useAuth(); // Get auth state

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;