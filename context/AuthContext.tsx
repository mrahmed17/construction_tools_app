import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type User = {
  id: string;
  phone: string;
  name: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<boolean>;
  signup: (phone: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check for stored user data
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUser();
  }, []);
  
  const login = async (phone: string, password: string): Promise<boolean> => {
    // In a real app, this would call an API
    try {
      // Mock successful login
      if (phone && password) {
        const newUser = {
          id: '1',
          phone,
          name: 'স্টোর মালিক',
        };
        
        await AsyncStorage.setItem('user', JSON.stringify(newUser));
        setUser(newUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };
  
  const signup = async (phone: string, password: string, name: string): Promise<boolean> => {
    // In a real app, this would call an API
    try {
      if (phone && password && name) {
        const newUser = {
          id: '1',
          phone,
          name,
        };
        
        await AsyncStorage.setItem('user', JSON.stringify(newUser));
        setUser(newUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };
  
  const logout = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};