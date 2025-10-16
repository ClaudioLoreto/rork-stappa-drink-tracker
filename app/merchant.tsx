import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { ScanLine, DollarSign, History as HistoryIcon, Users, Settings as SettingsIcon } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { api } from '@/services/api';
import Button from '@/components/Button';
import Card from '@/components/Card';
import { FormInput } from '@/components/Form';
import BottomSheet from '@/components/BottomSheet';
import Colors from '@/constants/colors';
import { ModalSuccess, ModalError, ModalConfirm } from '@/components/ModalKit';
import { Promo, DrinkValidation, User } from '@/types';

type Tab = 'scan' | 'promo' | 'history' | 'team';

export default function MerchantScreen() {
  const router = useRouter();
  const { user, token, logout } = useAuth();
  const { t } = useLanguage();
  const [permission, requestPermission] = useCameraPermissions();
  const [activeTab, setActiveTab] = useState<Tab>('scan');
  const [scanning, setScanning] = useState(false);
  const [lastScan, setLastScan] = useState<string | null>(null);
  const [successModal, setSuccessModal] = useState({ visible: false, message: '' });
  const [errorModal, setErrorModal] = useState({ visible: false, message: '' });
  const [activePromo, setActivePromo] = useState<Promo | null>(null);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [ticketCost, setTicketCost] = useState('');
  const [ticketsRequired, setTicketsRequired] = useState('');
  const [rewardValue, setRewardValue] = useState('');
  const [shotHistory, setShotHistory] = useState<DrinkValidation[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [addMemberModal, setAddMemberModal] = useState(false);
  const [addMemberSearch, setAddMemberSearch] = useState('');
  const [selectedNewMemberId, setSelectedNewMemberId] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableCandidates, setAvailableCandidates] = useState<User[]>([]);
  const [confirmModal, setConfirmModal] = useState({ visible: false, userId: '', type: '' as 'remove' | 'transfer' });
  const isSenior = user?.role === 'SENIOR_MERCHANT';

  const loadPromo = useCallback(async () => {
    if (!token || !user?.establishmentId) return;

    try {
      const promo = await api.promos.getActive(token, user.establishmentId);
      setActivePromo(promo);
    } catch (error) {
      console.error('Failed to load promo:', error);
    }
  }, [token, user]);

  const loadShotHistory = useCallback(async () => {
    if (!token || !user?.establishmentId) return;

    try {
      const history = await api.validations.listEstablishment(token, user.establishmentId);
      setShotHistory(history);
    } catch (error) {
      console.error('Failed to load shot history:', error);
    }
  }, [token, user]);

  const loadTeamMembers = useCallback(async () => {
    if (!token || !user?.establishmentId) return;

    try {
      const members = await api.establishments.getTeam(token, user.establishmentId);
      setTeamMembers(members);
    } catch (error) {
      console.error('Failed to load team members:', error);
    }
  }, [token, user]);

  useEffect(() => {
    loadPromo();
  }, [loadPromo]);

  useEffect(() => {
    if (user && !isSenior) {
      if (!activePromo) {
        setErrorModal({ visible: true, message: t('merchant.configurePromo') || 'Ask the Merchant Senior to activate a promotion to continue.' });
      }
    }
  }, [user, isSenior, activePromo, t]);

  useEffect(() => {
    const fetchCandidates = async () => {
      if (!addMemberModal || !token) return;
      try {
        const query = addMemberSearch.trim();
        const all = await api.users.search(token, query);
        const filtered = all.filter(u => u.role === 'USER' && !u.establishmentId);
        setAvailableCandidates(filtered.slice(0, 8));
      } catch (e) {
        console.log('Failed to load candidates', e);
      }
    };
    fetchCandidates();
  }, [addMemberModal, addMemberSearch, token]);

  useEffect(() => {
    if (activeTab === 'history') {
      loadShotHistory();
    } else if (activeTab === 'team') {
      loadTeamMembers();
    }
  }, [activeTab, loadShotHistory, loadTeamMembers]);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (!token || lastScan === data) return;

    if (!activePromo) {
      setErrorModal({ visible: true, message: t('merchant.configurePromo') });
      setScanning(false);
      return;
    }

    setLastScan(data);
    setScanning(false);

    try {
      const result = await api.qr.validate(token, data);
      if (result.success) {
        setSuccessModal({ visible: true, message: result.message });
        loadShotHistory();
      } else {
        setErrorModal({ visible: true, message: result.message });
      }
    } catch (error) {
      setErrorModal({ visible: true, message: 'Failed to validate QR code' });
    } finally {
      setTimeout(() => setLastScan(null), 2000);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const handleCreatePromo = async () => {
    if (!token || !user?.establishmentId) return;

    if (!ticketCost || !ticketsRequired || !rewardValue) {
      setErrorModal({ visible: true, message: t('validation.fillAllFields') });
      return;
    }

    setLoading(true);
    try {
      const promo = await api.promos.create(token, user.establishmentId, {
        ticketCost: parseFloat(ticketCost),
        ticketsRequired: parseInt(ticketsRequired),
        rewardValue: parseFloat(rewardValue),
      });
      setActivePromo(promo);
      setSuccessModal({ visible: true, message: 'Promo created successfully!' });
      setShowPromoModal(false);
      setTicketCost('');
      setTicketsRequired('');
      setRewardValue('');
    } catch (error) {
      setErrorModal({ visible: true, message: 'Failed to create promo' });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMerchant = async (userId: string) => {
    if (!token || !user?.establishmentId) return;

    setLoading(true);
    try {
      await api.establishments.removeMerchant(token, user.establishmentId, userId);
      setSuccessModal({ visible: true, message: 'Merchant removed successfully' });
      setConfirmModal({ visible: false, userId: '', type: 'remove' });
      loadTeamMembers();
    } catch (error) {
      setErrorModal({ visible: true, message: 'Failed to remove merchant' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!token || !user?.establishmentId || !selectedNewMemberId) return;
    if (teamMembers.length >= 5) {
      setErrorModal({ visible: true, message: 'Maximum 5 merchants per business' });
      return;
    }
    setLoading(true);
    try {
      await api.establishments.assignMerchant(user.establishmentId, selectedNewMemberId, token);
      setSuccessModal({ visible: true, message: 'Merchant added successfully' });
      setAddMemberModal(false);
      setAddMemberSearch('');
      setSelectedNewMemberId('');
      loadTeamMembers();
    } catch (error) {
      setErrorModal({ visible: true, message: 'Failed to add merchant' });
    } finally {
      setLoading(false);
    }
  };

  const handleTransferSenior = async (userId: string) => {
    if (!token || !user?.establishmentId) return;

    setLoading(true);
    try {
      await api.establishments.transferSenior(token, user.establishmentId, userId);
      setSuccessModal({ visible: true, message: 'Senior role transferred successfully' });
      setConfirmModal({ visible: false, userId: '', type: 'transfer' });
      loadTeamMembers();
    } catch (error) {
      setErrorModal({ visible: true, message: 'Failed to transfer senior role' });
    } finally {
      setLoading(false);
    }
  };

  const calculateDaysRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const renderScanTab = () => {
    if (scanning) {
      return (
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
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {!activePromo && (
          <Card style={styles.warningCard}>
            <Text style={styles.warningTitle}>{t('merchant.noActivePromo')}</Text>
            <Text style={styles.warningText}>
              {isSenior 
                ? 'Please create a promo to start validating drinks.' 
                : 'Please ask your Senior Merchant to create a promo.'}
            </Text>
          </Card>
        )}
        <Card style={styles.infoCard}>
          <ScanLine size={64} color={Colors.orange} />
          <Text style={styles.infoTitle}>{t('merchant.scanQR')}</Text>
          <Text style={styles.infoText}>
            Tap the button below to start scanning customer QR codes for drink validation
          </Text>
        </Card>
        <Button
          title={t('merchant.startScanning')}
          onPress={() => setScanning(true)}
          size="large"
          disabled={!activePromo}
          testID="start-scan-button"
        />
      </ScrollView>
    );
  };

  const renderPromoTab = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Card>
        <Text style={styles.cardTitle}>{t('merchant.promoManagement')}</Text>
        {activePromo ? (
          <View style={styles.promoDetails}>
            <View style={styles.promoRow}>
              <Text style={styles.promoLabel}>{t('merchant.ticketCost')}:</Text>
              <Text style={styles.promoValue}>€{activePromo.ticketCost}</Text>
            </View>
            <View style={styles.promoRow}>
              <Text style={styles.promoLabel}>{t('merchant.ticketsRequired')}:</Text>
              <Text style={styles.promoValue}>{activePromo.ticketsRequired}</Text>
            </View>
            <View style={styles.promoRow}>
              <Text style={styles.promoLabel}>{t('merchant.rewardValue')}:</Text>
              <Text style={styles.promoValue}>€{activePromo.rewardValue}</Text>
            </View>
            <View style={styles.promoRow}>
              <Text style={styles.promoLabel}>{t('merchant.expiresIn')}:</Text>
              <Text style={styles.promoValue}>
                {calculateDaysRemaining(activePromo.expiresAt)} {t('merchant.days')}
              </Text>
            </View>
          </View>
        ) : (
          <Text style={styles.emptyText}>{t('merchant.noActivePromo')}</Text>
        )}
        {isSenior && (
          <Button
            title={t('merchant.createPromo')}
            onPress={() => setShowPromoModal(true)}
            variant={activePromo ? 'secondary' : 'primary'}
            style={styles.topMargin}
            testID="create-promo-button"
          />
        )}
        {!isSenior && (
          <Text style={styles.hintText}>
            Only Senior Merchant can manage promos
          </Text>
        )}
      </Card>
    </ScrollView>
  );

  const renderHistoryTab = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Card>
        <Text style={styles.cardTitle}>{t('merchant.shotHistory')}</Text>
        {shotHistory.length === 0 ? (
          <Text style={styles.emptyText}>No validations yet</Text>
        ) : (
          <FlatList
            data={shotHistory}
            scrollEnabled={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.historyItem}>
                <View style={styles.historyInfo}>
                  <Text style={styles.historyUser}>{item.username || 'Unknown'}</Text>
                  <Text style={styles.historyDate}>
                    {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
                <View style={[styles.statusBadge, item.status === 'SUCCESS' ? styles.statusSuccess : styles.statusFailed]}>
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>
            )}
          />
        )}
      </Card>
    </ScrollView>
  );

  const renderTeamTab = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Card>
        <Text style={styles.cardTitle}>{t('merchant.team')}</Text>
        {teamMembers.length === 0 ? (
          <Text style={styles.emptyText}>No team members</Text>
        ) : (
          <FlatList
            data={teamMembers}
            scrollEnabled={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.teamItem}>
                <View style={styles.teamInfo}>
                  <Text style={styles.teamName}>{item.username}</Text>
                  <Text style={styles.teamRole}>{item.role}</Text>
                </View>
                {isSenior && item.id !== user?.id && (
                  <View style={styles.teamActions}>
                    {item.role === 'MERCHANT' && (
                      <Button
                        title="Transfer Senior"
                        onPress={() => setConfirmModal({ visible: true, userId: item.id, type: 'transfer' })}
                        size="small"
                        variant="secondary"
                        testID={`transfer-${item.id}`}
                      />
                    )}
                    <Button
                      title="Remove"
                      onPress={() => setConfirmModal({ visible: true, userId: item.id, type: 'remove' })}
                      size="small"
                      variant="outline"
                      testID={`remove-${item.id}`}
                    />
                  </View>
                )}
              </View>
            )}
          />
        )}
        {isSenior && (
          <Button
            title={t('admin.addMerchant')}
            onPress={() => setAddMemberModal(true)}
            variant="secondary"
            style={styles.topMargin}
            testID="open-add-merchant"
          />
        )}
      </Card>
    </ScrollView>
  );

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
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
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{t('merchant.dashboard')}</Text>
          <Text style={styles.username}>{user?.username}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => router.push('/settings')}
            style={styles.iconButton}
            testID="settings-button"
          >
            <SettingsIcon size={20} color={Colors.orange} />
          </TouchableOpacity>
          <Button
            title={t('common.logout')}
            onPress={handleLogout}
            variant="outline"
            size="small"
            testID="logout-button"
          />
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'scan' && styles.tabActive]}
          onPress={() => setActiveTab('scan')}
          testID="tab-scan"
        >
          <ScanLine size={20} color={activeTab === 'scan' ? Colors.orange : Colors.text.secondary} />
          <Text style={[styles.tabText, activeTab === 'scan' && styles.tabTextActive]}>
            {t('merchant.scanQR')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'promo' && styles.tabActive]}
          onPress={() => setActiveTab('promo')}
          testID="tab-promo"
        >
          <DollarSign size={20} color={activeTab === 'promo' ? Colors.orange : Colors.text.secondary} />
          <Text style={[styles.tabText, activeTab === 'promo' && styles.tabTextActive]}>
            Promo
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
          testID="tab-history"
        >
          <HistoryIcon size={20} color={activeTab === 'history' ? Colors.orange : Colors.text.secondary} />
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            {t('merchant.shotHistory')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'team' && styles.tabActive]}
          onPress={() => setActiveTab('team')}
          testID="tab-team"
        >
          <Users size={20} color={activeTab === 'team' ? Colors.orange : Colors.text.secondary} />
          <Text style={[styles.tabText, activeTab === 'team' && styles.tabTextActive]}>
            {t('merchant.team')}
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'scan' && renderScanTab()}
      {activeTab === 'promo' && renderPromoTab()}
      {activeTab === 'history' && renderHistoryTab()}
      {activeTab === 'team' && renderTeamTab()}

      <BottomSheet
        visible={showPromoModal}
        onClose={() => setShowPromoModal(false)}
        title={t('merchant.createPromo')}
        testID="promo-modal"
      >
        <View style={styles.promoForm}>
          <FormInput
            label={`${t('merchant.ticketCost')} (€)`}
            value={ticketCost}
            onChangeText={setTicketCost}
            placeholder="10"
            keyboardType="decimal-pad"
            testID="ticket-cost"
          />
          <FormInput
            label={t('merchant.ticketsRequired')}
            value={ticketsRequired}
            onChangeText={setTicketsRequired}
            placeholder="10"
            keyboardType="number-pad"
            testID="tickets-required"
          />
          <FormInput
            label={`${t('merchant.rewardValue')} (€)`}
            value={rewardValue}
            onChangeText={setRewardValue}
            placeholder="10"
            keyboardType="decimal-pad"
            testID="reward-value"
          />
          <Button
            title={t('common.save')}
            onPress={handleCreatePromo}
            loading={loading}
            testID="save-promo-button"
          />
        </View>
      </BottomSheet>

      <ModalConfirm
        visible={confirmModal.visible}
        onClose={() => setConfirmModal({ visible: false, userId: '', type: 'remove' })}
        title={confirmModal.type === 'remove' ? 'Remove Merchant' : 'Transfer Senior Role'}
        message={
          confirmModal.type === 'remove'
            ? 'Are you sure you want to remove this merchant from your team?'
            : 'Are you sure you want to transfer the Senior Merchant role to this user?'
        }
        onConfirm={() => {
          if (confirmModal.type === 'remove') {
            handleRemoveMerchant(confirmModal.userId);
          } else {
            handleTransferSenior(confirmModal.userId);
          }
        }}
        confirmText={confirmModal.type === 'remove' ? 'Remove' : 'Transfer'}
        destructive={confirmModal.type === 'remove'}
        testID="confirm-modal"
      />

      <ModalSuccess
        visible={successModal.visible}
        onClose={() => setSuccessModal({ visible: false, message: '' })}
        title={t('common.success')}
        message={successModal.message}
        testID="merchant-success-modal"
      />

      <ModalError
        visible={errorModal.visible}
        onClose={() => setErrorModal({ visible: false, message: '' })}
        title={t('common.error')}
        message={errorModal.message}
        testID="merchant-error-modal"
      />

      <BottomSheet
        visible={addMemberModal}
        onClose={() => {
          setAddMemberModal(false);
          setAddMemberSearch('');
          setSelectedNewMemberId('');
        }}
        title={t('admin.addMerchant')}
        testID="add-merchant-modal"
      >
        <ScrollView style={styles.promoForm}>
          <FormInput
            label={t('common.search')}
            value={addMemberSearch}
            onChangeText={setAddMemberSearch}
            placeholder={t('common.searchPlaceholder')}
            testID="add-merchant-search"
          />
          <View style={styles.userSelectList}>
            {teamMembers.length >= 5 ? (
              <Text style={styles.hintText}>Maximum 5 merchants reached</Text>
            ) : availableCandidates.length === 0 ? (
              <Text style={styles.emptyText}>No users found</Text>
            ) : (
              availableCandidates.map((u) => (
                <TouchableOpacity
                  key={u.id}
                  style={[styles.userSelectItem, selectedNewMemberId === u.id && styles.userSelectItemActive]}
                  onPress={() => setSelectedNewMemberId(u.id)}
                  testID={`candidate-${u.id}`}
                >
                  <Text style={[styles.userSelectText, selectedNewMemberId === u.id && styles.userSelectTextActive]}>
                    {u.username}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
          <Button
            title={t('admin.addMerchant')}
            onPress={handleAddMember}
            loading={loading}
            disabled={!selectedNewMemberId || teamMembers.length >= 5}
            testID="confirm-add-merchant"
          />
        </ScrollView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 12,
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    gap: 4,
  },
  tabActive: {
    backgroundColor: Colors.amber,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
  },
  tabTextActive: {
    color: Colors.orange,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
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
  warningCard: {
    backgroundColor: Colors.amber + '40',
    marginBottom: 16,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.orange,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: Colors.text.primary,
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
  cardTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  promoDetails: {
    marginBottom: 16,
  },
  promoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  promoLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  promoValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.text.secondary,
    fontSize: 14,
    paddingVertical: 20,
  },
  topMargin: {
    marginTop: 16,
  },
  hintText: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic' as const,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  historyInfo: {
    flex: 1,
  },
  historyUser: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  historyDate: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusSuccess: {
    backgroundColor: Colors.success + '20',
  },
  statusFailed: {
    backgroundColor: Colors.error + '20',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  teamItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  teamRole: {
    fontSize: 12,
    color: Colors.orange,
    marginTop: 4,
    textTransform: 'uppercase' as const,
  },
  teamActions: {
    flexDirection: 'row',
    gap: 8,
  },
  promoForm: {
    paddingBottom: 20,
  },
  userSelectList: {
    marginVertical: 12,
  },
  userSelectItem: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  userSelectItemActive: {
    borderColor: Colors.orange,
    backgroundColor: Colors.amber + '20',
  },
  userSelectText: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  userSelectTextActive: {
    color: Colors.orange,
    fontWeight: '600' as const,
  },
});
