import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import {
  Camera as CameraIcon,
  X,
  FlipHorizontal,
  Lightbulb,
  Check,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useBar } from '@/contexts/BarContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useThemeColors } from '@/hooks/useThemeColors';
import { api } from '@/services/api';
import { ModalError } from '@/components/ModalKit';
import Colors from '@/constants/colors';

export default function StockCameraScreen() {
  const router = useRouter();
  const { user, token } = useAuth();
  const { selectedBar } = useBar();
  const { t } = useLanguage();
  const colors = useThemeColors();
  const cameraRef = useRef<CameraView>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorModal, setErrorModal] = useState({ visible: false, message: '' });

  // Check permissions
  const canManageStock =
    user?.role === 'SENIOR_MERCHANT' || (user?.role === 'MERCHANT' && user?.canManageStock);

  const hasStockManagementEnabled = selectedBar?.hasStockManagement ?? false;

  useEffect(() => {
    if (!canManageStock || !hasStockManagementEnabled) {
      Alert.alert(
        t('common.error'), 
        !canManageStock ? t('common.noPermission') : 'Gestione stock non abilitata per questo esercizio'
      );
      router.back();
    }
  }, [canManageStock, hasStockManagementEnabled]);

  if (!permission) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <ActivityIndicator size="large" color={colors.orange} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <Stack.Screen
          options={{
            title: 'Fotocamera Inventario',
            headerShown: true,
            headerStyle: {
              backgroundColor: colors.background.card,
            },
            headerTintColor: colors.text.primary,
          }}
        />
        <View style={styles.permissionContainer}>
          <CameraIcon size={64} color={colors.text.secondary} />
          <Text style={[styles.permissionTitle, { color: colors.text.primary }]}>
            Permesso Fotocamera Richiesto
          </Text>
          <Text style={[styles.permissionText, { color: colors.text.secondary }]}>
            Per utilizzare la funzione di riconoscimento automatico degli articoli, è necessario
            concedere l'accesso alla fotocamera.
          </Text>
          <TouchableOpacity
            style={[styles.permissionButton, { backgroundColor: colors.orange }]}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Concedi Permesso</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
            <Text style={[styles.cancelButtonText, { color: colors.text.secondary }]}>
              Annulla
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    setFlash((current) => !current);
  };

  const takePicture = async () => {
    if (!cameraRef.current || !token || !selectedBar || capturing || uploading) return;

    try {
      setCapturing(true);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
      });

      if (!photo || !photo.uri) {
        throw new Error('Failed to capture photo');
      }

      // Upload and analyze
      setUploading(true);

      const stockPhoto = await api.stockPhotos.upload(
        token,
        selectedBar.id,
        photo.uri,
        user?.id || ''
      );

      // Trigger AI analysis
      await api.stockPhotos.analyze(token, stockPhoto.id);

      // Navigate to review screen with type assertion for dynamic route
      router.push(`/merchant/stock/review/${stockPhoto.id}` as any);
    } catch (error) {
      console.error('Camera error:', error);
      setErrorModal({
        visible: true,
        message: 'Errore durante la cattura o l\'analisi della foto. Riprova.',
      });
    } finally {
      setCapturing(false);
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Scatta Foto Inventario',
          headerShown: false,
        }}
      />

      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        enableTorch={flash}
      >
        {/* Top Bar */}
        <SafeAreaView style={styles.topBar} edges={['top']}>
          <TouchableOpacity style={styles.topButton} onPress={() => router.back()}>
            <View style={styles.iconCircle}>
              <X size={24} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <View style={styles.topRight}>
            <TouchableOpacity style={styles.topButton} onPress={toggleFlash}>
              <View style={[styles.iconCircle, flash && styles.iconCircleActive]}>
                <Lightbulb size={24} color="#FFFFFF" fill={flash ? '#FFFFFF' : 'none'} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.topButton} onPress={toggleCameraFacing}>
              <View style={styles.iconCircle}>
                <FlipHorizontal size={24} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* Center Guidelines */}
        <View style={styles.guidelines}>
          <View style={styles.guideline} />
          <View style={[styles.guideline, styles.guidelineHorizontal]} />
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <View style={styles.instructionsBox}>
            <Text style={styles.instructionsText}>
              📦 Inquadra gli articoli da inventariare
            </Text>
            <Text style={styles.instructionsSubtext}>
              Posiziona i prodotti al centro dell'inquadratura
            </Text>
          </View>
        </View>

        {/* Bottom Controls */}
        <SafeAreaView style={styles.bottomBar} edges={['bottom']}>
          {uploading ? (
            <View style={styles.uploadingContainer}>
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text style={styles.uploadingText}>Analisi in corso...</Text>
            </View>
          ) : (
            <>
              <View style={styles.bottomLeft} />
              
              <TouchableOpacity
                style={[styles.captureButton, capturing && styles.captureButtonDisabled]}
                onPress={takePicture}
                disabled={capturing || uploading}
              >
                <View style={styles.captureButtonInner}>
                  {capturing ? (
                    <ActivityIndicator size="small" color={Colors.orange} />
                  ) : (
                    <CameraIcon size={32} color={Colors.orange} />
                  )}
                </View>
              </TouchableOpacity>

              <View style={styles.bottomRight} />
            </>
          )}
        </SafeAreaView>
      </CameraView>

      <ModalError
        visible={errorModal.visible}
        onClose={() => setErrorModal({ visible: false, message: '' })}
        title={t('common.error')}
        message={errorModal.message}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
  },
  permissionButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 12,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700' as const,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  topRight: {
    flexDirection: 'row',
    gap: 12,
  },
  topButton: {
    padding: 4,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleActive: {
    backgroundColor: Colors.orange,
  },
  guidelines: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '80%',
    height: '60%',
    marginLeft: '-40%',
    marginTop: '-30%',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 12,
  },
  guideline: {
    position: 'absolute',
    width: 1,
    height: '100%',
    left: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  guidelineHorizontal: {
    width: '100%',
    height: 1,
    top: '50%',
    left: 0,
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: 140,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  instructionsBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    maxWidth: 400,
  },
  instructionsText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700' as const,
    textAlign: 'center',
    marginBottom: 4,
  },
  instructionsSubtext: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    textAlign: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 32,
    paddingTop: 20,
  },
  bottomLeft: {
    flex: 1,
  },
  bottomRight: {
    flex: 1,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: '100%',
    height: '100%',
    borderRadius: 34,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: Colors.orange,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingContainer: {
    flex: 1,
    alignItems: 'center',
    gap: 12,
  },
  uploadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
