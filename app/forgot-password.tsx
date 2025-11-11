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
import { useRouter, Stack } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { FormInput } from '@/components/Form';
import Button from '@/components/Button';
import Colors from '@/constants/colors';
import { api } from '@/services/api';
import { ModalSuccess, ModalError } from '@/components/ModalKit';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  
  const [step, setStep] = useState<'request' | 'verify' | 'reset'>('request');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [recoveryType, setRecoveryType] = useState<'email' | 'phone'>('email');
  
  const [successModal, setSuccessModal] = useState({ visible: false, message: '' });
  const [errorModal, setErrorModal] = useState({ visible: false, message: '' });

  const handleRequestCode = async () => {
    if (!emailOrPhone.trim()) {
      setErrorModal({ visible: true, message: t('auth.enterEmailOrPhone') });
      return;
    }

    setLoading(true);
    try {
      const response = await api.auth.sendPasswordRecoveryCode(emailOrPhone);
      if (response.success && response.userId) {
        setUserId(response.userId);
        setRecoveryType(response.type || 'email');
        setStep('verify');
        
        // In production, don't show the code. For development/testing:
        if (response.code) {
          setSuccessModal({ 
            visible: true, 
            message: `${t('auth.recoveryCodeSent')} (Dev: ${response.code})` 
          });
        } else {
          setSuccessModal({ visible: true, message: t('auth.recoveryCodeSent') });
        }
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

  const handleVerifyCode = async () => {
    if (!recoveryCode.trim()) {
      setErrorModal({ visible: true, message: t('auth.enterRecoveryCode') });
      return;
    }

    if (!newPassword || !confirmPassword) {
      setErrorModal({ visible: true, message: t('validation.fillAllFields') });
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorModal({ visible: true, message: t('validation.passwordsNoMatch') });
      return;
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{10,}$/;
    if (!passwordRegex.test(newPassword)) {
      setErrorModal({ visible: true, message: t('validation.passwordRequirements') });
      return;
    }

    setLoading(true);
    try {
      const response = await api.auth.resetPassword(userId, recoveryCode, newPassword);
      if (response.success) {
        setSuccessModal({ 
          visible: true, 
          message: t('auth.passwordReset') 
        });
        setTimeout(() => {
          router.replace('/login');
        }, 2000);
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
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: t('auth.recoverPassword'),
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
              <ArrowLeft size={24} color={Colors.text.primary} />
            </TouchableOpacity>
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
              <Text style={styles.title}>{t('auth.recoverPassword')}</Text>
              <Text style={styles.subtitle}>
                {step === 'request' 
                  ? (t('language') === 'it' 
                    ? 'Inserisci la tua email o numero di telefono per ricevere il codice di recupero' 
                    : 'Enter your email or phone number to receive a recovery code')
                  : step === 'verify'
                  ? (t('language') === 'it'
                    ? 'Inserisci il codice ricevuto e la nuova password'
                    : 'Enter the code you received and your new password')
                  : ''}
              </Text>
            </View>

            <View style={styles.form}>
              {step === 'request' && (
                <>
                  <FormInput
                    label={t('auth.enterEmailOrPhone')}
                    value={emailOrPhone}
                    onChangeText={setEmailOrPhone}
                    placeholder={t('language') === 'it' ? 'email@example.com o +39 123 456 7890' : 'email@example.com or +39 123 456 7890'}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    testID="recovery-email-or-phone"
                  />

                  <Button
                    title={t('auth.sendVerificationCode')}
                    onPress={handleRequestCode}
                    loading={loading}
                    testID="send-recovery-code-button"
                  />
                </>
              )}

              {step === 'verify' && (
                <>
                  <FormInput
                    label={t('auth.verificationCode')}
                    value={recoveryCode}
                    onChangeText={setRecoveryCode}
                    placeholder="123456"
                    keyboardType="number-pad"
                    maxLength={6}
                    testID="recovery-code-input"
                  />

                  <FormInput
                    label={t('auth.enterNewPassword')}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder={t('language') === 'it' ? 'Nuova password' : 'New password'}
                    secureTextEntry
                    testID="new-password-input"
                  />

                  <FormInput
                    label={t('auth.confirmNewPassword')}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder={t('language') === 'it' ? 'Conferma nuova password' : 'Confirm new password'}
                    secureTextEntry
                    testID="confirm-new-password-input"
                  />

                  <View style={styles.passwordHint}>
                    <Text style={styles.hintText}>{t('auth.passwordRequirements')}</Text>
                    <Text style={styles.hintText}>• {t('auth.passwordMinLength')}</Text>
                    <Text style={styles.hintText}>• {t('auth.passwordUppercase')}</Text>
                    <Text style={styles.hintText}>• {t('auth.passwordLowercase')}</Text>
                    <Text style={styles.hintText}>• {t('auth.passwordDigit')}</Text>
                    <Text style={styles.hintText}>• {t('auth.passwordSpecial')}</Text>
                  </View>

                  <Button
                    title={t('auth.resetPassword')}
                    onPress={handleVerifyCode}
                    loading={loading}
                    testID="reset-password-button"
                  />

                  <Button
                    title={t('auth.resendCode')}
                    onPress={handleRequestCode}
                    variant="outline"
                    disabled={loading}
                    testID="resend-code-button"
                  />
                </>
              )}

              <Button
                title={t('auth.backToLogin')}
                onPress={() => router.back()}
                variant="outline"
                style={{ marginTop: 16 }}
                testID="back-to-login-button"
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        <ModalSuccess
          visible={successModal.visible}
          onClose={() => setSuccessModal({ visible: false, message: '' })}
          title={t('common.success')}
          message={successModal.message}
        />

        <ModalError
          visible={errorModal.visible}
          onClose={() => setErrorModal({ visible: false, message: '' })}
          title={t('common.error')}
          message={errorModal.message}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  keyboardAvoidingView: {
    flex: 1,
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
    textAlign: 'center',
  },
  form: {
    marginBottom: 32,
  },
  passwordHint: {
    backgroundColor: Colors.cream,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    marginTop: -12,
  },
  hintText: {
    fontSize: 12,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
});
