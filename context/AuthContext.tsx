import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (mobile: string, password: string) => Promise<boolean>;
  signup: (mobile: string, name: string, password: string) => Promise<boolean>;
  logout: () => void;
  uploadProfilePhoto: (uri: string) => Promise<string>;
  updateUserInfo: (userData: Partial<User>) => Promise<boolean>;
  checkOfflineData: () => Promise<boolean>;
  syncOfflineData: () => Promise<boolean>;
}

const defaultAuthContext: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  signup: async () => false,
  logout: () => {},
  uploadProfilePhoto: async () => '',
  updateUserInfo: async () => false,
  checkOfflineData: async () => false,
  syncOfflineData: async () => false,
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored user on app startup
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const userString = await AsyncStorage.getItem('@auth_user');
        if (userString) {
          const userData = JSON.parse(userString);
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error checking login state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Login function
  const login = async (mobile: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // First check if we have any users stored locally
      const userString = await AsyncStorage.getItem('@auth_users');
      const users = userString ? JSON.parse(userString) : [];
      
      const foundUser = users.find(
        (u: User) => u.mobile === mobile && u.password === password
      );
      
      if (foundUser) {
        await AsyncStorage.setItem('@auth_user', JSON.stringify(foundUser));
        setUser(foundUser);
        setIsAuthenticated(true);
        return true;
      }
      
      // If we didn't find a user, we could try to authenticate with an online API here
      // For now, we'll simulate an API call with a default owner account if no users exist
      if (users.length === 0 && mobile === '01700000000' && password === 'admin') {
        const defaultOwner: User = {
          id: '1',
          mobile: '01700000000',
          name: 'Owner',
          password: 'admin',
          isOwner: true
        };
        
        await AsyncStorage.setItem('@auth_users', JSON.stringify([defaultOwner]));
        await AsyncStorage.setItem('@auth_user', JSON.stringify(defaultOwner));
        setUser(defaultOwner);
        setIsAuthenticated(true);
        return true;
      }
      
      Alert.alert('Login Failed', 'Invalid mobile number or password');
      return false;
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Error', 'An unexpected error occurred. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function
  const signup = async (mobile: string, name: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Check if user already exists
      const userString = await AsyncStorage.getItem('@auth_users');
      const users = userString ? JSON.parse(userString) : [];
      
      if (users.some((u: User) => u.mobile === mobile)) {
        Alert.alert('Signup Failed', 'A user with this mobile number already exists');
        return false;
      }
      
      // If this is the first user, make them the owner
      const isOwner = users.length === 0;
      
      const newUser: User = {
        id: Date.now().toString(),
        mobile,
        name,
        password,
        isOwner
      };
      
      const updatedUsers = [...users, newUser];
      await AsyncStorage.setItem('@auth_users', JSON.stringify(updatedUsers));
      
      // Log in the new user
      await AsyncStorage.setItem('@auth_user', JSON.stringify(newUser));
      setUser(newUser);
      setIsAuthenticated(true);
      
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Signup Error', 'An unexpected error occurred. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('@auth_user');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Logout Error', 'An unexpected error occurred. Please try again.');
    }
  };

  // Upload profile photo
  const uploadProfilePhoto = async (uri: string): Promise<string> => {
    try {
      // In a real app, we would upload to a storage service
      // For now, we'll store the URI in AsyncStorage
      if (!user) return '';
      
      // Simulate online storage by storing the URI locally
      // In a production app, you would use Firebase Storage or similar
      const photoKey = `@user_photo_${user.id}`;
      await AsyncStorage.setItem(photoKey, uri);
      
      // Update user with photo URL
      const updatedUser = { ...user, photoUrl: uri };
      await AsyncStorage.setItem('@auth_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return uri;
    } catch (error) {
      console.error('Photo upload error:', error);
      Alert.alert('Photo Upload Error', 'Failed to upload photo. Please try again.');
      return '';
    }
  };

  // Update user information
  const updateUserInfo = async (userData: Partial<User>): Promise<boolean> => {
    try {
      if (!user) return false;
      
      const updatedUser = { ...user, ...userData };
      await AsyncStorage.setItem('@auth_user', JSON.stringify(updatedUser));
      
      // Update in users array
      const userString = await AsyncStorage.getItem('@auth_users');
      if (userString) {
        const users = JSON.parse(userString);
        const updatedUsers = users.map((u: User) => 
          u.id === user.id ? { ...u, ...userData } : u
        );
        await AsyncStorage.setItem('@auth_users', JSON.stringify(updatedUsers));
      }
      
      setUser(updatedUser);
      return true;
    } catch (error) {
      console.error('Update user info error:', error);
      return false;
    }
  };

  // Check if there's offline data pending sync
  const checkOfflineData = async (): Promise<boolean> => {
    try {
      const pendingData = await AsyncStorage.getItem('@offline_pending_sync');
      return !!pendingData;
    } catch (error) {
      console.error('Check offline data error:', error);
      return false;
    }
  };

  // Sync offline data to online storage when connection is available
  const syncOfflineData = async (): Promise<boolean> => {
    try {
      // In a real app, this would sync with a backend
      // For now, we'll simulate a successful sync
      await AsyncStorage.removeItem('@offline_pending_sync');
      return true;
    } catch (error) {
      console.error('Sync offline data error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        signup,
        logout,
        uploadProfilePhoto,
        updateUserInfo,
        checkOfflineData,
        syncOfflineData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;