import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBar } from '@/contexts/BarContext';
import Colors from '@/constants/colors';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { isLoading: langLoading } = useLanguage();
  const { isLoading: barLoading } = useBar();

  const isLoading = authLoading || langLoading || barLoading;

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isLoading]);

  useEffect(() => {
    console.log('Index - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated, 'user:', user);
    
    if (!isLoading) {
      if (isAuthenticated && user) {
        console.log('Redirecting to role-based screen:', user.role);
        switch (user.role) {
          case 'ROOT':
            router.replace('/admin');
            break;
          case 'SENIOR_MERCHANT':
          case 'MERCHANT':
            router.replace('/merchant');
            break;
          case 'USER':
            router.replace('/select-bar');
            break;
          default:
            router.replace('/login');
        }
      } else {
        console.log('Redirecting to login');
        router.replace('/login');
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.orange} />
      <Text style={styles.text}>Starting...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.cream,
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.text.secondary,
  },
});
