import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { User, AuthResponse } from '@/types';

const AUTH_TOKEN_KEY = '@stappa_auth_token';
const AUTH_USER_KEY = '@stappa_auth_user';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const loadAuthData = async () => {
      console.log('AuthContext - Loading auth data...');
      try {
        const [storedToken, storedUser] = await Promise.all([
          AsyncStorage.getItem(AUTH_TOKEN_KEY),
          AsyncStorage.getItem(AUTH_USER_KEY),
        ]);

        if (!mounted) return;

        console.log('AuthContext - Stored token:', storedToken ? 'exists' : 'null');
        console.log('AuthContext - Stored user:', storedUser ? 'exists' : 'null');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          console.log('AuthContext - User loaded:', JSON.parse(storedUser).username);
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
        AsyncStorage.setItem(AUTH_TOKEN_KEY, authResponse.token),
        AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(authResponse.user)),
      ]);
      setToken(authResponse.token);
      setUser(authResponse.user);
    } catch (error) {
      console.error('Failed to save auth data:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(AUTH_TOKEN_KEY),
        AsyncStorage.removeItem(AUTH_USER_KEY),
      ]);
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Failed to clear auth data:', error);
    }
  }, []);

  const updateUser = useCallback(async (updatedUser: User) => {
    try {
      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  }, []);

  return useMemo(
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
});
