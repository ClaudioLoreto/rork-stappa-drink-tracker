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
import { Stack } from 'expo-router';
import { FormInput } from '@/components/Form';
import Button from '@/components/Button';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { ModalError } from '@/components/ModalKit';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { language, changeLanguage, t } = useLanguage();
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

  const handleRegister = async () => {
    if (!username || !password || !confirmPassword) {
      setErrorModal({ visible: true, message: t('validation.fillAllFields') });
      return;
    }

    if (!email && !phone) {
      setErrorModal({ visible: true, message: t('validation.emailOrPhoneRequired') });
      return;
    }

    if (!validateUsername(username)) {
      setErrorModal({ visible: true, message: t('validation.invalidUsername') });
      return;
    }

    if (phone && !validatePhone(phone)) {
      setErrorModal({ visible: true, message: t('validation.invalidPhone') });
      return;
    }

    if (!validatePassword(password)) {
      setErrorModal({ visible: true, message: t('validation.passwordRequirements') });
      return;
    }

    if (password !== confirmPassword) {
      setErrorModal({ visible: true, message: t('validation.passwordsNoMatch') });
      return;
    }

    setLoading(true);
    try {
      const response = await api.auth.register(firstName, lastName, username, phone, email, password);
      await login(response);
      router.replace('/select-bar');
    } catch (error) {
      setErrorModal({ 
        visible: true, 
        message: error instanceof Error ? error.message : t('common.error') 
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
      <Stack.Screen options={{ title: t('auth.createAccount'), headerShown: true }} />
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
            <Text style={styles.title}>{t('auth.createAccount')}</Text>
            <Text style={styles.subtitle}>
              {language === 'it' ? 'Unisciti a Stappa oggi' : 'Join Stappa today'}
            </Text>
          </View>

          <View style={styles.form}>
            <FormInput
              label={`${t('auth.firstName')} (${language === 'it' ? 'Facoltativo' : 'Optional'})`}
              value={firstName}
              onChangeText={setFirstName}
              placeholder={language === 'it' ? 'Inserisci il tuo nome' : 'Enter your first name'}
              autoCapitalize="words"
              testID="register-first-name"
            />

            <FormInput
              label={`${t('auth.lastName')} (${language === 'it' ? 'Facoltativo' : 'Optional'})`}
              value={lastName}
              onChangeText={setLastName}
              placeholder={language === 'it' ? 'Inserisci il tuo cognome' : 'Enter your last name'}
              autoCapitalize="words"
              testID="register-last-name"
            />

            <FormInput
              label={`${t('auth.username')} *`}
              value={username}
              onChangeText={setUsername}
              placeholder={language === 'it' ? 'Scegli un nome utente' : 'Choose a username'}
              autoCapitalize="none"
              testID="register-username"
            />
            <Text style={styles.fieldHint}>{t('auth.usernameRules')}</Text>

            <FormInput
              label={t('auth.phone')}
              value={phone}
              onChangeText={setPhone}
              placeholder={language === 'it' ? 'Inserisci il tuo numero di telefono' : 'Enter your phone number'}
              keyboardType="phone-pad"
              testID="register-phone"
            />

            <FormInput
              label={t('auth.email')}
              value={email}
              onChangeText={setEmail}
              placeholder={language === 'it' ? 'Inserisci la tua email' : 'Enter your email'}
              keyboardType="email-address"
              autoCapitalize="none"
              testID="register-email"
            />
            <Text style={styles.fieldHint}>{t('auth.emailOrPhoneRequired')}</Text>

            <FormInput
              label={`${t('auth.password')} *`}
              value={password}
              onChangeText={handlePasswordChange}
              placeholder={language === 'it' ? 'Crea una password' : 'Create a password'}
              secureTextEntry
              testID="register-password"
            />
            <View style={styles.passwordRequirements}>
              <Text style={styles.requirementsTitle}>{t('auth.passwordRequirements')}</Text>
              <View style={styles.requirementRow}>
                <View style={[styles.indicator, passwordValidation.minLength && styles.indicatorValid]} />
                <Text style={[styles.requirementText, passwordValidation.minLength && styles.requirementValid]}>
                  {t('auth.passwordMinLength')}
                </Text>
              </View>
              <View style={styles.requirementRow}>
                <View style={[styles.indicator, passwordValidation.hasUppercase && styles.indicatorValid]} />
                <Text style={[styles.requirementText, passwordValidation.hasUppercase && styles.requirementValid]}>
                  {t('auth.passwordUppercase')}
                </Text>
              </View>
              <View style={styles.requirementRow}>
                <View style={[styles.indicator, passwordValidation.hasLowercase && styles.indicatorValid]} />
                <Text style={[styles.requirementText, passwordValidation.hasLowercase && styles.requirementValid]}>
                  {t('auth.passwordLowercase')}
                </Text>
              </View>
              <View style={styles.requirementRow}>
                <View style={[styles.indicator, passwordValidation.hasDigit && styles.indicatorValid]} />
                <Text style={[styles.requirementText, passwordValidation.hasDigit && styles.requirementValid]}>
                  {t('auth.passwordDigit')}
                </Text>
              </View>
              <View style={styles.requirementRow}>
                <View style={[styles.indicator, passwordValidation.hasSpecial && styles.indicatorValid]} />
                <Text style={[styles.requirementText, passwordValidation.hasSpecial && styles.requirementValid]}>
                  {t('auth.passwordSpecial')}
                </Text>
              </View>
              <Text style={styles.passwordHint}>{t('auth.passwordCaseSensitive')}</Text>
            </View>

            <FormInput
              label={`${t('auth.confirmPassword')} *`}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder={language === 'it' ? 'Conferma la tua password' : 'Confirm your password'}
              secureTextEntry
              testID="register-confirm-password"
            />

            <Button
              title={t('auth.createAccount')}
              onPress={handleRegister}
              loading={loading}
              style={styles.registerButton}
              testID="register-button"
            />

            <Button
              title={t('auth.backToLogin')}
              onPress={() => router.back()}
              variant="outline"
              testID="back-to-login"
            />
          </View>
        </ScrollView>

        <ModalError
          visible={errorModal.visible}
          onClose={() => setErrorModal({ visible: false, message: '' })}
          title={t('common.error')}
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
  languageToggle: {
    position: 'absolute' as const,
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    zIndex: 1000,
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
