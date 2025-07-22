import { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // Check authentication status when component mounts
  useEffect(() => {
    const checkAuth = async () => {
      // First check localStorage for faster initial load
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      
      // Then verify with the server
      try {
        const response = await fetch('http://localhost:8000/userDetails', {
          method: 'GET',
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.status && data.user) {
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
            // Update token if returned
            if (data.token) {
              localStorage.setItem('token', data.token);
            }
          } else {
            // Clear local storage if server says not authenticated
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          }
        } 
        // If server is unreachable, keep using localStorage data
      } catch (error) {
        console.error('Error verifying authentication:', error);
        // Keep using localStorage data
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  const login = async (email, password) => {
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      
      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, message: error.message };
    }
  };
  
  const register = async (userData) => {
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      
      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, message: error.message };
    }
  };
  
  const logout = async () => {
    try {
      // Call backend logout endpoint
      await fetch('http://localhost:8000/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Always clear local storage and state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      navigate('/login');
    }
  };
  
  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isAdmin: user?.role === 'admin', 
      login, 
      register, 
      logout, 
      loading,
      error
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;