import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Establishment } from '@/types';

const SELECTED_BAR_KEY = '@stappa_selected_bar';

export const [BarProvider, useBar] = createContextHook(() => {
  const [selectedBar, setSelectedBar] = useState<Establishment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSelectedBar = async () => {
      try {
        const timeoutPromise = new Promise<void>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 2000)
        );
        
        const loadPromise = (async () => {
          const stored = await AsyncStorage.getItem(SELECTED_BAR_KEY);
          if (stored) {
            setSelectedBar(JSON.parse(stored));
          }
        })();

        await Promise.race([loadPromise, timeoutPromise]);
      } catch (error) {
        console.error('Failed to load selected bar:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSelectedBar();
  }, []);

  const selectBar = useCallback(async (bar: Establishment) => {
    try {
      await AsyncStorage.setItem(SELECTED_BAR_KEY, JSON.stringify(bar));
      setSelectedBar(bar);
    } catch (error) {
      console.error('Failed to save selected bar:', error);
    }
  }, []);

  const clearBar = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(SELECTED_BAR_KEY);
      setSelectedBar(null);
    } catch (error) {
      console.error('Failed to clear selected bar:', error);
    }
  }, []);

  return useMemo(
    () => ({
      selectedBar,
      selectBar,
      clearBar,
      isLoading,
    }),
    [selectedBar, selectBar, clearBar, isLoading]
  );
});
