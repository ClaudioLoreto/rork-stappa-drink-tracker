import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import Colors from '@/constants/colors';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    console.log('Index - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated, 'user:', user);
    
    if (!isLoading) {
      if (isAuthenticated && user) {
        console.log('Redirecting to role-based screen:', user.role);
        switch (user.role) {
          case 'ROOT':
            router.replace('/admin');
            break;
          case 'MERCHANT':
            router.replace('/merchant');
            break;
          case 'USER':
            router.replace('/user');
            break;
          default:
            router.replace('/user');
        }
      } else {
        console.log('Redirecting to login');
        router.replace('/login');
      }
    }
  }, [isAuthenticated, isLoading, user]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.orange} />
      <Text style={styles.text}>Loading Stappa...</Text>
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
