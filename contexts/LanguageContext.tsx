import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Language } from '@/types';
import { translate as translateFn } from '@/constants/translations';

const LANGUAGE_KEY = '@stappa_language';

export const [LanguageProvider, useLanguage] = createContextHook(() => {
  const [language, setLanguage] = useState<Language>('it');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const timeoutPromise = new Promise<void>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 2000)
        );
        
        const loadPromise = (async () => {
          const stored = await AsyncStorage.getItem(LANGUAGE_KEY);
          if (stored === 'en' || stored === 'it') {
            setLanguage(stored);
          }
        })();

        await Promise.race([loadPromise, timeoutPromise]);
      } catch (error) {
        console.error('Failed to load language:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLanguage();
  }, []);

  const changeLanguage = useCallback(async (lang: Language) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, lang);
      setLanguage(lang);
    } catch (error) {
      console.error('Failed to save language:', error);
    }
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      return translateFn(key, language, params);
    },
    [language]
  );

  return useMemo(
    () => ({
      language,
      changeLanguage,
      t,
      isLoading,
    }),
    [language, changeLanguage, t, isLoading]
  );
});
