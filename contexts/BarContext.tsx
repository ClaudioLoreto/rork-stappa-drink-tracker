import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Establishment } from '@/types';

const SELECTED_BAR_KEY = '@stappa_selected_bar';

interface BarContextType {
  selectedBar: Establishment | null;
  selectBar: (bar: Establishment) => Promise<void>;
  clearBar: () => Promise<void>;
  isLoading: boolean;
}

const BarContext = createContext<BarContextType | undefined>(undefined);

export function BarProvider({ children }: { children: React.ReactNode }) {
  const [selectedBar, setSelectedBar] = useState<Establishment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSelectedBar = async () => {
      try {
        const stored = await AsyncStorage.getItem(SELECTED_BAR_KEY);
        if (stored) {
          setSelectedBar(JSON.parse(stored));
        }
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

  const value = useMemo(
    () => ({
      selectedBar,
      selectBar,
      clearBar,
      isLoading,
    }),
    [selectedBar, selectBar, clearBar, isLoading]
  );

  return <BarContext.Provider value={value}>{children}</BarContext.Provider>;
}

export function useBar() {
  const context = useContext(BarContext);
  if (context === undefined) {
    throw new Error('useBar must be used within a BarProvider');
  }
  return context;
}
