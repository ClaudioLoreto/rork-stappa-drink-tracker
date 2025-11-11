import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Switch,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { User as UserIcon, Lock, Globe, Camera, LogOut, Star, Moon, Sun, AlertCircle, FileText, HelpCircle, ChevronRight, Volume2 } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemeColors } from '@/hooks/useThemeColors';
import { isImageAppropriate } from '@/utils/moderation';
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
  const { isDarkMode, themeMode, setTheme } = useTheme();
  const colors = useThemeColors();

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [soundEnabled, setSoundEnabled] = useState(user?.soundEnabled ?? true);

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
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      
      // Validate image for inappropriate content
      if (asset.base64) {
        const dataUri = `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`;
        const { isAppropriate, reason } = await isImageAppropriate(dataUri);
        
        if (!isAppropriate) {
          Alert.alert(
            t('common.error'),
            t('reviews.inappropriateImage') + '\n' + (reason || t('reviews.inappropriateContent'))
          );
          return;
        }
      }
      
      setProfilePicture(asset.uri);
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

  const handleChangeTheme = async (newTheme: 'light' | 'dark') => {
    await setTheme(newTheme);
    setShowThemeModal(false);
    setSuccessModal({ visible: true, message: t('settings.themeChangeSuccess') });
  };

  const handleToggleSound = async (value: boolean) => {
    if (!user) return;
    setSoundEnabled(value);
    try {
      const updatedUser = {
        ...user,
        soundEnabled: value,
      };
      await updateUser(updatedUser);
    } catch {
      // Silent fail, just revert the switch
      setSoundEnabled(!value);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  // Dynamic styles based on theme
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    safeArea: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 20,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 8,
      marginBottom: 12,
      paddingHorizontal: 4,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '600' as const,
      color: colors.text.secondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    profileSection: {
      alignItems: 'center',
      marginBottom: 24,
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
      backgroundColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cameraIcon: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: colors.orange,
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: colors.background.card,
    },
    usernameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    profileName: {
      fontSize: 24,
      fontWeight: '800' as const,
      color: colors.text.primary,
    },
    seniorBadge: {
      backgroundColor: colors.orange,
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    menuCard: {
      marginBottom: 24,
      backgroundColor: colors.background.card,
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
      backgroundColor: colors.amber + '40',
      justifyContent: 'center',
      alignItems: 'center',
    },
    menuItemText: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: colors.text.primary,
    },
    menuItemValue: {
      fontSize: 14,
      color: colors.text.secondary,
    },
    menuDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 8,
    },
    logoutCard: {
      paddingVertical: 4,
    },
    logoutMenuItem: {
      paddingVertical: 8,
    },
    logoutIcon: {
      backgroundColor: colors.error + '20',
    },
    logoutText: {
      color: colors.error,
    },
    modalContent: {
      padding: 16,
    },
    languageOptions: {
      gap: 12,
      padding: 16,
    },
    languageOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 12,
      backgroundColor: colors.background.primary,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    languageOptionActive: {
      backgroundColor: colors.orange + '20',
      borderColor: colors.orange,
    },
    languageText: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: colors.text.secondary,
    },
    languageTextActive: {
      color: colors.orange,
      fontWeight: '700' as const,
    },
  });

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: t('settings.title'), 
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.background.card,
        },
        headerTintColor: colors.text.primary,
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
                  <UserIcon size={48} color={colors.text.secondary} />
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

          {/* Theme Selection Card */}
          <Card style={styles.menuCard}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setShowThemeModal(true)}
              testID="theme-button"
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIcon}>
                  {isDarkMode ? (
                    <Moon size={20} color={colors.orange} />
                  ) : (
                    <Sun size={20} color={colors.orange} />
                  )}
                </View>
                <Text style={styles.menuItemText}>{t('settings.theme')}</Text>
              </View>
              <Text style={styles.languageText}>
                {isDarkMode ? t('settings.darkMode') : t('settings.lightMode')}
              </Text>
            </TouchableOpacity>

            {user?.role === 'USER' && (
              <>
                <View style={styles.menuDivider} />
                <View style={styles.menuItem}>
                  <View style={styles.menuItemLeft}>
                    <View style={styles.menuIcon}>
                      <Volume2 size={20} color={colors.orange} />
                    </View>
                    <Text style={styles.menuItemText}>Effetti Sonori</Text>
                  </View>
                  <Switch
                    value={soundEnabled}
                    onValueChange={handleToggleSound}
                    trackColor={{ false: colors.border, true: colors.orange + '80' }}
                    thumbColor={soundEnabled ? colors.orange : colors.text.secondary}
                    testID="sound-toggle"
                  />
                </View>
              </>
            )}
          </Card>

          {/* Assistenza e Supporto Section */}
          <View style={styles.sectionHeader}>
            <HelpCircle size={18} color={colors.text.secondary} />
            <Text style={styles.sectionTitle}>Assistenza e Supporto</Text>
          </View>

          <Card style={styles.menuCard}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/legal-documents')}
              testID="legal-documents-button"
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIcon}>
                  <FileText size={20} color={colors.orange} />
                </View>
                <Text style={styles.menuItemText}>Documenti Legali</Text>
              </View>
              <ChevronRight size={20} color={colors.text.secondary} />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/report-bug')}
              testID="report-bug-button"
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIcon}>
                  <AlertCircle size={20} color={colors.orange} />
                </View>
                <Text style={styles.menuItemText}>{t('settings.reportBug')}</Text>
              </View>
              <ChevronRight size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </Card>

          <Card style={StyleSheet.flatten([styles.menuCard, styles.logoutCard])}>
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

        <BottomSheet
          visible={showThemeModal}
          onClose={() => setShowThemeModal(false)}
          title={t('settings.theme')}
          testID="theme-modal"
        >
          <View style={styles.languageOptions}>
            <TouchableOpacity
              style={[styles.languageOption, !isDarkMode && styles.languageOptionActive]}
              onPress={() => handleChangeTheme('light')}
              testID="theme-light"
            >
              <Sun size={20} color={colors.orange} style={{ marginRight: 8 }} />
              <Text style={[styles.languageText, !isDarkMode && styles.languageTextActive]}>
                {t('settings.lightMode')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.languageOption, isDarkMode && styles.languageOptionActive]}
              onPress={() => handleChangeTheme('dark')}
              testID="theme-dark"
            >
              <Moon size={20} color={colors.orange} style={{ marginRight: 8 }} />
              <Text style={[styles.languageText, isDarkMode && styles.languageTextActive]}>
                {t('settings.darkMode')}
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
