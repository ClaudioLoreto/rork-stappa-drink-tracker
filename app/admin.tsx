import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Building2, Users, ClipboardList, Settings as SettingsIcon, Shield } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { api } from '@/services/api';
import Button from '@/components/Button';
import Card from '@/components/Card';
import { FormInput } from '@/components/Form';
import BottomSheet from '@/components/BottomSheet';
import Colors from '@/constants/colors';
import { Establishment, User, MerchantRequest } from '@/types';
import { ModalSuccess, ModalError, ModalConfirm } from '@/components/ModalKit';

type Tab = 'overview' | 'establishments' | 'users' | 'requests';

export default function AdminScreen() {
  const router = useRouter();
  const { user, token, logout } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [merchantRequests, setMerchantRequests] = useState<MerchantRequest[]>([]);
  const [showEstablishmentModal, setShowEstablishmentModal] = useState(false);
  const [showAssignMerchantModal, setShowAssignMerchantModal] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [showEstManagementModal, setShowEstManagementModal] = useState(false);
  const [selectedEstForManagement, setSelectedEstForManagement] = useState<Establishment | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ 
    visible: false, 
    type: '' as 'approve' | 'reject' | 'password-reset', 
    requestId: '', 
    userId: '' 
  });
  const [rejectReason, setRejectReason] = useState('');

  const [estName, setEstName] = useState('');
  const [estAddress, setEstAddress] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedEstablishmentId, setSelectedEstablishmentId] = useState('');
  const [assignUserSearch, setAssignUserSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [successModal, setSuccessModal] = useState({ visible: false, message: '' });
  const [errorModal, setErrorModal] = useState({ visible: false, message: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!token) return;

    try {
      const [estData, userData, requestsData] = await Promise.all([
        api.establishments.list(token),
        api.users.list(token),
        api.merchantRequests.list(token, 'PENDING'),
      ]);
      setEstablishments(estData);
      setUsers(userData);
      setMerchantRequests(requestsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleCreateEstablishment = async () => {
    if (!token || !estName || !estAddress) {
      setErrorModal({ visible: true, message: t('validation.fillAllFields') });
      return;
    }

    if (!selectedUserId) {
      setErrorModal({ visible: true, message: 'Please select a user to assign as merchant' });
      return;
    }

    setLoading(true);
    try {
      await api.establishments.create(estName, estAddress, token, selectedUserId);
      setSuccessModal({ visible: true, message: 'Establishment created and merchant assigned successfully' });
      setEstName('');
      setEstAddress('');
      setSelectedUserId('');
      setShowEstablishmentModal(false);
      loadData();
    } catch (error) {
      setErrorModal({ visible: true, message: 'Failed to create establishment' });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignMerchant = async () => {
    if (!token || !selectedEstablishmentId || !selectedUserId) {
      setErrorModal({ visible: true, message: t('validation.fillAllFields') });
      return;
    }

    const targetUser = users.find(u => u.id === selectedUserId);
    if (targetUser?.establishmentId) {
      setErrorModal({ visible: true, message: 'This user is already a merchant at another establishment' });
      return;
    }

    const estTeam = users.filter(u => u.establishmentId === selectedEstablishmentId);
    if (estTeam.length >= 5) {
      setErrorModal({ visible: true, message: 'This establishment already has maximum 5 merchants' });
      return;
    }

    setLoading(true);
    try {
      await api.establishments.assignMerchant(selectedEstablishmentId, selectedUserId, token);
      setSuccessModal({ visible: true, message: 'User assigned as merchant' });
      setSelectedEstablishmentId('');
      setSelectedUserId('');
      setShowAssignMerchantModal(false);
      loadData();
    } catch (error) {
      setErrorModal({ visible: true, message: 'Failed to assign merchant' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendPasswordReset = async (userId: string) => {
    if (!token) return;

    setLoading(true);
    try {
      const result = await api.users.sendPasswordReset(token, userId);
      setSuccessModal({ 
        visible: true, 
        message: `Password reset notification sent via ${result.method === 'email' ? 'email' : 'SMS'}` 
      });
      setConfirmModal({ visible: false, type: 'password-reset', requestId: '', userId: '' });
    } catch (error) {
      setErrorModal({ visible: true, message: 'Failed to send password reset' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const handleApproveRequest = async (requestId: string) => {
    if (!token || !user) return;

    setLoading(true);
    try {
      await api.merchantRequests.approve(token, requestId, user.id);
      setSuccessModal({ 
        visible: true, 
        message: 'Merchant request approved successfully! User has been granted merchant role.' 
      });
      setConfirmModal({ visible: false, type: 'approve', requestId: '', userId: '' });
      loadData();
    } catch (error) {
      setErrorModal({ visible: true, message: 'Failed to approve merchant request' });
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    if (!token || !user) return;

    setLoading(true);
    try {
      await api.merchantRequests.reject(token, requestId, user.id, rejectReason);
      setSuccessModal({ 
        visible: true, 
        message: 'Merchant request rejected.' 
      });
      setConfirmModal({ visible: false, type: 'reject', requestId: '', userId: '' });
      setRejectReason('');
      loadData();
    } catch (error) {
      setErrorModal({ visible: true, message: 'Failed to reject merchant request' });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const availableUsersForAssignment = users.filter(
    (u) => 
      u.role === 'USER' && 
      !u.establishmentId &&
      (u.username.toLowerCase().includes(assignUserSearch.toLowerCase()) ||
       (u.email && u.email.toLowerCase().includes(assignUserSearch.toLowerCase())))
  );

  const userHasPendingRequest = (userId: string) => {
    return merchantRequests.some(r => r.userId === userId && r.status === 'PENDING');
  };

  const renderOverview = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Card style={styles.statsCard}>
        <View style={styles.statRow}>
          <View style={styles.stat}>
            <Building2 size={32} color={Colors.orange} />
            <Text style={styles.statValue}>{establishments.length}</Text>
            <Text style={styles.statLabel}>{t('admin.establishments')}</Text>
          </View>
          <View style={styles.stat}>
            <Users size={32} color={Colors.amber} />
            <Text style={styles.statValue}>{users.length}</Text>
            <Text style={styles.statLabel}>{t('admin.users')}</Text>
          </View>
          <View style={styles.stat}>
            <ClipboardList size={32} color={Colors.yellow} />
            <Text style={styles.statValue}>{merchantRequests.length}</Text>
            <Text style={styles.statLabel}>{t('admin.requests')}</Text>
          </View>
        </View>
      </Card>

      <Card style={styles.actionCard}>
        <Text style={styles.cardTitle}>{t('common.actions')}</Text>
        <Button
          title={t('admin.createEstablishment')}
          onPress={() => setShowEstablishmentModal(true)}
          style={styles.actionButton}
          testID="create-establishment-button"
        />
        <Button
          title={t('admin.assignMerchant')}
          onPress={() => setShowAssignMerchantModal(true)}
          variant="secondary"
          style={styles.actionButton}
          testID="assign-merchant-button"
        />
      </Card>
    </ScrollView>
  );

  const renderEstablishments = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Card>
        <Text style={styles.cardTitle}>{t('admin.establishments')}</Text>
        {establishments.length === 0 ? (
          <Text style={styles.emptyText}>{t('common.noData')}</Text>
        ) : (
          <FlatList
            data={establishments}
            scrollEnabled={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const team = users.filter(u => u.establishmentId === item.id);
              const senior = team.find(u => u.role === 'SENIOR_MERCHANT');
              return (
                <TouchableOpacity 
                  style={styles.listItem}
                  onPress={() => {
                    setSelectedEstForManagement(item);
                    setShowEstManagementModal(true);
                  }}
                  testID={`est-item-${item.id}`}
                >
                  <View style={styles.listItemContent}>
                    <Text style={styles.listItemTitle}>{item.name}</Text>
                    <Text style={styles.listItemSubtitle}>{item.address}</Text>
                    <Text style={styles.listItemDetail}>
                      {`Senior: ${senior?.username || t('common.none')} | Team: ${team.length}/5`}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </Card>
    </ScrollView>
  );

  const renderUsers = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Card>
        <Text style={styles.cardTitle}>{t('admin.manageUsers')}</Text>
        <FormInput
          label={t('common.search')}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t('common.searchPlaceholder')}
          testID="search-users"
        />
        {filteredUsers.length === 0 ? (
          <Text style={styles.emptyText}>{t('common.noResults')}</Text>
        ) : (
          <FlatList
            data={filteredUsers}
            scrollEnabled={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.userItem}>
                <View style={styles.userInfo}>
                  <Text style={styles.userItemTitle}>{item.username}</Text>
                  <Text style={styles.userItemSubtitle}>
                    {item.email || item.phone || 'No contact info'}
                  </Text>
                  <Text style={styles.userRole}>Role: {item.role}</Text>
                </View>
                <View style={styles.userActions}>
                  {item.role === 'USER' && !userHasPendingRequest(item.id) && !item.establishmentId && (
                    <Button
                      title={t('admin.makeMerchant')}
                      onPress={() => {
                        setSelectedUserId(item.id);
                        setShowAssignMerchantModal(true);
                      }}
                      size="small"
                      variant="secondary"
                      testID={`make-merchant-${item.id}`}
                    />
                  )}
                  {userHasPendingRequest(item.id) && (
                    <Text style={styles.pendingText}>{t('admin.requestPending')}</Text>
                  )}
                  <Button
                    title={t('admin.resetPassword')}
                    onPress={() => setConfirmModal({ 
                      visible: true, 
                      type: 'password-reset', 
                      requestId: '', 
                      userId: item.id 
                    })}
                    size="small"
                    variant="outline"
                    testID={`reset-password-${item.id}`}
                  />
                </View>
              </View>
            )}
          />
        )}
      </Card>
    </ScrollView>
  );

  const renderRequests = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Card>
        <Text style={styles.cardTitle}>{t('admin.merchantRequests')}</Text>
        {merchantRequests.length === 0 ? (
          <Text style={styles.emptyText}>{t('common.noPendingRequests')}</Text>
        ) : (
          <FlatList
            data={merchantRequests}
            scrollEnabled={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.requestItem}>
                <View style={styles.requestInfo}>
                  <Text style={styles.requestTitle}>{item.businessName}</Text>
                  <Text style={styles.requestSubtitle}>{item.businessAddress}</Text>
                  <Text style={styles.requestDetail}>Phone: {item.phone}</Text>
                  {item.description && (
                    <Text style={styles.requestDescription}>{item.description}</Text>
                  )}
                </View>
                <View style={styles.requestActions}>
                  <Button
                    title={t('admin.approve')}
                    onPress={() => setConfirmModal({ 
                      visible: true, 
                      type: 'approve', 
                      requestId: item.id, 
                      userId: '' 
                    })}
                    size="small"
                    style={styles.requestButton}
                    testID={`approve-request-${item.id}`}
                  />
                  <Button
                    title={t('admin.reject')}
                    onPress={() => setConfirmModal({ 
                      visible: true, 
                      type: 'reject', 
                      requestId: item.id, 
                      userId: '' 
                    })}
                    size="small"
                    variant="outline"
                    testID={`reject-request-${item.id}`}
                  />
                </View>
              </View>
            )}
          />
        )}
      </Card>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{t('admin.dashboard')}</Text>
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
          style={[styles.tab, activeTab === 'overview' && styles.tabActive]}
          onPress={() => setActiveTab('overview')}
          testID="tab-overview"
        >
          <Shield size={20} color={activeTab === 'overview' ? Colors.orange : Colors.text.secondary} />
          <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>
            {t('admin.overview') || 'Overview'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'establishments' && styles.tabActive]}
          onPress={() => setActiveTab('establishments')}
          testID="tab-establishments"
        >
          <Building2 size={20} color={activeTab === 'establishments' ? Colors.orange : Colors.text.secondary} />
          <Text style={[styles.tabText, activeTab === 'establishments' && styles.tabTextActive]}>
            {t('admin.establishments')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'users' && styles.tabActive]}
          onPress={() => setActiveTab('users')}
          testID="tab-users"
        >
          <Users size={20} color={activeTab === 'users' ? Colors.orange : Colors.text.secondary} />
          <Text style={[styles.tabText, activeTab === 'users' && styles.tabTextActive]}>
            {t('admin.users')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'requests' && styles.tabActive]}
          onPress={() => setActiveTab('requests')}
          testID="tab-requests"
        >
          <ClipboardList size={20} color={activeTab === 'requests' ? Colors.orange : Colors.text.secondary} />
          <Text style={[styles.tabText, activeTab === 'requests' && styles.tabTextActive]}>
            {t('admin.requests')}
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'establishments' && renderEstablishments()}
      {activeTab === 'users' && renderUsers()}
      {activeTab === 'requests' && renderRequests()}

      <BottomSheet
        visible={showEstablishmentModal}
        onClose={() => setShowEstablishmentModal(false)}
        title={t('admin.createEstablishment')}
        testID="establishment-modal"
      >
        <ScrollView style={styles.modalContent}>
          <FormInput
            label={t('admin.establishmentName')}
            value={estName}
            onChangeText={setEstName}
            placeholder={t('admin.enterEstablishmentName')}
            testID="est-name"
          />
          <FormInput
            label={t('admin.address')}
            value={estAddress}
            onChangeText={setEstAddress}
            placeholder={t('admin.enterAddress')}
            multiline
            numberOfLines={2}
            testID="est-address"
          />
          <FormInput
            label={t('admin.searchUserToAssign')}
            value={assignUserSearch}
            onChangeText={setAssignUserSearch}
            placeholder={t('common.searchPlaceholder')}
            testID="search-assign-user"
          />
          <View style={styles.userSelectList}>
            {availableUsersForAssignment.slice(0, 5).map((u) => (
              <TouchableOpacity
                key={u.id}
                style={[styles.userSelectItem, selectedUserId === u.id && styles.userSelectItemActive]}
                onPress={() => setSelectedUserId(u.id)}
                testID={`select-user-${u.id}`}
              >
                <Text style={[styles.userSelectText, selectedUserId === u.id && styles.userSelectTextActive]}>
                  {u.username}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Button
            title={t('admin.createAndAssign')}
            onPress={handleCreateEstablishment}
            loading={loading}
            disabled={!selectedUserId}
            testID="create-est-button"
          />
        </ScrollView>
      </BottomSheet>

      <BottomSheet
        visible={showAssignMerchantModal}
        onClose={() => {
          setShowAssignMerchantModal(false);
          setSelectedUserId('');
          setSelectedEstablishmentId('');
        }}
        title={t('admin.assignMerchant')}
        testID="assign-merchant-modal"
      >
        <ScrollView style={styles.modalContent}>
          <Text style={styles.sectionTitle}>{t('admin.selectEstablishment')}</Text>
          <View style={styles.userSelectList}>
            {establishments.map((est) => (
              <TouchableOpacity
                key={est.id}
                style={[styles.userSelectItem, selectedEstablishmentId === est.id && styles.userSelectItemActive]}
                onPress={() => setSelectedEstablishmentId(est.id)}
                testID={`select-est-${est.id}`}
              >
                <Text style={[styles.userSelectText, selectedEstablishmentId === est.id && styles.userSelectTextActive]}>
                  {est.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {selectedEstablishmentId && (
            <>
              <Text style={styles.sectionTitle}>{t('admin.selectUser')}</Text>
              <FormInput
                label={t('common.search')}
                value={assignUserSearch}
                onChangeText={setAssignUserSearch}
                placeholder={t('common.searchPlaceholder')}
                testID="search-user-assign"
              />
              <View style={styles.userSelectList}>
                {availableUsersForAssignment.slice(0, 5).map((u) => (
                  <TouchableOpacity
                    key={u.id}
                    style={[styles.userSelectItem, selectedUserId === u.id && styles.userSelectItemActive]}
                    onPress={() => setSelectedUserId(u.id)}
                    testID={`select-merchant-user-${u.id}`}
                  >
                    <Text style={[styles.userSelectText, selectedUserId === u.id && styles.userSelectTextActive]}>
                      {u.username}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <Button
            title={t('admin.assignMerchant')}
            onPress={handleAssignMerchant}
            loading={loading}
            disabled={!selectedEstablishmentId || !selectedUserId}
            testID="confirm-assign-button"
          />
        </ScrollView>
      </BottomSheet>

      <ModalConfirm
        visible={confirmModal.visible}
        onClose={() => setConfirmModal({ visible: false, type: 'approve', requestId: '', userId: '' })}
        title={
          confirmModal.type === 'approve' 
            ? `${t('admin.approve')} Request`
            : confirmModal.type === 'reject'
            ? `${t('admin.reject')} Request`
            : t('admin.resetPassword')
        }
        message={
          confirmModal.type === 'approve'
            ? 'Are you sure you want to approve this merchant request? The user will be granted merchant role and an establishment will be created.'
            : confirmModal.type === 'reject'
            ? 'Are you sure you want to reject this merchant request?'
            : 'Send password reset notification to this user?'
        }
        onConfirm={() => {
          if (confirmModal.type === 'approve') {
            handleApproveRequest(confirmModal.requestId);
          } else if (confirmModal.type === 'reject') {
            handleRejectRequest(confirmModal.requestId);
          } else {
            handleSendPasswordReset(confirmModal.userId);
          }
        }}
        confirmText={
          confirmModal.type === 'approve'
            ? t('admin.approve')
            : confirmModal.type === 'reject'
            ? t('admin.reject')
            : 'Send'
        }
        destructive={confirmModal.type === 'reject'}
        testID="confirm-modal"
      />

      <ModalSuccess
        visible={successModal.visible}
        onClose={() => setSuccessModal({ visible: false, message: '' })}
        title={t('common.success')}
        message={successModal.message}
        testID="admin-success-modal"
      />

      <ModalError
        visible={errorModal.visible}
        onClose={() => setErrorModal({ visible: false, message: '' })}
        title={t('common.error')}
        message={errorModal.message}
        testID="admin-error-modal"
      />

      <BottomSheet
        visible={showEstManagementModal}
        onClose={() => {
          setShowEstManagementModal(false);
          setSelectedEstForManagement(null);
        }}
        title={t('admin.manageEstablishment')}
        testID="est-management-modal"
      >
        <ScrollView style={styles.modalContent}>
          {selectedEstForManagement && (
            <>
              <View style={styles.estInfoSection}>
                <Text style={styles.estInfoTitle}>{selectedEstForManagement.name}</Text>
                <Text style={styles.estInfoAddress}>{selectedEstForManagement.address}</Text>
              </View>

              <View style={styles.managementSection}>
                <Text style={styles.sectionTitle}>{t('merchant.team')}</Text>
                {(() => {
                  const team = users.filter(u => u.establishmentId === selectedEstForManagement.id);
                  if (team.length === 0) {
                    return <Text style={styles.emptyText}>{t('admin.noMerchants')}</Text>;
                  }
                  return team.map((merchant) => (
                    <View key={merchant.id} style={styles.merchantTeamItem}>
                      <View style={styles.merchantTeamInfo}>
                        <Text style={styles.merchantTeamName}>{merchant.username}</Text>
                        <Text style={styles.merchantTeamRole}>
                          {merchant.role === 'SENIOR_MERCHANT' ? t('admin.seniorMerchant') : t('admin.merchant')}
                        </Text>
                      </View>
                      <View style={styles.merchantTeamActions}>
                        {merchant.role !== 'SENIOR_MERCHANT' && (
                          <Button
                            title={t('admin.remove')}
                            onPress={async () => {
                              if (!token) return;
                              setLoading(true);
                              try {
                                await api.establishments.removeMerchant(token, selectedEstForManagement.id, merchant.id);
                                setSuccessModal({ visible: true, message: t('admin.merchantRemoved') });
                                loadData();
                              } catch (error) {
                                setErrorModal({ visible: true, message: t('common.error') });
                              } finally {
                                setLoading(false);
                              }
                            }}
                            size="small"
                            variant="outline"
                            testID={`remove-merchant-${merchant.id}`}
                          />
                        )}
                      </View>
                    </View>
                  ));
                })()}
              </View>

              <View style={styles.managementSection}>
                <Button
                  title={t('admin.addMerchant')}
                  onPress={() => {
                    setSelectedEstablishmentId(selectedEstForManagement.id);
                    setShowEstManagementModal(false);
                    setShowAssignMerchantModal(true);
                  }}
                  variant="secondary"
                  testID="add-merchant-from-management"
                />
              </View>
            </>
          )}
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
    paddingHorizontal: 4,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    gap: 4,
  },
  tabActive: {
    backgroundColor: Colors.amber,
  },
  tabText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
    textAlign: 'center' as const,
  },
  tabTextActive: {
    color: Colors.orange,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
  },
  statsCard: {
    marginBottom: 20,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: Colors.text.primary,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  actionCard: {
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  actionButton: {
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  listItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  listItemSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  listItemDetail: {
    fontSize: 12,
    color: Colors.orange,
    marginTop: 4,
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  userInfo: {
    flex: 1,
  },
  userItemTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  userItemSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  userRole: {
    fontSize: 12,
    color: Colors.orange,
    marginTop: 4,
  },
  userActions: {
    flexDirection: 'column',
    gap: 8,
    alignItems: 'flex-end',
  },
  pendingText: {
    fontSize: 12,
    color: Colors.amber,
    fontStyle: 'italic' as const,
  },
  requestItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  requestInfo: {
    marginBottom: 12,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  requestSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  requestDetail: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  requestDescription: {
    fontSize: 13,
    color: Colors.text.primary,
    marginTop: 8,
    fontStyle: 'italic' as const,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  requestButton: {
    flex: 1,
  },
  modalContent: {
    maxHeight: 500,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  userSelectList: {
    marginBottom: 16,
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
  estInfoSection: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: Colors.amber + '20',
    borderRadius: 12,
  },
  estInfoTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  estInfoAddress: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  managementSection: {
    marginBottom: 24,
  },
  merchantTeamItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  merchantTeamInfo: {
    flex: 1,
  },
  merchantTeamName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  merchantTeamRole: {
    fontSize: 12,
    color: Colors.orange,
    marginTop: 2,
  },
  merchantTeamActions: {
    flexDirection: 'row',
    gap: 8,
  },
});
