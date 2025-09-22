import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      console.log('--- Starting auth check ---');
      const token = localStorage.getItem('token');
      console.log('Auth check - Token exists:', !!token);
      
      if (!token) {
        console.log('No auth token found, user is not logged in');
        setLoading(false);
        return;
      }

      try {
        console.log('Making auth check request to server...');
        const response = await axios.get('http://localhost:5001/api/auth/me', {
          headers: { 
            'x-auth-token': token,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        });
        
        console.log('Auth check successful, user data:', response.data);
        if (response.data && response.data.data) {
          console.log('Setting user in context:', response.data.data);
          setUser(response.data.data);
        } else {
          console.warn('Unexpected response format:', response.data);
          localStorage.removeItem('token');
          setUser(null);
        }
      } catch (err) {
        console.error('Auth check failed:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          config: {
            url: err.config?.url,
            method: err.config?.method,
            headers: err.config?.headers
          }
        });
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        console.log('Auth state - loading set to false');
        setLoading(false);
        console.log('--- Auth check complete ---');
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setError('');
      console.log('Starting login for:', email);
      const response = await axios.post('http://localhost:5001/api/auth/login', {
        email,
        password
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      console.log('Login response:', response.data);

      const { token, user } = response.data.data;
      localStorage.setItem('token', token);
      setUser(user);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Register function
  const register = async (userData) => {
    try {
      setError('');
      console.log('Registering user:', userData);
      const response = await axios.post('http://localhost:5001/api/auth/register', userData);
      
      const { token, user } = response.data.data;
      localStorage.setItem('token', token);
      setUser(user);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        register,
        isAuthenticated: !!user,
        setUser
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
