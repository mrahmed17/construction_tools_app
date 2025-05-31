import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the shape of our auth state
type User = {
  phoneNumber: string;
  displayName?: string;
  isAuthenticated: boolean;
  uid?: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (phoneNumber: string, password: string) => Promise<void>;
  signup: (phoneNumber: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
};

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
});

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Authentication provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check for stored user on app start
  useEffect(() => {
    const checkUserAuth = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error retrieving stored user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserAuth();
  }, []);

  // Traditional login with phone & password - simple mock implementation
  const login = async (phoneNumber: string, password: string) => {
    try {
      setIsLoading(true);
      
      // In a real app, you would validate with a backend
      // For demo purposes, we'll use a hardcoded credential
      if (phoneNumber === '01700000000' && password === 'password') {
        const userData: User = {
          phoneNumber,
          displayName: 'Demo User',
          isAuthenticated: true,
          uid: '12345'
        };
        
        setUser(userData);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up with phone & password - simple mock implementation
  const signup = async (phoneNumber: string, password: string, displayName: string) => {
    try {
      setIsLoading(true);
      
      // In a real app, you would create an account in your backend
      // For demo purposes, we'll simulate a successful signup
      const userData: User = {
        phoneNumber,
        displayName,
        isAuthenticated: true,
        uid: Date.now().toString()
      };
      
      setUser(userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};