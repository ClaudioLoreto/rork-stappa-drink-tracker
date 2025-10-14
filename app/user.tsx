import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { LogOut, Gift } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import Button from '@/components/Button';
import Card from '@/components/Card';
import BeerMug from '@/components/BeerMug';
import Modal from '@/components/Modal';
import Colors from '@/constants/colors';
import { QRCodeData } from '@/types';

export default function UserScreen() {
  const router = useRouter();
  const { user, token, logout } = useAuth();
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [qrData, setQrData] = useState<QRCodeData | null>(null);
  const [qrType, setQrType] = useState<'VALIDATION' | 'BONUS'>('VALIDATION');

  const loadProgress = useCallback(async () => {
    if (!token || !user) return;

    try {
      const userProgress = await api.progress.get(token, user.id);
      setProgress(userProgress?.drinksCount || 0);
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  }, [token, user]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const handleGenerateQR = async (type: 'VALIDATION' | 'BONUS') => {
    if (!token || !user) return;

    if (type === 'BONUS' && progress < 10) {
      Alert.alert('Not Ready', 'You need 10 drinks to get a free one!');
      return;
    }

    setLoading(true);
    try {
      const data = await api.qr.generate(token, user.id, type);
      setQrData(data);
      setQrType(type);
      setQrModalVisible(true);

      setTimeout(() => {
        setQrModalVisible(false);
        setQrData(null);
      }, 5 * 60 * 1000);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Hello,</Text>
              <Text style={styles.username}>{user?.username}</Text>
            </View>
            <TouchableOpacity
              onPress={handleLogout}
              style={styles.logoutButton}
              testID="logout-button"
            >
              <LogOut size={20} color={Colors.orange} />
            </TouchableOpacity>
          </View>

          <Card style={styles.progressCard}>
            <Text style={styles.cardTitle}>Your Progress</Text>
            <BeerMug progress={progress} testID="beer-mug" />
            <View style={styles.progressInfo}>
              <Text style={styles.progressText}>
                {progress} / 10 drinks
              </Text>
              {progress === 10 && (
                <View style={styles.badge}>
                  <Gift size={16} color="#FFFFFF" />
                  <Text style={styles.badgeText}>Free drink ready!</Text>
                </View>
              )}
            </View>
          </Card>

          <Card style={styles.actionsCard}>
            <Text style={styles.cardTitle}>Actions</Text>
            <Button
              title="Validate Drink"
              onPress={() => handleGenerateQR('VALIDATION')}
              loading={loading}
              disabled={progress >= 10}
              style={styles.actionButton}
              testID="validate-drink-button"
            />
            {progress === 10 && (
              <Button
                title="Get Free Drink"
                onPress={() => handleGenerateQR('BONUS')}
                loading={loading}
                variant="secondary"
                testID="get-free-drink-button"
              />
            )}
          </Card>

          <Card style={styles.infoCard}>
            <Text style={styles.infoTitle}>How it works</Text>
            <Text style={styles.infoText}>
              1. Buy a drink at a participating bar
            </Text>
            <Text style={styles.infoText}>
              2. Tap &quot;Validate Drink&quot; to generate a QR code
            </Text>
            <Text style={styles.infoText}>
              3. Show the QR code to the merchant
            </Text>
            <Text style={styles.infoText}>
              4. After 10 drinks, get one free!
            </Text>
          </Card>
        </ScrollView>

        <Modal
          visible={qrModalVisible}
          onClose={() => setQrModalVisible(false)}
          title={qrType === 'VALIDATION' ? 'Validate Drink' : 'Free Drink'}
          testID="qr-modal"
        >
          <View style={styles.qrContainer}>
            {qrData && (
              <>
                <QRCode value={qrData.token} size={200} />
                <Text style={styles.qrInfo}>
                  Show this QR code to the merchant
                </Text>
                <Text style={styles.qrExpiry}>
                  Expires in 5 minutes
                </Text>
              </>
            )}
          </View>
        </Modal>
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
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  username: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.text.primary,
  },
  logoutButton: {
    width: 44,
    height: 44,
    padding: 0,
  },
  progressCard: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 20,
  },
  progressInfo: {
    alignItems: 'center',
    marginTop: 20,
  },
  progressText: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.orange,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '600' as const,
    fontSize: 14,
  },
  actionsCard: {
    marginBottom: 20,
  },
  actionButton: {
    marginBottom: 12,
  },
  infoCard: {
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  qrContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  qrInfo: {
    fontSize: 16,
    color: Colors.text.primary,
    marginTop: 20,
    textAlign: 'center',
  },
  qrExpiry: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 8,
    textAlign: 'center',
  },
});
