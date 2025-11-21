import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthResponse } from '@/types';

const AUTH_TOKEN_KEY = 'stappa_auth_token';
const AUTH_USER_KEY = 'stappa_auth_user';

// SecureStore wrapper with web fallback
const secureStorage = {
  async getItemAsync(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return AsyncStorage.getItem(`@${key}`);
    }
    return SecureStore.getItemAsync(key);
  },
  async setItemAsync(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      return AsyncStorage.setItem(`@${key}`, value);
    }
    return SecureStore.setItemAsync(key, value);
  },
  async deleteItemAsync(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      return AsyncStorage.removeItem(`@${key}`);
    }
    return SecureStore.deleteItemAsync(key);
  },
};

interface AuthContextType {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (authResponse: AuthResponse) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const loadAuthData = async () => {
      console.log('AuthContext - Loading auth data...');
      try {
        const [storedToken, storedUser] = await Promise.all([
          secureStorage.getItemAsync(AUTH_TOKEN_KEY),
          secureStorage.getItemAsync(AUTH_USER_KEY),
        ]);

        if (!mounted) return;

        console.log('AuthContext - Stored token:', storedToken ? 'exists' : 'null');
        console.log('AuthContext - Stored user:', storedUser ? 'exists' : 'null');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          console.log('AuthContext - User auto-logged in:', JSON.parse(storedUser).username);
        } else {
          console.log('AuthContext - No stored auth data');
        }
      } catch (error) {
        console.error('Failed to load auth data:', error);
      } finally {
        if (mounted) {
          console.log('AuthContext - Loading complete');
          setIsLoading(false);
        }
      }
    };

    loadAuthData();

    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async (authResponse: AuthResponse) => {
    try {
      await Promise.all([
        secureStorage.setItemAsync(AUTH_TOKEN_KEY, authResponse.token),
        secureStorage.setItemAsync(AUTH_USER_KEY, JSON.stringify(authResponse.user)),
      ]);
      setToken(authResponse.token);
      setUser(authResponse.user);
      console.log('AuthContext - User logged in and saved securely');
    } catch (error) {
      console.error('Failed to save auth data:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await Promise.all([
        secureStorage.deleteItemAsync(AUTH_TOKEN_KEY),
        secureStorage.deleteItemAsync(AUTH_USER_KEY),
      ]);
      setToken(null);
      setUser(null);
      console.log('AuthContext - User logged out');
    } catch (error) {
      console.error('Failed to clear auth data:', error);
    }
  }, []);

  const updateUser = useCallback(async (updatedUser: User) => {
    try {
      await secureStorage.setItemAsync(AUTH_USER_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      isLoading,
      isAuthenticated: !!token && !!user,
      login,
      logout,
      updateUser,
    }),
    [token, user, isLoading, login, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
