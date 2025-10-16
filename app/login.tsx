import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FormInput } from '@/components/Form';
import Button from '@/components/Button';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { ModalError, ModalSuccess } from '@/components/ModalKit';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { language, changeLanguage, t } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorModal, setErrorModal] = useState({ visible: false, message: '' });
  const [successModal, setSuccessModal] = useState({ visible: false, message: '' });

  const toggleLanguage = () => {
    changeLanguage(language === 'it' ? 'en' : 'it');
  };

  const handleForgotPassword = () => {
    setErrorModal({ 
      visible: true, 
      message: t('auth.resetPasswordNotAvailable') || 'Password reset is not available yet. Please contact support.' 
    });
  };

  const handleLogin = async () => {
    if (!username || !password) {
      setErrorModal({ visible: true, message: t('validation.fillAllFields') });
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
        case 'SENIOR_MERCHANT':
        case 'MERCHANT':
          router.replace('/merchant');
          break;
        case 'USER':
          router.replace('/select-bar');
          break;
        default:
          router.replace('/select-bar');
      }
    } catch (error) {
      setErrorModal({ 
        visible: true, 
        message: error instanceof Error ? error.message : t('common.error') 
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
      <TouchableOpacity 
        style={styles.languageToggle}
        onPress={toggleLanguage}
        testID="language-toggle"
      >
        <Text style={styles.flag}>{language === 'it' ? '🇮🇹' : '🇬🇧'}</Text>
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Stappa</Text>
          <Text style={styles.subtitle}>
            {language === 'it' ? 'Bentornato!' : 'Welcome back!'}
          </Text>
        </View>

        <View style={styles.form}>
          <FormInput
            label={t('auth.username')}
            value={username}
            onChangeText={setUsername}
            placeholder={language === 'it' ? 'Inserisci il tuo nome utente' : 'Enter your username'}
            autoCapitalize="none"
            testID="login-username"
          />

          <FormInput
            label={t('auth.password')}
            value={password}
            onChangeText={setPassword}
            placeholder={language === 'it' ? 'Inserisci la tua password' : 'Enter your password'}
            secureTextEntry
            testID="login-password"
          />
          <Text style={styles.passwordHint}>{t('auth.passwordCaseSensitive')}</Text>

          <TouchableOpacity 
            onPress={handleForgotPassword}
            style={styles.forgotPassword}
            testID="forgot-password-link"
          >
            <Text style={styles.forgotPasswordText}>{t('auth.forgotPassword')}</Text>
          </TouchableOpacity>

          <Button
            title={t('auth.login')}
            onPress={handleLogin}
            loading={loading}
            style={styles.loginButton}
            testID="login-button"
          />

          <Button
            title={t('auth.createAccount')}
            onPress={() => router.push('/register')}
            variant="outline"
            testID="register-link"
          />
        </View>
      </ScrollView>

      <ModalError
        visible={errorModal.visible}
        onClose={() => setErrorModal({ visible: false, message: '' })}
        title={t('common.error')}
        message={errorModal.message}
        testID="login-error-modal"
      />

      <ModalSuccess
        visible={successModal.visible}
        onClose={() => setSuccessModal({ visible: false, message: '' })}
        title={t('common.success')}
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
  languageToggle: {
    position: 'absolute' as const,
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  flag: {
    fontSize: 32,
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
    marginBottom: 8,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: Colors.orange,
    fontWeight: '600' as const,
  },
});
