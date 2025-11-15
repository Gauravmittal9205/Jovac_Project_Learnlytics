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
      const token = localStorage.getItem('token');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { 
            'x-auth-token': token,
            'Content-Type': 'application/json'
          }
        });

        // Backend returns { user: { ... } }
        if (response.data && response.data.user) {
          setUser(response.data.user);
        } else {
          localStorage.removeItem('token');
          setUser(null);
        }
      } catch (err) {
        // Token invalid or expired
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email, password, role) => {
    try {
      setError('');
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
        role,
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Backend returns { message, token, user }
      const { token, user } = response.data;
      if (!token || !user) {
        throw new Error('Invalid login response from server');
      }

      localStorage.setItem('token', token);
      setUser(user);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Login failed';
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
      const response = await axios.post('http://localhost:5000/api/auth/register', userData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Backend returns { message, token, user }
      const { token, user } = response.data;
      if (!token || !user) {
        throw new Error('Invalid registration response from server');
      }

      localStorage.setItem('token', token);
      setUser(user);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Registration failed';
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
