import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as firebase from 'firebase';

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
  sendVerificationCode: (phoneNumber: string) => Promise<boolean>;
  verifyCode: (verificationCode: string) => Promise<boolean>;
};

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  sendVerificationCode: async () => false,
  verifyCode: async () => false,
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
  const [verificationId, setVerificationId] = useState<string>('');

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

    // Listen for auth state changes
    const unsubscribe = firebase.auth().onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        const userData: User = {
          phoneNumber: firebaseUser.phoneNumber || '',
          displayName: firebaseUser.displayName || '',
          isAuthenticated: true,
          uid: firebaseUser.uid,
        };
        setUser(userData);
        // Store user data in AsyncStorage for offline access
        AsyncStorage.setItem('user', JSON.stringify(userData));
      } else {
        // User is signed out
        setUser(null);
        AsyncStorage.removeItem('user');
      }
      setIsLoading(false);
    });

    checkUserAuth();
    
    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Send verification code via SMS
  const sendVerificationCode = async (phoneNumber: string) => {
    try {
      setIsLoading(true);
      // Format phone number for Firebase Auth (add '+' if not present)
      const formattedPhoneNumber = phoneNumber.startsWith('+') 
        ? phoneNumber 
        : `+88${phoneNumber}`; // Assuming Bangladesh country code
      
      // Use Firebase's phone authentication
      const provider = new firebase.auth.PhoneAuthProvider();
      const verificationId = await provider.verifyPhoneNumber(
        formattedPhoneNumber,
        // @ts-ignore - recaptchaVerifier is required but we're in a mobile environment
        null
      );
      
      setVerificationId(verificationId);
      return true;
    } catch (error) {
      console.error('Error sending verification code:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Verify the SMS code
  const verifyCode = async (verificationCode: string) => {
    try {
      setIsLoading(true);
      
      if (!verificationId) {
        console.error('No verification ID found');
        return false;
      }
      
      // Create credentials with verification ID and code
      const credential = firebase.auth.PhoneAuthProvider.credential(
        verificationId,
        verificationCode
      );
      
      // Sign in with credential
      await firebase.auth().signInWithCredential(credential);
      return true;
    } catch (error) {
      console.error('Error verifying code:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Traditional login with phone & password - custom implementation
  const login = async (phoneNumber: string, password: string) => {
    try {
      setIsLoading(true);
      
      // For this demo, we'll use Firebase email auth with phone as username
      // In a real app, you might use custom auth or Firebase's phone auth
      await firebase.auth().signInWithEmailAndPassword(
        `${phoneNumber}@example.com`,
        password
      );

      // User will be set by the onAuthStateChanged listener
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up with phone & password - custom implementation
  const signup = async (phoneNumber: string, password: string, displayName: string) => {
    try {
      setIsLoading(true);
      
      // Use Firebase to create account
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(
        `${phoneNumber}@example.com`,
        password
      );
      
      // Update profile with display name
      if (userCredential.user) {
        await userCredential.user.updateProfile({
          displayName: displayName,
        });
        
        // Set custom phone number field
        await firebase.firestore().collection('users').doc(userCredential.user.uid).set({
          phoneNumber,
          displayName,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
      }

      // User will be set by the onAuthStateChanged listener
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
      await firebase.auth().signOut();
      // Remove stored user
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
    sendVerificationCode,
    verifyCode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};