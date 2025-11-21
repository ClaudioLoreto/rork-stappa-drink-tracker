import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = '@stappa_theme_mode';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  themeMode: ThemeMode;
  toggleTheme: () => Promise<void>;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem(THEME_KEY);
        
        if (!mounted) return;

        if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark')) {
          setThemeMode(storedTheme);
        }
      } catch (error) {
        console.error('Failed to load theme:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadTheme();

    return () => {
      mounted = false;
    };
  }, []);

  const toggleTheme = useCallback(async () => {
    const newMode: ThemeMode = themeMode === 'light' ? 'dark' : 'light';
    try {
      await AsyncStorage.setItem(THEME_KEY, newMode);
      setThemeMode(newMode);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  }, [themeMode]);

  const setTheme = useCallback(async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_KEY, mode);
      setThemeMode(mode);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  }, []);

  const value = useMemo(
    () => ({
      themeMode,
      toggleTheme,
      isLoading,
    }),
    [themeMode, toggleTheme, isLoading]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
