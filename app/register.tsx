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
import { Stack } from 'expo-router';
import { FormInput } from '@/components/Form';
import Button from '@/components/Button';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { ModalError } from '@/components/ModalKit';

export default function RegisterScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorModal, setErrorModal] = useState({ visible: false, message: '' });

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      setErrorModal({ visible: true, message: 'Please fill in all fields' });
      return;
    }

    if (password !== confirmPassword) {
      setErrorModal({ visible: true, message: 'Passwords do not match' });
      return;
    }

    if (password.length < 8) {
      setErrorModal({ visible: true, message: 'Password must be at least 8 characters' });
      return;
    }

    setLoading(true);
    try {
      const response = await api.auth.register(username, email, password);
      await login(response);
      router.replace('/user');
    } catch (error) {
      setErrorModal({ 
        visible: true, 
        message: error instanceof Error ? error.message : 'Registration failed' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Create Account', headerShown: true }} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join Stappa today</Text>
          </View>

          <View style={styles.form}>
            <FormInput
              label="Username"
              value={username}
              onChangeText={setUsername}
              placeholder="Choose a username"
              autoCapitalize="none"
              testID="register-username"
            />

            <FormInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              testID="register-email"
            />

            <FormInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Create a password"
              secureTextEntry
              testID="register-password"
            />
            <Text style={styles.passwordHint}>Passwords are case-sensitive</Text>

            <FormInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm your password"
              secureTextEntry
              testID="register-confirm-password"
            />

            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={loading}
              style={styles.registerButton}
              testID="register-button"
            />

            <Button
              title="Back to Login"
              onPress={() => router.back()}
              variant="outline"
              testID="back-to-login"
            />
          </View>
        </ScrollView>

        <ModalError
          visible={errorModal.visible}
          onClose={() => setErrorModal({ visible: false, message: '' })}
          title="Error"
          message={errorModal.message}
          testID="register-error-modal"
        />
      </KeyboardAvoidingView>
    </>
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
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: Colors.orange,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  form: {
    marginBottom: 32,
  },
  registerButton: {
    marginBottom: 16,
  },
  passwordHint: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: -8,
    marginBottom: 16,
  },
});
