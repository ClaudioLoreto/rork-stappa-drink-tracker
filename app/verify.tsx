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
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { FormInput } from '@/components/Form';
import Button from '@/components/Button';
import Colors from '@/constants/colors';
import { api } from '@/services/api';
import { ModalSuccess, ModalError } from '@/components/ModalKit';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

export default function VerifyScreen() {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: 'email' | 'phone' }>();
  const { t } = useLanguage();
  const { user, updateUser } = useAuth();
  
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  
  const [successModal, setSuccessModal] = useState({ visible: false, message: '' });
  const [errorModal, setErrorModal] = useState({ visible: false, message: '' });

  const verificationType = type || 'email';

  const handleSendCode = async () => {
    if (!user) {
      setErrorModal({ visible: true, message: t('common.error') });
      return;
    }

    setLoading(true);
    try {
      const response = await api.auth.sendVerificationCode(user.id, verificationType);
      
      if (response.success) {
        setCodeSent(true);
        
        // In production, don't show the code. For development/testing:
        if (response.code) {
          setSuccessModal({ 
            visible: true, 
            message: `${t('auth.verificationCodeSent')} (Dev: ${response.code})` 
          });
        } else {
          setSuccessModal({ visible: true, message: t('auth.verificationCodeSent') });
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
    if (!user) {
      setErrorModal({ visible: true, message: t('common.error') });
      return;
    }

    if (!code.trim()) {
      setErrorModal({ visible: true, message: t('auth.enterVerificationCode') });
      return;
    }

    setLoading(true);
    try {
      const response = await api.auth.verifyCode(user.id, code, verificationType);
      
      if (response.success && response.user) {
        await updateUser(response.user);
        
        setSuccessModal({ 
          visible: true, 
          message: verificationType === 'email' ? t('auth.emailVerified') : t('auth.phoneVerified')
        });
        
        setTimeout(() => {
          router.back();
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
          headerTitle: verificationType === 'email' ? t('auth.verifyEmail') : t('auth.verifyPhone'),
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
              <Text style={styles.title}>
                {verificationType === 'email' ? t('auth.verifyEmail') : t('auth.verifyPhone')}
              </Text>
              <Text style={styles.subtitle}>
                {verificationType === 'email' 
                  ? (t('language') === 'it' 
                    ? `Ti invieremo un codice di verifica a: ${user?.email || ''}` 
                    : `We'll send a verification code to: ${user?.email || ''}`)
                  : (t('language') === 'it'
                    ? `Ti invieremo un codice OTP a: ${user?.phone || ''}`
                    : `We'll send an OTP code to: ${user?.phone || ''}`)}
              </Text>
            </View>

            <View style={styles.form}>
              {!codeSent ? (
                <>
                  <Text style={styles.info}>
                    {t('language') === 'it'
                      ? 'Premi il pulsante qui sotto per ricevere il codice di verifica.'
                      : 'Press the button below to receive your verification code.'}
                  </Text>
                  
                  <Button
                    title={t('auth.sendVerificationCode')}
                    onPress={handleSendCode}
                    loading={loading}
                    testID="send-code-button"
                  />
                </>
              ) : (
                <>
                  <FormInput
                    label={t('auth.verificationCode')}
                    value={code}
                    onChangeText={setCode}
                    placeholder="123456"
                    keyboardType="number-pad"
                    maxLength={6}
                    testID="verification-code-input"
                  />

                  <Button
                    title={t('common.confirm')}
                    onPress={handleVerifyCode}
                    loading={loading}
                    style={{ marginBottom: 16 }}
                    testID="verify-code-button"
                  />

                  <Button
                    title={t('auth.resendCode')}
                    onPress={handleSendCode}
                    variant="outline"
                    disabled={loading}
                    testID="resend-code-button"
                  />
                </>
              )}

              <Button
                title={t('common.back')}
                onPress={() => router.back()}
                variant="outline"
                style={{ marginTop: 16 }}
                testID="back-button"
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
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    marginBottom: 32,
  },
  info: {
    fontSize: 14,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
});
