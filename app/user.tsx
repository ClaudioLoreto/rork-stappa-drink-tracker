import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { LogOut, Gift, Briefcase } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import Button from '@/components/Button';
import Card from '@/components/Card';
import BeerMug from '@/components/BeerMug';
import Modal from '@/components/Modal';
import BottomSheet from '@/components/BottomSheet';
import { FormInput } from '@/components/Form';
import Colors from '@/constants/colors';
import { QRCodeData } from '@/types';
import { ModalError, ModalInfo, ModalSuccess } from '@/components/ModalKit';

export default function UserScreen() {
  const router = useRouter();
  const { user, token, logout } = useAuth();
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [qrData, setQrData] = useState<QRCodeData | null>(null);
  const [qrType, setQrType] = useState<'VALIDATION' | 'BONUS'>('VALIDATION');
  const [errorModal, setErrorModal] = useState({ visible: false, message: '' });
  const [infoModal, setInfoModal] = useState({ visible: false, message: '' });
  const [successModal, setSuccessModal] = useState({ visible: false, message: '' });
  const [showMerchantModal, setShowMerchantModal] = useState(false);
  const [merchantFormLoading, setMerchantFormLoading] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [vatId, setVatId] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');

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
      setInfoModal({ visible: true, message: 'You need 10 drinks to get a free one!' });
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
      setErrorModal({ visible: true, message: 'Failed to generate QR code' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const handleMerchantRequest = async () => {
    if (!token || !user) return;

    if (!businessName || !businessAddress || !city || !postalCode || !country || !vatId || !phone) {
      setErrorModal({ visible: true, message: 'Please fill in all required fields' });
      return;
    }

    setMerchantFormLoading(true);
    try {
      await api.merchantRequests.create(token, user.id, {
        businessName,
        businessAddress,
        city,
        postalCode,
        country,
        vatId,
        phone,
        description,
      });
      setSuccessModal({ 
        visible: true, 
        message: 'Your merchant request has been submitted successfully! An admin will review it soon.' 
      });
      setShowMerchantModal(false);
      setBusinessName('');
      setBusinessAddress('');
      setCity('');
      setPostalCode('');
      setCountry('');
      setVatId('');
      setPhone('');
      setDescription('');
    } catch (error) {
      setErrorModal({ visible: true, message: 'Failed to submit merchant request' });
    } finally {
      setMerchantFormLoading(false);
    }
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

          <Card style={styles.merchantCard}>
            <Briefcase size={32} color={Colors.orange} />
            <Text style={styles.merchantTitle}>Own a bar?</Text>
            <Text style={styles.merchantText}>
              Join Stappa as a merchant and start validating drinks for your customers
            </Text>
            <Button
              title="Become a Merchant"
              onPress={() => setShowMerchantModal(true)}
              variant="secondary"
              testID="become-merchant-button"
            />
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

        <ModalError
          visible={errorModal.visible}
          onClose={() => setErrorModal({ visible: false, message: '' })}
          title="Error"
          message={errorModal.message}
          testID="user-error-modal"
        />

        <ModalInfo
          visible={infoModal.visible}
          onClose={() => setInfoModal({ visible: false, message: '' })}
          title="Not Ready"
          message={infoModal.message}
          testID="user-info-modal"
        />

        <ModalSuccess
          visible={successModal.visible}
          onClose={() => setSuccessModal({ visible: false, message: '' })}
          title="Success"
          message={successModal.message}
          testID="user-success-modal"
        />

        <BottomSheet
          visible={showMerchantModal}
          onClose={() => setShowMerchantModal(false)}
          title="Become a Merchant"
          testID="merchant-request-modal"
        >
          <ScrollView style={styles.merchantForm}>
            <FormInput
              label="Business Name *"
              value={businessName}
              onChangeText={setBusinessName}
              placeholder="Enter your business name"
              testID="business-name"
            />
            <FormInput
              label="Business Address *"
              value={businessAddress}
              onChangeText={setBusinessAddress}
              placeholder="Street address"
              testID="business-address"
            />
            <FormInput
              label="City *"
              value={city}
              onChangeText={setCity}
              placeholder="City"
              testID="city"
            />
            <FormInput
              label="Postal Code *"
              value={postalCode}
              onChangeText={setPostalCode}
              placeholder="Postal code"
              testID="postal-code"
            />
            <FormInput
              label="Country *"
              value={country}
              onChangeText={setCountry}
              placeholder="Country"
              testID="country"
            />
            <FormInput
              label="VAT/Tax ID *"
              value={vatId}
              onChangeText={setVatId}
              placeholder="VAT or business tax ID"
              testID="vat-id"
            />
            <FormInput
              label="Phone *"
              value={phone}
              onChangeText={setPhone}
              placeholder="Contact phone number"
              keyboardType="phone-pad"
              testID="phone"
            />
            <FormInput
              label="Description (Optional)"
              value={description}
              onChangeText={setDescription}
              placeholder="Tell us about your business"
              multiline
              numberOfLines={4}
              testID="description"
            />
            <Button
              title="Submit Request"
              onPress={handleMerchantRequest}
              loading={merchantFormLoading}
              testID="submit-merchant-request"
            />
          </ScrollView>
        </BottomSheet>
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
  merchantCard: {
    alignItems: 'center',
    marginBottom: 20,
  },
  merchantTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginTop: 12,
    marginBottom: 8,
  },
  merchantText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  merchantForm: {
    maxHeight: 400,
  },
});
