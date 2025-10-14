import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { LogOut, ScanLine } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Colors from '@/constants/colors';

export default function MerchantScreen() {
  const router = useRouter();
  const { user, token, logout } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [lastScan, setLastScan] = useState<string | null>(null);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (!token || lastScan === data) return;

    setLastScan(data);
    setScanning(false);

    try {
      const result = await api.qr.validate(token, data);
      if (result.success) {
        Alert.alert('Success', result.message);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to validate QR code');
    } finally {
      setTimeout(() => setLastScan(null), 2000);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.text}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Card style={styles.permissionCard}>
            <Text style={styles.title}>Camera Permission</Text>
            <Text style={styles.text}>
              We need camera access to scan QR codes
            </Text>
            <Button
              title="Grant Permission"
              onPress={requestPermission}
              style={styles.button}
            />
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Merchant</Text>
            <Text style={styles.username}>{user?.username}</Text>
          </View>
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="outline"
            size="small"
            testID="logout-button"
          />
        </View>

        {scanning ? (
          <View style={styles.cameraContainer}>
            {Platform.OS !== 'web' && (
              <CameraView
                style={styles.camera}
                facing="back"
                onBarcodeScanned={handleBarCodeScanned}
                barcodeScannerSettings={{
                  barcodeTypes: ['qr'],
                }}
              />
            )}
            {Platform.OS === 'web' && (
              <View style={styles.webCameraPlaceholder}>
                <Text style={styles.webCameraText}>
                  Camera scanning not available on web
                </Text>
              </View>
            )}
            <View style={styles.scanOverlay}>
              <View style={styles.scanFrame} />
            </View>
            <Button
              title="Cancel"
              onPress={() => setScanning(false)}
              variant="outline"
              style={styles.cancelButton}
            />
          </View>
        ) : (
          <View style={styles.content}>
            <Card style={styles.infoCard}>
              <ScanLine size={64} color={Colors.orange} />
              <Text style={styles.infoTitle}>Scan QR Codes</Text>
              <Text style={styles.infoText}>
                Tap the button below to start scanning customer QR codes for
                drink validation
              </Text>
            </Card>
            <Button
              title="Start Scanning"
              onPress={() => setScanning(true)}
              size="large"
              testID="start-scan-button"
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  greeting: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  username: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text.primary,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  permissionCard: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    marginTop: 12,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  webCameraPlaceholder: {
    flex: 1,
    backgroundColor: Colors.text.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webCameraText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: Colors.orange,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  cancelButton: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  infoCard: {
    alignItems: 'center',
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginTop: 20,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
