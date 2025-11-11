import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, AlertCircle, Send, ImagePlus, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { api } from '@/services/api';
import Colors from '@/constants/colors';
import { BugReport } from '@/types';
import Constants from 'expo-constants';

export default function ReportBugScreen() {
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<BugReport['category']>('UI');
  const [severity, setSeverity] = useState<BugReport['severity']>('MEDIUM');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const categories: BugReport['category'][] = ['UI', 'FUNCTIONALITY', 'PERFORMANCE', 'CRASH', 'OTHER'];
  const severities: BugReport['severity'][] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

  const getCategoryLabel = (cat: BugReport['category']) => {
    const labels = {
      UI: t('bugReport.categoryUI'),
      FUNCTIONALITY: t('bugReport.categoryFunctionality'),
      PERFORMANCE: t('bugReport.categoryPerformance'),
      CRASH: t('bugReport.categoryCrash'),
      OTHER: t('bugReport.categoryOther'),
    };
    return labels[cat];
  };

  const getSeverityLabel = (sev: BugReport['severity']) => {
    const labels = {
      LOW: t('bugReport.severityLow'),
      MEDIUM: t('bugReport.severityMedium'),
      HIGH: t('bugReport.severityHigh'),
      CRITICAL: t('bugReport.severityCritical'),
    };
    return labels[sev];
  };

  const getSeverityColor = (sev: BugReport['severity']) => {
    const colors = {
      LOW: '#4CAF50',
      MEDIUM: '#FF9800',
      HIGH: '#FF5722',
      CRITICAL: '#D32F2F',
    };
    return colors[sev];
  };

  const getDeviceInfo = () => {
    return `${Platform.OS} ${Platform.Version} - App v${Constants.expoConfig?.version || '1.0.0'}`;
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t('common.error'),
          'È necessario il permesso per accedere alla galleria'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        setScreenshot(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert(t('common.error'), 'Impossibile selezionare l\'immagine');
    }
  };

  const removeImage = () => {
    setScreenshot(null);
  };

  const handleSubmit = async () => {
    if (!user || !token) return;

    if (!title.trim() || !description.trim()) {
      Alert.alert(t('common.error'), t('validation.fillAllFields'));
      return;
    }

    setLoading(true);
    try {
      await api.bugReports.create(token, {
        userId: user.id,
        title: title.trim(),
        description: description.trim(),
        category,
        severity,
        deviceInfo: getDeviceInfo(),
        appVersion: Constants.expoConfig?.version || '1.0.0',
        screenshots: screenshot ? [screenshot] : [],
      });

      Alert.alert(
        t('common.success'),
        t('bugReport.success'),
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Failed to submit bug report:', error);
      Alert.alert(t('common.error'), t('bugReport.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>{t('bugReport.title')}</Text>
          <Text style={styles.headerSubtitle}>{t('bugReport.subtitle')}</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.label}>{t('bugReport.reportTitle')} *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder={t('bugReport.reportTitlePlaceholder')}
            placeholderTextColor={Colors.text.secondary}
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>{t('bugReport.description')} *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder={t('bugReport.descriptionPlaceholder')}
            placeholderTextColor={Colors.text.secondary}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.label}>{t('bugReport.category')}</Text>
          <View style={styles.optionsGrid}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.optionButton,
                  category === cat && styles.optionButtonActive,
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text
                  style={[
                    styles.optionText,
                    category === cat && styles.optionTextActive,
                  ]}
                >
                  {getCategoryLabel(cat)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Severity */}
        <View style={styles.section}>
          <Text style={styles.label}>{t('bugReport.severity')}</Text>
          <View style={styles.optionsRow}>
            {severities.map((sev) => (
              <TouchableOpacity
                key={sev}
                style={[
                  styles.severityButton,
                  severity === sev && {
                    backgroundColor: getSeverityColor(sev) + '20',
                    borderColor: getSeverityColor(sev),
                  },
                ]}
                onPress={() => setSeverity(sev)}
              >
                <View
                  style={[
                    styles.severityDot,
                    { backgroundColor: getSeverityColor(sev) },
                  ]}
                />
                <Text
                  style={[
                    styles.severityText,
                    severity === sev && { color: getSeverityColor(sev) },
                  ]}
                >
                  {getSeverityLabel(sev)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Screenshot Upload */}
        <View style={styles.section}>
          <Text style={styles.label}>
            {t('bugReport.screenshot')} ({t('common.optional')})
          </Text>
          {screenshot ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: screenshot }} style={styles.imagePreview} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={removeImage}
              >
                <X size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <ImagePlus size={24} color={Colors.orange} />
              <Text style={styles.uploadText}>{t('bugReport.addScreenshot')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Device Info Preview */}
        <View style={styles.infoBox}>
          <AlertCircle size={16} color={Colors.text.secondary} />
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.infoTitle}>{t('bugReport.deviceInfo')}</Text>
            <Text style={styles.infoText}>{getDeviceInfo()}</Text>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Send size={20} color="#FFFFFF" />
          <Text style={styles.submitButtonText}>
            {loading ? t('common.loading') : t('bugReport.submit')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Colors.text.primary,
  },
  textArea: {
    minHeight: 120,
    paddingTop: 14,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionButtonActive: {
    backgroundColor: Colors.orange + '20',
    borderColor: Colors.orange,
  },
  optionText: {
    fontSize: 13,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  optionTextActive: {
    color: Colors.orange,
    fontWeight: '600',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  severityButton: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  severityText: {
    fontSize: 13,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: Colors.border + '30',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 11,
    color: Colors.text.secondary,
    lineHeight: 16,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.border,
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  uploadText: {
    fontSize: 14,
    color: Colors.orange,
    fontWeight: '600',
  },
  imagePreviewContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: Colors.border,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D32F2F',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.orange,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
