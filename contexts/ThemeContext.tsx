import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback, useMemo } from 'react';

const THEME_KEY = '@stappa_theme_mode';

export type ThemeMode = 'light' | 'dark';

export const [ThemeProvider, useTheme] = createContextHook(() => {
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

  return useMemo(
    () => ({
      themeMode,
      isDarkMode: themeMode === 'dark',
      isLoading,
      toggleTheme,
      setTheme,
    }),
    [themeMode, isLoading, toggleTheme, setTheme]
  );
});
