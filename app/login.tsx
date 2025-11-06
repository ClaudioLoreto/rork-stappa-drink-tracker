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
import Svg, { Rect, Path } from 'react-native-svg';
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
      <Svg width="40" height="28" viewBox="0 0 60 30" style={styles.flagSvg}>
        <Rect x="0" y="0" width="60" height="30" fill="#012169" />
        <Path d="M0,0 L60,30 M60,0 L0,30" stroke="#FFFFFF" strokeWidth="6" />
        <Path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4" />
        <Path d="M30,0 L30,30 M0,15 L60,15" stroke="#FFFFFF" strokeWidth="10" />
        <Path d="M30,0 L30,30 M0,15 L60,15" stroke="#C8102E" strokeWidth="6" />
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
    const normalizedUsername = username.trim();
    const rawPassword = password;

    if (!normalizedUsername || !rawPassword) {
      setErrorModal({ visible: true, message: t('validation.fillAllFields') });
      return;
    }

    setLoading(true);
    try {
      const response = await api.auth.login(normalizedUsername, rawPassword);
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
      const msg = error instanceof Error ? error.message : t('common.error');
      const localized = msg.toLowerCase().includes('invalid username or password')
        ? (t('auth.invalidCredentials') || msg)
        : msg;
      setErrorModal({ 
        visible: true, 
        message: localized 
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
