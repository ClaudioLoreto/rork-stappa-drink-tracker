import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { LogOut, Gift, Briefcase, HelpCircle, Settings as SettingsIcon, History as HistoryIcon, Trophy, BarChart } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useBar } from '@/contexts/BarContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { api } from '@/services/api';
import Button from '@/components/Button';
import Card from '@/components/Card';
import BeerMug from '@/components/BeerMug';
import Modal from '@/components/Modal';
import BottomSheet from '@/components/BottomSheet';
import { FormInput } from '@/components/Form';
import Colors from '@/constants/colors';
import { QRCodeData, DrinkValidation, LeaderboardEntry, Promo } from '@/types';
import { ModalError, ModalInfo, ModalSuccess } from '@/components/ModalKit';

type Tab = 'tickets' | 'history' | 'leaderboard';

export default function UserScreen() {
  const router = useRouter();
  const { user, token, logout } = useAuth();
  const { selectedBar, clearBar } = useBar();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>('tickets');
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [qrData, setQrData] = useState<QRCodeData | null>(null);
  const [qrType, setQrType] = useState<'VALIDATION' | 'BONUS'>('VALIDATION');
  const [errorModal, setErrorModal] = useState({ visible: false, message: '' });
  const [infoModal, setInfoModal] = useState({ visible: false, message: '' });
  const [successModal, setSuccessModal] = useState({ visible: false, message: '' });
  const [showMerchantModal, setShowMerchantModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [merchantFormLoading, setMerchantFormLoading] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [shotHistory, setShotHistory] = useState<DrinkValidation[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [activePromo, setActivePromo] = useState<Promo | null>(null);

  const loadProgress = useCallback(async () => {
    if (!token || !user || !selectedBar) return;

    try {
      const userProgress = await api.progress.get(token, user.id, selectedBar.id);
      setProgress(userProgress?.drinksCount || 0);
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  }, [token, user, selectedBar]);

  const loadShotHistory = useCallback(async () => {
    if (!token || !user || !selectedBar) return;

    try {
      const history = await api.validations.listUser(token, user.id, selectedBar.id);
      setShotHistory(history);
    } catch (error) {
      console.error('Failed to load shot history:', error);
    }
  }, [token, user, selectedBar]);

  const loadLeaderboard = useCallback(async () => {
    if (!token || !selectedBar) return;

    try {
      const data = await api.leaderboard.getMonthly(token, selectedBar.id);
      setLeaderboard(data);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    }
  }, [token, selectedBar]);

  const loadPromo = useCallback(async () => {
    if (!token || !selectedBar) return;

    try {
      const promo = await api.promos.getActive(token, selectedBar.id);
      setActivePromo(promo);
    } catch (error) {
      console.error('Failed to load promo:', error);
    }
  }, [token, selectedBar]);

  useEffect(() => {
    if (!selectedBar) {
      router.replace('/select-bar');
      return;
    }
    loadProgress();
    loadPromo();
  }, [selectedBar, loadProgress, loadPromo]);

  useEffect(() => {
    if (activeTab === 'history') {
      loadShotHistory();
    } else if (activeTab === 'leaderboard') {
      loadLeaderboard();
    }
  }, [activeTab, loadShotHistory, loadLeaderboard]);

  const handleGenerateQR = async (type: 'VALIDATION' | 'BONUS') => {
    if (!token || !user || !selectedBar) return;

    const requiredTickets = activePromo?.ticketsRequired || 10;
    if (type === 'BONUS' && progress < requiredTickets) {
      setInfoModal({ 
        visible: true, 
        message: t('user.needMoreDrinks', { required: requiredTickets, current: progress })
      });
      return;
    }

    setLoading(true);
    try {
      const data = await api.qr.generate(token, user.id, type, selectedBar.id);
      setQrData(data);
      setQrType(type);
      setQrModalVisible(true);

      setTimeout(() => {
        setQrModalVisible(false);
        setQrData(null);
      }, 5 * 60 * 1000);
    } catch (error) {
      setErrorModal({ visible: true, message: t('common.error') });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await clearBar();
    await logout();
    router.replace('/login');
  };

  const handleChangeBar = async () => {
    await clearBar();
    router.replace('/select-bar');
  };

  const handleMerchantRequest = async () => {
    if (!token || !user) return;

    if (!businessName || !businessAddress || !phone) {
      setErrorModal({ visible: true, message: t('validation.fillAllFields') });
      return;
    }

    setMerchantFormLoading(true);
    try {
      await api.merchantRequests.create(token, user.id, {
        businessName,
        businessAddress,
        phone,
        description,
      });
      setSuccessModal({ 
        visible: true, 
        message: t('merchantRequest.success')
      });
      setShowMerchantModal(false);
      setBusinessName('');
      setBusinessAddress('');
      setPhone('');
      setDescription('');
    } catch (error) {
      setErrorModal({ visible: true, message: 'Failed to submit merchant request' });
    } finally {
      setMerchantFormLoading(false);
    }
  };

  const renderTicketsTab = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Card style={styles.barCard}>
        <View style={styles.barInfo}>
          <BarChart size={24} color={Colors.orange} />
          <View style={styles.barDetails}>
            <Text style={styles.barName}>{selectedBar?.name}</Text>
            <Text style={styles.barAddress}>{selectedBar?.address}</Text>
          </View>
          <TouchableOpacity onPress={handleChangeBar} testID="change-bar-button">
            <Text style={styles.changeBarText}>{t('user.selectBar')}</Text>
          </TouchableOpacity>
        </View>
      </Card>

      <Card style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.cardTitle}>{t('user.yourProgress')}</Text>
          <TouchableOpacity onPress={() => setShowHelpModal(true)} testID="help-button">
            <HelpCircle size={24} color={Colors.orange} />
          </TouchableOpacity>
        </View>
        <BeerMug progress={progress} ticketsRequired={activePromo?.ticketsRequired || 10} testID="beer-mug" />
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            {progress} / {activePromo?.ticketsRequired || 10} {t('user.drinks')}
          </Text>
          {activePromo && (
            <Text style={styles.promoInfo}>
              {t('user.ticketValue')}: €{activePromo.ticketCost} → €{activePromo.rewardValue}
            </Text>
          )}
          {progress >= (activePromo?.ticketsRequired || 10) && (
            <View style={styles.badge}>
              <Gift size={16} color="#FFFFFF" />
              <Text style={styles.badgeText}>{t('user.freeDrinkReady')}</Text>
            </View>
          )}
        </View>
      </Card>

      <Card style={styles.actionsCard}>
        <Text style={styles.cardTitle}>{t('common.actions') || 'Actions'}</Text>
        <Button
          title={t('user.validateDrink')}
          onPress={() => handleGenerateQR('VALIDATION')}
          loading={loading}
          disabled={progress >= (activePromo?.ticketsRequired || 10)}
          style={styles.actionButton}
          testID="validate-drink-button"
        />
        {progress >= (activePromo?.ticketsRequired || 10) && (
          <Button
            title={t('user.getFreeDrink')}
            onPress={() => handleGenerateQR('BONUS')}
            loading={loading}
            variant="secondary"
            testID="get-free-drink-button"
          />
        )}
      </Card>

      <Card style={styles.merchantCard}>
        <Briefcase size={32} color={Colors.orange} />
        <Text style={styles.merchantTitle}>{t('user.ownBar')}</Text>
        <Text style={styles.merchantText}>
          {t('user.merchantDescription')}
        </Text>
        <Button
          title={t('user.becomeMerchant')}
          onPress={() => setShowMerchantModal(true)}
          variant="secondary"
          testID="become-merchant-button"
        />
      </Card>
    </ScrollView>
  );

  const renderHistoryTab = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Card>
        <Text style={styles.cardTitle}>{t('user.shotHistory')}</Text>
        {shotHistory.length === 0 ? (
          <Text style={styles.emptyText}>{t('leaderboard.noDrinks')}</Text>
        ) : (
          <FlatList
            data={shotHistory}
            scrollEnabled={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.historyItem}>
                <View style={styles.historyInfo}>
                  <Text style={styles.historyBar}>{item.establishmentName}</Text>
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

  const renderLeaderboardTab = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Card>
        <Text style={styles.cardTitle}>{t('leaderboard.title')}</Text>
        {leaderboard.length === 0 ? (
          <Text style={styles.emptyText}>{t('leaderboard.noDrinks')}</Text>
        ) : (
          <View style={styles.podium}>
            {leaderboard.map((entry, index) => (
              <View key={entry.userId} style={[styles.podiumPlace, index === 0 && styles.podiumFirst]}>
                <View style={styles.podiumRank}>
                  <Trophy size={32} color={index === 0 ? Colors.yellow : index === 1 ? '#C0C0C0' : '#CD7F32'} />
                  <Text style={styles.rankNumber}>{entry.rank}</Text>
                </View>
                <Text style={styles.podiumName}>{entry.username}</Text>
                <Text style={styles.podiumCount}>{entry.drinksCount} {t('user.drinks')}</Text>
              </View>
            ))}
          </View>
        )}
      </Card>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{t('user.hello')},</Text>
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
            <TouchableOpacity
              onPress={handleLogout}
              style={styles.iconButton}
              testID="logout-button"
            >
              <LogOut size={20} color={Colors.orange} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'tickets' && styles.tabActive]}
            onPress={() => setActiveTab('tickets')}
            testID="tab-tickets"
          >
            <Gift size={20} color={activeTab === 'tickets' ? Colors.orange : Colors.text.secondary} />
            <Text style={[styles.tabText, activeTab === 'tickets' && styles.tabTextActive]}>
              {t('common.tickets') || 'Tickets'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'history' && styles.tabActive]}
            onPress={() => setActiveTab('history')}
            testID="tab-history"
          >
            <HistoryIcon size={20} color={activeTab === 'history' ? Colors.orange : Colors.text.secondary} />
            <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
              {t('user.shotHistory')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'leaderboard' && styles.tabActive]}
            onPress={() => setActiveTab('leaderboard')}
            testID="tab-leaderboard"
          >
            <Trophy size={20} color={activeTab === 'leaderboard' ? Colors.orange : Colors.text.secondary} />
            <Text style={[styles.tabText, activeTab === 'leaderboard' && styles.tabTextActive]}>
              {t('user.leaderboard')}
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'tickets' && renderTicketsTab()}
        {activeTab === 'history' && renderHistoryTab()}
        {activeTab === 'leaderboard' && renderLeaderboardTab()}

        <Modal
          visible={qrModalVisible}
          onClose={() => setQrModalVisible(false)}
          title={qrType === 'VALIDATION' ? t('user.validateDrink') : t('user.getFreeDrink')}
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

        <Modal
          visible={showHelpModal}
          onClose={() => setShowHelpModal(false)}
          title={t('help.ticketRules')}
          testID="help-modal"
        >
          <View style={styles.helpContent}>
            <Text style={styles.helpText}>
              {activePromo
                ? t('help.ruleDescription', {
                    cost: activePromo.ticketCost,
                    required: activePromo.ticketsRequired,
                    reward: activePromo.rewardValue,
                  })
                : 'For every purchase of at least €10, you get 1 drink ticket. Collect 10 tickets to receive 1 free drink worth €10. Ticket values are configured by each bar\'s active promo.'}
            </Text>
          </View>
        </Modal>

        <ModalError
          visible={errorModal.visible}
          onClose={() => setErrorModal({ visible: false, message: '' })}
          title={t('common.error')}
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
          title={t('common.success')}
          message={successModal.message}
          testID="user-success-modal"
        />

        <BottomSheet
          visible={showMerchantModal}
          onClose={() => setShowMerchantModal(false)}
          title={t('merchantRequest.title')}
          testID="merchant-request-modal"
        >
          <ScrollView style={styles.merchantForm}>
            <FormInput
              label={`${t('merchantRequest.businessName')} *`}
              value={businessName}
              onChangeText={setBusinessName}
              placeholder="Enter your business name"
              testID="business-name"
            />
            <FormInput
              label={`${t('merchantRequest.businessAddress')} *`}
              value={businessAddress}
              onChangeText={setBusinessAddress}
              placeholder="Complete business address"
              multiline
              numberOfLines={3}
              testID="business-address"
            />
            <FormInput
              label={`${t('merchantRequest.phone')} *`}
              value={phone}
              onChangeText={setPhone}
              placeholder="Contact phone number"
              keyboardType="phone-pad"
              testID="phone"
            />
            <FormInput
              label={`${t('merchantRequest.description')} (Optional)`}
              value={description}
              onChangeText={setDescription}
              placeholder="Tell us about your business"
              multiline
              numberOfLines={4}
              testID="description"
            />
            <Button
              title={t('merchantRequest.submit')}
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
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.text.primary,
  },
  headerActions: {
    flexDirection: 'row',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  tabActive: {
    backgroundColor: Colors.amber,
  },
  tabText: {
    fontSize: 14,
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
  barCard: {
    marginBottom: 16,
  },
  barInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  barDetails: {
    flex: 1,
  },
  barName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  barAddress: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  changeBarText: {
    fontSize: 12,
    color: Colors.orange,
    fontWeight: '600' as const,
  },
  progressCard: {
    alignItems: 'center',
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  progressInfo: {
    alignItems: 'center',
    marginTop: 20,
  },
  progressText: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  promoInfo: {
    fontSize: 14,
    color: Colors.text.secondary,
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
  helpContent: {
    paddingVertical: 16,
  },
  helpText: {
    fontSize: 16,
    color: Colors.text.primary,
    lineHeight: 24,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.text.secondary,
    fontSize: 14,
    paddingVertical: 20,
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
  historyBar: {
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
  podium: {
    paddingVertical: 20,
  },
  podiumPlace: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  podiumFirst: {
    backgroundColor: Colors.yellow + '10',
    borderRadius: 12,
    marginBottom: 12,
  },
  podiumRank: {
    alignItems: 'center',
    marginBottom: 12,
  },
  rankNumber: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text.primary,
    marginTop: 8,
  },
  podiumName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  podiumCount: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
});
