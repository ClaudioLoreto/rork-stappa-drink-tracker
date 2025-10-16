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
import Svg, { Rect } from 'react-native-svg';
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

  const FlagIcon = ({ lang }: { lang: 'it' | 'en' }) => {
    if (lang === 'it') {
      return (
        <Svg width="40" height="28" viewBox="0 0 40 28" style={styles.flagSvg}>
          <Rect x="0" y="0" width="13.33" height="28" fill="#009246" />
          <Rect x="13.33" y="0" width="13.33" height="28" fill="#FFFFFF" />
          <Rect x="26.66" y="0" width="13.34" height="28" fill="#CE2B37" />
        </Svg>
      );
    }
    return (
      <Svg width="40" height="28" viewBox="0 0 40 28" style={styles.flagSvg}>
        <Rect x="0" y="0" width="40" height="28" fill="#012169" />
        <Rect x="0" y="0" width="40" height="3.11" fill="#FFFFFF" />
        <Rect x="0" y="5.56" width="40" height="3.11" fill="#FFFFFF" />
        <Rect x="0" y="11.11" width="40" height="5.78" fill="#FFFFFF" />
        <Rect x="0" y="19.33" width="40" height="3.11" fill="#FFFFFF" />
        <Rect x="0" y="24.89" width="40" height="3.11" fill="#FFFFFF" />
        <Rect x="0" y="0" width="16" height="16.8" fill="#012169" />
        <Rect x="0" y="1.4" width="40" height="2.33" fill="#C8102E" />
        <Rect x="0" y="7.78" width="40" height="2.33" fill="#C8102E" />
        <Rect x="0" y="12.44" width="40" height="2.33" fill="#C8102E" />
        <Rect x="0" y="18.67" width="40" height="2.33" fill="#C8102E" />
        <Rect x="0" y="24.11" width="40" height="2.33" fill="#C8102E" />
        <Rect x="0" y="12.44" width="16" height="2.33" fill="#FFFFFF" />
        <Rect x="0" y="11.67" width="40" height="4.66" fill="#C8102E" />
        <Rect x="0" y="0" width="6.4" height="16.8" fill="#FFFFFF" />
        <Rect x="9.6" y="0" width="6.4" height="16.8" fill="#FFFFFF" />
        <Rect x="2.4" y="0" width="2.4" height="16.8" fill="#C8102E" />
      </Svg>
    );
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
        <View style={styles.flagContainer}>
          <FlagIcon lang={language} />
        </View>
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
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  flagContainer: {
    width: 40,
    height: 28,
    borderRadius: 4,
    overflow: 'hidden',
  },
  flagSvg: {
    borderRadius: 4,
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
