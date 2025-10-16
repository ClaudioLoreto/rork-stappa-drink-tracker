import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { User as UserIcon, Lock, Globe, Camera, LogOut, Star } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Button from '@/components/Button';
import Card from '@/components/Card';
import { FormInput } from '@/components/Form';
import BottomSheet from '@/components/BottomSheet';
import Colors from '@/constants/colors';
import { ModalError, ModalSuccess } from '@/components/ModalKit';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, token, updateUser, logout } = useAuth();
  const { language, changeLanguage, t } = useLanguage();

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorModal, setErrorModal] = useState({ visible: false, message: '' });
  const [successModal, setSuccessModal] = useState({ visible: false, message: '' });

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      setErrorModal({ visible: true, message: t('settings.galleryPermissionRequired') });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setProfilePicture(result.assets[0].uri);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user || !token) return;

    if (!username) {
      setErrorModal({ visible: true, message: t('validation.fillAllFields') });
      return;
    }

    if (!email && !phone) {
      setErrorModal({ visible: true, message: t('validation.emailOrPhoneRequired') });
      return;
    }

    setLoading(true);
    try {
      const updatedUser = {
        ...user,
        firstName,
        lastName,
        username,
        email,
        phone,
        profilePicture,
      };

      await updateUser(updatedUser);
      setSuccessModal({ visible: true, message: t('settings.updateSuccess') });
      setShowProfileModal(false);
    } catch {
      setErrorModal({ visible: true, message: t('settings.updateFailed') });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setErrorModal({ visible: true, message: t('validation.fillAllFields') });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorModal({ visible: true, message: t('validation.passwordsNoMatch') });
      return;
    }

    if (newPassword.length < 10) {
      setErrorModal({ visible: true, message: t('validation.passwordRequirements') });
      return;
    }

    setLoading(true);
    try {
      setSuccessModal({ visible: true, message: t('settings.passwordChangeSuccess') });
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch {
      setErrorModal({ visible: true, message: t('settings.passwordChangeFailed') });
    } finally {
      setLoading(false);
    }
  };

  const handleChangeLanguage = async (lang: 'it' | 'en') => {
    await changeLanguage(lang);
    setShowLanguageModal(false);
    setSuccessModal({ visible: true, message: t('settings.languageChangeSuccess') });
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: t('settings.title'), 
        headerShown: true,
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTintColor: Colors.text.primary,
      }} />
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.profileSection}>
            <TouchableOpacity
              onPress={handlePickImage}
              style={styles.avatarContainer}
              testID="profile-picture-button"
            >
              {profilePicture ? (
                <Image source={{ uri: profilePicture }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <UserIcon size={48} color={Colors.text.secondary} />
                </View>
              )}
              <View style={styles.cameraIcon}>
                <Camera size={16} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            <View style={styles.usernameRow}>
              <Text style={styles.profileName}>{user?.username}</Text>
              {user?.role === 'SENIOR_MERCHANT' && (
                <View style={styles.seniorBadge}>
                  <Star size={14} color="#FFFFFF" fill="#FFFFFF" />
                </View>
              )}
            </View>
          </View>

          <Card style={styles.menuCard}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setShowProfileModal(true)}
              testID="update-profile-button"
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIcon}>
                  <UserIcon size={20} color={Colors.orange} />
                </View>
                <Text style={styles.menuItemText}>{t('settings.updateProfile')}</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setShowPasswordModal(true)}
              testID="change-password-button"
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIcon}>
                  <Lock size={20} color={Colors.orange} />
                </View>
                <Text style={styles.menuItemText}>{t('settings.changePassword')}</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setShowLanguageModal(true)}
              testID="change-language-button"
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIcon}>
                  <Globe size={20} color={Colors.orange} />
                </View>
                <Text style={styles.menuItemText}>{t('settings.language')}</Text>
              </View>
              <Text style={styles.menuItemValue}>
                {language === 'it' ? t('settings.italian') : t('settings.english')}
              </Text>
            </TouchableOpacity>
          </Card>

          <Card style={[styles.menuCard, styles.logoutCard]}>
            <TouchableOpacity
              style={[styles.menuItem, styles.logoutMenuItem]}
              onPress={handleLogout}
              testID="logout-button"
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, styles.logoutIcon]}>
                  <LogOut size={20} color={Colors.error} />
                </View>
                <Text style={[styles.menuItemText, styles.logoutText]}>{t('common.logout')}</Text>
              </View>
            </TouchableOpacity>
          </Card>

        </ScrollView>

        <BottomSheet
          visible={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          title={t('settings.updateProfile')}
          testID="profile-modal"
        >
          <ScrollView style={styles.modalContent}>
            <FormInput
              label={t('auth.firstName')}
              value={firstName}
              onChangeText={setFirstName}
              placeholder={t('auth.enterFirstName')}
              testID="first-name"
            />
            <FormInput
              label={t('auth.lastName')}
              value={lastName}
              onChangeText={setLastName}
              placeholder={t('auth.enterLastName')}
              testID="last-name"
            />
            <FormInput
              label={`${t('auth.username')} *`}
              value={username}
              onChangeText={setUsername}
              placeholder={t('auth.enterUsername')}
              autoCapitalize="none"
              testID="username"
            />
            <FormInput
              label={t('auth.email')}
              value={email}
              onChangeText={setEmail}
              placeholder={t('auth.enterEmail')}
              keyboardType="email-address"
              autoCapitalize="none"
              testID="email"
            />
            <FormInput
              label={t('auth.phone')}
              value={phone}
              onChangeText={setPhone}
              placeholder={t('auth.enterPhone')}
              keyboardType="phone-pad"
              testID="phone"
            />
            <Button
              title={t('common.save')}
              onPress={handleUpdateProfile}
              loading={loading}
              testID="save-profile-button"
            />
          </ScrollView>
        </BottomSheet>

        <BottomSheet
          visible={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          title={t('settings.changePassword')}
          testID="password-modal"
        >
          <View style={styles.modalContent}>
            <FormInput
              label={t('settings.currentPassword')}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder={t('auth.enterCurrentPassword')}
              secureTextEntry
              testID="current-password"
            />
            <FormInput
              label={t('settings.newPassword')}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder={t('auth.enterNewPassword')}
              secureTextEntry
              testID="new-password"
            />
            <FormInput
              label={t('auth.confirmPassword')}
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              placeholder={t('auth.confirmNewPassword')}
              secureTextEntry
              testID="confirm-new-password"
            />
            <Button
              title={t('common.save')}
              onPress={handleChangePassword}
              loading={loading}
              testID="save-password-button"
            />
          </View>
        </BottomSheet>

        <BottomSheet
          visible={showLanguageModal}
          onClose={() => setShowLanguageModal(false)}
          title={t('settings.language')}
          testID="language-modal"
        >
          <View style={styles.languageOptions}>
            <TouchableOpacity
              style={[styles.languageOption, language === 'it' && styles.languageOptionActive]}
              onPress={() => handleChangeLanguage('it')}
              testID="language-it"
            >
              <Text style={[styles.languageText, language === 'it' && styles.languageTextActive]}>
                🇮🇹 {t('settings.italian')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.languageOption, language === 'en' && styles.languageOptionActive]}
              onPress={() => handleChangeLanguage('en')}
              testID="language-en"
            >
              <Text style={[styles.languageText, language === 'en' && styles.languageTextActive]}>
                🇬🇧 {t('settings.english')}
              </Text>
            </TouchableOpacity>
          </View>
        </BottomSheet>

        <ModalError
          visible={errorModal.visible}
          onClose={() => setErrorModal({ visible: false, message: '' })}
          title={t('common.error')}
          message={errorModal.message}
          testID="settings-error-modal"
        />

        <ModalSuccess
          visible={successModal.visible}
          onClose={() => setSuccessModal({ visible: false, message: '' })}
          title={t('common.success')}
          message={successModal.message}
          testID="settings-success-modal"
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.orange,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text.primary,
  },
  seniorBadge: {
    backgroundColor: Colors.orange,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuCard: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.amber + '40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  menuItemValue: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  modalContent: {
    maxHeight: 500,
  },
  languageOptions: {
    paddingVertical: 12,
  },
  languageOption: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  languageOptionActive: {
    borderColor: Colors.orange,
    backgroundColor: Colors.amber + '20',
  },
  languageText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  languageTextActive: {
    color: Colors.orange,
  },
  logoutIcon: {
    backgroundColor: Colors.error + '20',
  },
  logoutText: {
    color: Colors.error,
  },
  logoutCard: {
    paddingVertical: 0,
  },
  logoutMenuItem: {
    paddingVertical: 10,
  },
});
