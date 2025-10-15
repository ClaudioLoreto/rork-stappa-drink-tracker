import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FormInput } from '@/components/Form';
import Button from '@/components/Button';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { ModalError, ModalSuccess } from '@/components/ModalKit';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorModal, setErrorModal] = useState({ visible: false, message: '' });
  const [successModal, setSuccessModal] = useState({ visible: false, message: '' });

  const handleLogin = async () => {
    if (!username || !password) {
      setErrorModal({ visible: true, message: 'Please fill in all fields' });
      return;
    }

    setLoading(true);
    try {
      const response = await api.auth.login(username, password);
      await login(response);
      
      switch (response.user.role) {
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
    } catch (error) {
      setErrorModal({ 
        visible: true, 
        message: error instanceof Error ? error.message : 'Login failed' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Stappa</Text>
          <Text style={styles.subtitle}>Welcome back!</Text>
        </View>

        <View style={styles.form}>
          <FormInput
            label="Username"
            value={username}
            onChangeText={setUsername}
            placeholder="Enter your username"
            autoCapitalize="none"
            testID="login-username"
          />

          <FormInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
            testID="login-password"
          />
          <Text style={styles.passwordHint}>Passwords are case-sensitive</Text>

          <Button
            title="Login"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginButton}
            testID="login-button"
          />

          <Button
            title="Create Account"
            onPress={() => router.push('/register')}
            variant="outline"
            testID="register-link"
          />
        </View>
      </ScrollView>

      <ModalError
        visible={errorModal.visible}
        onClose={() => setErrorModal({ visible: false, message: '' })}
        title="Error"
        message={errorModal.message}
        testID="login-error-modal"
      />

      <ModalSuccess
        visible={successModal.visible}
        onClose={() => setSuccessModal({ visible: false, message: '' })}
        title="Success"
        message={successModal.message}
        testID="login-success-modal"
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 48,
    fontWeight: '800' as const,
    color: Colors.orange,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.text.secondary,
  },
  form: {
    marginBottom: 32,
  },
  loginButton: {
    marginBottom: 16,
  },
  passwordHint: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: -8,
    marginBottom: 16,
  },
});
