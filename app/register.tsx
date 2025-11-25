import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Svg, { Rect, Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { Check, Calendar } from 'lucide-react-native';
import { FormInput } from '@/components/Form';
import { CitySelector } from '@/components/CitySelector';
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
  const [birthdate, setBirthdate] = useState<Date | undefined>(undefined);
  const [city, setCity] = useState<{ id: string; name: string; province: string; region: string } | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorModal, setErrorModal] = useState({ visible: false, message: '' });
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasDigit: false,
    hasSpecial: false,
  });
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptCookies, setAcceptCookies] = useState(false);

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

  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setBirthdate(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
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

    if (!birthdate) {
      setErrorModal({ visible: true, message: t('validation.birthdateRequired') });
      return;
    }

    if (!city) {
      setErrorModal({ visible: true, message: t('auth.cityRequired') });
      return;
    }

    const age = calculateAge(birthdate);
    if (age < 18) {
      setErrorModal({ visible: true, message: t('validation.underage') });
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

    if (!acceptPrivacy || !acceptTerms || !acceptCookies) {
      setErrorModal({ visible: true, message: t('auth.mustAcceptPolicies') });
      return;
    }

    setLoading(true);
    try {
      const response = await api.auth.register(firstName, lastName, username, phone, email, password, birthdate.toISOString(), city.name, city.province, city.region);
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
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitleAlign: 'left',
          headerTitle: () => (
            <View style={styles.headerTitleContainer} testID="register-header-title">
              <TouchableOpacity onPress={toggleLanguage} style={styles.headerFlagButton} testID="language-toggle-header">
                <FlagIcon lang={language} />
              </TouchableOpacity>
              <Text style={styles.headerTitleText}>{t('auth.createAccount')}</Text>
            </View>
          ),
        }}
      />
      <View style={styles.container}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
          <View style={styles.header}>
            <Text style={styles.title}>{t('auth.createAccount')}</Text>
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

            {/* Date of Birth Picker */}
            <View style={styles.datePickerContainer}>
              <Text style={styles.datePickerLabel}>{`${t('auth.birthdate')} *`}</Text>
              <TouchableOpacity 
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(!showDatePicker)}
                testID="birthdate-picker-button"
              >
                <Calendar size={20} color={Colors.orange} />
                <Text style={styles.datePickerText}>
                  {birthdate ? formatDate(birthdate) : t('auth.enterBirthdate')}
                </Text>
              </TouchableOpacity>
              <Text style={styles.fieldHint}>{t('auth.birthdateRequired')}</Text>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={birthdate || new Date(2000, 0, 1)}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                onChange={handleDateChange}
                maximumDate={new Date()}
                minimumDate={new Date(1920, 0, 1)}
                testID="birthdate-picker"
              />
            )}

            <CitySelector
              label={`${t('auth.city')} *`}
              placeholder={language === 'it' ? 'Cerca la tua città' : 'Search your city'}
              onSelect={(locality) => setCity(locality)}
              error={!city && loading ? t('auth.cityRequired') : undefined}
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

            {/* Legal Acceptance Checkboxes */}
            <View style={styles.legalSection}>
              <Text style={styles.legalTitle}>{t('auth.legalAcceptance')}</Text>
              
              <TouchableOpacity 
                style={styles.checkboxRow} 
                onPress={() => setAcceptPrivacy(!acceptPrivacy)}
                testID="accept-privacy-checkbox"
              >
                <View style={[styles.checkbox, acceptPrivacy && styles.checkboxChecked]}>
                  {acceptPrivacy && <Check size={16} color="#FFFFFF" />}
                </View>
                <Text style={styles.checkboxLabel}>
                  {t('auth.acceptPrivacy')}{' '}
                  <Text 
                    style={styles.linkText}
                    onPress={(e) => {
                      e.stopPropagation();
                      router.push({ pathname: '/legal-documents', params: { doc: 'privacy' } });
                    }}
                  >
                    {t('auth.privacyPolicy')}
                  </Text>
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.checkboxRow} 
                onPress={() => setAcceptTerms(!acceptTerms)}
                testID="accept-terms-checkbox"
              >
                <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
                  {acceptTerms && <Check size={16} color="#FFFFFF" />}
                </View>
                <Text style={styles.checkboxLabel}>
                  {t('auth.acceptTerms')}{' '}
                  <Text 
                    style={styles.linkText}
                    onPress={(e) => {
                      e.stopPropagation();
                      router.push({ pathname: '/legal-documents', params: { doc: 'terms' } });
                    }}
                  >
                    {t('auth.termsOfService')}
                  </Text>
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.checkboxRow} 
                onPress={() => setAcceptCookies(!acceptCookies)}
                testID="accept-cookies-checkbox"
              >
                <View style={[styles.checkbox, acceptCookies && styles.checkboxChecked]}>
                  {acceptCookies && <Check size={16} color="#FFFFFF" />}
                </View>
                <Text style={styles.checkboxLabel}>
                  {t('auth.acceptCookies')}{' '}
                  <Text 
                    style={styles.linkText}
                    onPress={(e) => {
                      e.stopPropagation();
                      router.push({ pathname: '/legal-documents', params: { doc: 'cookies' } });
                    }}
                  >
                    {t('auth.cookiePolicy')}
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>

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
        </KeyboardAvoidingView>

        <ModalError
          visible={errorModal.visible}
          onClose={() => setErrorModal({ visible: false, message: '' })}
          title={t('common.error')}
          message={errorModal.message}
          testID="register-error-modal"
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F0',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerFlagButton: {
    paddingVertical: 2,
    paddingRight: 8,
  },
  headerTitleText: {
    fontSize: 17,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  flagContainer: {
    width: 32,
    height: 22,
    borderRadius: 4,
    overflow: 'hidden',
  },
  flagSvg: {
    borderRadius: 4,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 42,
    fontWeight: '900' as const,
    color: Colors.orange,
    marginBottom: 6,
    letterSpacing: -1,
    textShadowColor: 'rgba(255, 138, 0, 0.12)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 15,
    color: '#8B7355',
    fontWeight: '500' as const,
  },
  form: {
    gap: 18,
  },
  registerButton: {
    marginTop: 8,
    height: 54,
    borderRadius: 16,
    shadowColor: Colors.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  fieldHint: {
    fontSize: 11,
    color: '#A0826D',
    marginTop: -10,
    fontStyle: 'italic' as const,
  },
  datePickerContainer: {
    gap: 8,
  },
  datePickerLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#5C4A3A',
    marginBottom: 4,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8DDD0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  datePickerText: {
    fontSize: 14,
    color: '#5C4A3A',
    flex: 1,
  },
  passwordRequirements: {
    marginTop: -10,
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8DDD0',
  },
  requirementsTitle: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#5C4A3A',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D1C4B8',
    marginRight: 10,
  },
  indicatorValid: {
    backgroundColor: Colors.success,
  },
  requirementText: {
    fontSize: 12,
    color: '#8B7355',
  },
  requirementValid: {
    color: Colors.success,
    fontWeight: '600' as const,
  },
  passwordHint: {
    fontSize: 11,
    color: '#A0826D',
    marginTop: 8,
    fontStyle: 'italic' as const,
  },
  legalSection: {
    marginTop: 12,
  },
  legalTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#5C4A3A',
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1C4B8',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: Colors.orange,
    borderColor: Colors.orange,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 12,
    color: '#5C4A3A',
    lineHeight: 18,
  },
  linkText: {
    color: Colors.orange,
    fontWeight: '700' as const,
    textDecorationLine: 'underline' as const,
  },
});
