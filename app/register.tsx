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

interface PasswordValidation {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasDigit: boolean;
  hasSpecial: boolean;
}

export default function RegisterScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorModal, setErrorModal] = useState({ visible: false, message: '' });
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasDigit: false,
    hasSpecial: false,
  });

  const validatePassword = (pwd: string) => {
    const validation = {
      minLength: pwd.length >= 10,
      hasUppercase: /[A-Z]/.test(pwd),
      hasLowercase: /[a-z]/.test(pwd),
      hasDigit: /[0-9]/.test(pwd),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    };
    setPasswordValidation(validation);
    return Object.values(validation).every(v => v);
  };

  const validateUsername = (uname: string) => {
    return /^[A-Za-z0-9_]+$/.test(uname);
  };

  const validatePhone = (ph: string) => {
    return /^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/.test(ph);
  };

  const handleRegister = async () => {
    if (!firstName || !lastName || !username || !phone || !email || !password || !confirmPassword) {
      setErrorModal({ visible: true, message: 'Please fill in all required fields' });
      return;
    }

    if (!validateUsername(username)) {
      setErrorModal({ visible: true, message: 'Username can only contain letters, numbers, and underscores' });
      return;
    }

    if (!validatePhone(phone)) {
      setErrorModal({ visible: true, message: 'Please enter a valid phone number' });
      return;
    }

    if (!validatePassword(password)) {
      setErrorModal({ visible: true, message: 'Password does not meet all requirements' });
      return;
    }

    if (password !== confirmPassword) {
      setErrorModal({ visible: true, message: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    try {
      const response = await api.auth.register(firstName, lastName, username, phone, email, password);
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

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    validatePassword(text);
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
              label="First Name *"
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter your first name"
              autoCapitalize="words"
              testID="register-first-name"
            />

            <FormInput
              label="Last Name *"
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter your last name"
              autoCapitalize="words"
              testID="register-last-name"
            />

            <FormInput
              label="Username *"
              value={username}
              onChangeText={setUsername}
              placeholder="Choose a username"
              autoCapitalize="none"
              testID="register-username"
            />
            <Text style={styles.fieldHint}>Letters, numbers, and underscores only</Text>

            <FormInput
              label="Phone *"
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              testID="register-phone"
            />

            <FormInput
              label="Email *"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              testID="register-email"
            />

            <FormInput
              label="Password *"
              value={password}
              onChangeText={handlePasswordChange}
              placeholder="Create a password"
              secureTextEntry
              testID="register-password"
            />
            <View style={styles.passwordRequirements}>
              <Text style={styles.requirementsTitle}>Password must contain:</Text>
              <View style={styles.requirementRow}>
                <View style={[styles.indicator, passwordValidation.minLength && styles.indicatorValid]} />
                <Text style={[styles.requirementText, passwordValidation.minLength && styles.requirementValid]}>
                  At least 10 characters
                </Text>
              </View>
              <View style={styles.requirementRow}>
                <View style={[styles.indicator, passwordValidation.hasUppercase && styles.indicatorValid]} />
                <Text style={[styles.requirementText, passwordValidation.hasUppercase && styles.requirementValid]}>
                  One uppercase letter
                </Text>
              </View>
              <View style={styles.requirementRow}>
                <View style={[styles.indicator, passwordValidation.hasLowercase && styles.indicatorValid]} />
                <Text style={[styles.requirementText, passwordValidation.hasLowercase && styles.requirementValid]}>
                  One lowercase letter
                </Text>
              </View>
              <View style={styles.requirementRow}>
                <View style={[styles.indicator, passwordValidation.hasDigit && styles.indicatorValid]} />
                <Text style={[styles.requirementText, passwordValidation.hasDigit && styles.requirementValid]}>
                  One number
                </Text>
              </View>
              <View style={styles.requirementRow}>
                <View style={[styles.indicator, passwordValidation.hasSpecial && styles.indicatorValid]} />
                <Text style={[styles.requirementText, passwordValidation.hasSpecial && styles.requirementValid]}>
                  One special character
                </Text>
              </View>
              <Text style={styles.passwordHint}>Passwords are case-sensitive</Text>
            </View>

            <FormInput
              label="Confirm Password *"
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
  fieldHint: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: -12,
    marginBottom: 16,
  },
  passwordRequirements: {
    marginTop: -12,
    marginBottom: 16,
    padding: 12,
    backgroundColor: Colors.cream,
    borderRadius: 8,
  },
  requirementsTitle: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
    marginRight: 8,
  },
  indicatorValid: {
    backgroundColor: Colors.success,
  },
  requirementText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  requirementValid: {
    color: Colors.success,
  },
  passwordHint: {
    fontSize: 11,
    color: Colors.text.secondary,
    marginTop: 8,
    fontStyle: 'italic' as const,
  },
});
