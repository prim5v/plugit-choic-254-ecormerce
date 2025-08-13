import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage if present
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Updated login function with role included
  const login = async (email, password) => {
    try {
      const response = await axios.post('https://biz4293.pythonanywhere.com/api/login', {
        email,
        password,
      });

      if (response.data.email) {
        const userData = {
          email: response.data.email,
          name: response.data.name,
          user_id: response.data.user_id,
          role: response.data.role, // <-- role included here
          profile_photo: response.data.profile_photo || null, // optional, if backend sends it
          phone_number: response.data.phone_number || null,
          address: response.data.address || null,
          id_number: response.data.id_number || null,
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  // Signup function (unchanged)
  const signup = async (name, email, password) => {
    try {
      const response = await axios.post('https://biz4293.pythonanywhere.com/api/register', {
        name,
        email,
        password,
      });

      if (response.data.success) {
        const userData = response.data.user;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
      } else {
        throw new Error(response.data.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      throw new Error(error.response?.data?.message || 'Signup failed. Please try again.');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // New method to update user state and localStorage
  const updateUser = (updatedFields) => {
    setUser((prevUser) => {
      if (!prevUser) return prevUser; // no user to update
      const updatedUser = { ...prevUser, ...updatedFields };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const value = {
    user,
    login,
    signup,
    logout,
    updateUser,     // <-- expose updateUser here
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
