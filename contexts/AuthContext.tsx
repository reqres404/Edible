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
  allergens?: string[];
  conditions?: string[]; // Keep for backward compatibility
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
  
  const TOKEN_STORE_KEY = 'google_id_token';
  const TOKEN_TS_KEY = 'google_id_token_ts';
  const TOKEN_REFRESH_INTERVAL_MS = 45 * 60 * 1000; // 45 minutes

  const refreshGoogleToken = async (): Promise<string | null> => {
    try {
      const currentUser = await GoogleSignin.getCurrentUser();
      if (!currentUser) return null;
      const tokens = await GoogleSignin.getTokens();
      if (tokens?.idToken) {
        await SecureStore.setItemAsync(TOKEN_STORE_KEY, tokens.idToken);
        await SecureStore.setItemAsync(TOKEN_TS_KEY, Date.now().toString());
        return tokens.idToken;
      }
      return null;
    } catch (error) {
      console.error('Error refreshing Google token:', error);
      return null;
    }
  };

  const signIn = async (userData: User) => {
    try {
      // Store user data
      await SecureStore.setItemAsync('user', JSON.stringify(userData));
      
      // Get and store the Google ID token
      try {
        const tokens = await GoogleSignin.getTokens();
        if (tokens.idToken) {
          await SecureStore.setItemAsync(TOKEN_STORE_KEY, tokens.idToken);
          await SecureStore.setItemAsync(TOKEN_TS_KEY, Date.now().toString());
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
      await SecureStore.deleteItemAsync(TOKEN_STORE_KEY);
      await SecureStore.deleteItemAsync(TOKEN_TS_KEY);
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
            await SecureStore.deleteItemAsync(TOKEN_STORE_KEY);
            await SecureStore.deleteItemAsync(TOKEN_TS_KEY);
          }
        }
      } else {
        // Clear any stored data if not signed in
        await SecureStore.deleteItemAsync('user');
        await SecureStore.deleteItemAsync(TOKEN_STORE_KEY);
        await SecureStore.deleteItemAsync(TOKEN_TS_KEY);
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      // Clear stored data on error
      await SecureStore.deleteItemAsync('user');
      await SecureStore.deleteItemAsync(TOKEN_STORE_KEY);
      await SecureStore.deleteItemAsync(TOKEN_TS_KEY);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentToken = async (): Promise<string | null> => {
    try {
      // Check stored token and refresh timestamp
      const [storedToken, storedTs] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_STORE_KEY),
        SecureStore.getItemAsync(TOKEN_TS_KEY),
      ]);

      const lastRefresh = storedTs ? parseInt(storedTs, 10) : 0;
      const needsRefresh = !storedToken || !lastRefresh || Date.now() - lastRefresh > TOKEN_REFRESH_INTERVAL_MS;

      if (!needsRefresh && storedToken) {
        return storedToken;
      }

      // Refresh token proactively
      const refreshed = await refreshGoogleToken();
      if (refreshed) return refreshed;

      // If refresh failed but we still have a stored token, return it as fallback
      if (storedToken) return storedToken;

      return null;
    } catch (error) {
      console.error('Error getting current token:', error);
      return null;
    }
  };

  const syncUserWithBackend = async () => {
    try {
      if (!user) {
        console.log('❌ No user to sync');
        return;
      }
      
      console.log('🔄 Starting syncUserWithBackend...');
      console.log('👤 Current user profiles before sync:', user.profiles?.length);
      
      const token = await getCurrentToken();
      if (!token) {
        console.log('❌ No token for sync');
        return;
      }
      
      // Instead of syncing current state, fetch fresh data from backend
      console.log('📡 Fetching fresh user data from backend...');
      const response = await apiService.getUserByGoogleId(user.googleId, token);
      
      if (response.status === 'success') {
        console.log('✅ Fresh user data received:', response.data.user);
        console.log('📝 Number of profiles in fresh data:', response.data.user?.profiles?.length);
        
        // Update local user data with backend response
        setUser(response.data.user);
        await SecureStore.setItemAsync('user', JSON.stringify(response.data.user));
        console.log('✅ User state updated with fresh data');
      }
    } catch (error) {
      console.error('Error syncing user with backend:', error);
    }
  };

  useEffect(() => {
    checkAuthState();
  }, []);

  // Periodic token refresh while user is signed in
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      refreshGoogleToken();
    }, TOKEN_REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [user]);

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
