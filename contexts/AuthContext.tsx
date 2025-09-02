import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { apiService } from '@/services/api';

// Configure Google Sign-In at module level
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB || 
               process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || 
               undefined,
  offlineAccess: true,
});

interface Profile {
  _id?: string;
  name: string;
  age?: number;
  conditions: string[];
  lifestyle?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface User {
  id: string;
  googleId: string;
  email: string;
  name: string;
  picture?: string | null;
  profiles: Profile[];
  scannedCodes: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (userData: User) => Promise<void>;
  signOut: () => Promise<void>;
  checkAuthState: () => Promise<void>;
  getCurrentToken: () => Promise<string | null>;
  syncUserWithBackend: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const signIn = async (userData: User) => {
    try {
      // Store user data
      await SecureStore.setItemAsync('user', JSON.stringify(userData));
      
      // Get and store the Google ID token
      try {
        const tokens = await GoogleSignin.getTokens();
        if (tokens.idToken) {
          await SecureStore.setItemAsync('google_id_token', tokens.idToken);
        }
      } catch (tokenError) {
        console.error('Error getting Google ID token:', tokenError);
      }
      
      setUser(userData);
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  const signOut = async () => {
    try {
      await GoogleSignin.signOut();
      await SecureStore.deleteItemAsync('user');
      await SecureStore.deleteItemAsync('google_id_token');
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const checkAuthState = async () => {
    try {
      setIsLoading(true);
      
      // Check if user is signed in with Google
      const currentUser = await GoogleSignin.getCurrentUser();
      
      if (currentUser) {
        // Check if we have stored user data
        const userData = await SecureStore.getItemAsync('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          // Verify the stored user matches current Google user
          if (parsedUser.googleId === currentUser.user.id) {
            setUser(parsedUser);
          } else {
            // User mismatch, clear stored data
            await SecureStore.deleteItemAsync('user');
            await SecureStore.deleteItemAsync('google_id_token');
          }
        }
      } else {
        // Clear any stored data if not signed in
        await SecureStore.deleteItemAsync('user');
        await SecureStore.deleteItemAsync('google_id_token');
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      // Clear stored data on error
      await SecureStore.deleteItemAsync('user');
      await SecureStore.deleteItemAsync('google_id_token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentToken = async (): Promise<string | null> => {
    try {
      // First try to get stored token
      const storedToken = await SecureStore.getItemAsync('google_id_token');
      if (storedToken) {
        return storedToken;
      }
      
      // Fallback to getting fresh token from Google
      const currentUser = await GoogleSignin.getCurrentUser();
      if (currentUser) {
        const tokens = await GoogleSignin.getTokens();
        // Store the new token
        await SecureStore.setItemAsync('google_id_token', tokens.idToken);
        return tokens.idToken;
      }
      return null;
    } catch (error) {
      console.error('Error getting current token:', error);
      return null;
    }
  };

  const syncUserWithBackend = async () => {
    try {
      if (!user) return;
      
      const token = await getCurrentToken();
      if (!token) return;
      
      // Sync user data with backend
      const response = await apiService.createOrUpdateUser({
        googleId: user.googleId,
        email: user.email,
        name: user.name,
        picture: user.picture,
        profiles: user.profiles,
        scannedCodes: user.scannedCodes,
      }, token);
      
      if (response.status === 'success') {
        // Update local user data with backend response
        setUser(response.data.user);
        await SecureStore.setItemAsync('user', JSON.stringify(response.data.user));
      }
    } catch (error) {
      console.error('Error syncing user with backend:', error);
    }
  };

  useEffect(() => {
    checkAuthState();
  }, []);

  const value = {
    user,
    isLoading,
    signIn,
    signOut,
    checkAuthState,
    getCurrentToken,
    syncUserWithBackend,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
