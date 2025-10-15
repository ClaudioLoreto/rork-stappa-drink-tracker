import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Building2, Users, UserPlus, ClipboardList } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import Button from '@/components/Button';
import Card from '@/components/Card';
import { FormInput } from '@/components/Form';
import BottomSheet from '@/components/BottomSheet';
import Colors from '@/constants/colors';
import { Establishment, User, MerchantRequest } from '@/types';
import { ModalSuccess, ModalError, ModalConfirm } from '@/components/ModalKit';

export default function AdminScreen() {
  const router = useRouter();
  const { user, token, logout } = useAuth();
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [merchantRequests, setMerchantRequests] = useState<MerchantRequest[]>([]);
  const [showEstablishmentModal, setShowEstablishmentModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MerchantRequest | null>(null);
  const [confirmModal, setConfirmModal] = useState({ visible: false, type: '' as 'approve' | 'reject', requestId: '' });
  const [rejectReason, setRejectReason] = useState('');

  const [estName, setEstName] = useState('');
  const [estAddress, setEstAddress] = useState('');
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
      setErrorModal({ visible: true, message: 'Please fill in all fields' });
      return;
    }

    setLoading(true);
    try {
      await api.establishments.create(estName, estAddress, token);
      setSuccessModal({ visible: true, message: 'Establishment created successfully' });
      setEstName('');
      setEstAddress('');
      setShowEstablishmentModal(false);
      loadData();
    } catch (error) {
      setErrorModal({ visible: true, message: 'Failed to create establishment' });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignMerchant = async (userId: string) => {
    if (!token || establishments.length === 0) {
      setErrorModal({ visible: true, message: 'Please create an establishment first' });
      return;
    }

    try {
      await api.establishments.assignMerchant(establishments[0].id, userId, token);
      setSuccessModal({ visible: true, message: 'User assigned as merchant' });
      loadData();
    } catch (error) {
      setErrorModal({ visible: true, message: 'Failed to assign merchant' });
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
      setConfirmModal({ visible: false, type: 'approve', requestId: '' });
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
      setConfirmModal({ visible: false, type: 'reject', requestId: '' });
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Admin Dashboard</Text>
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

          <Card style={styles.statsCard}>
            <View style={styles.statRow}>
              <View style={styles.stat}>
                <Building2 size={32} color={Colors.orange} />
                <Text style={styles.statValue}>{establishments.length}</Text>
                <Text style={styles.statLabel}>Establishments</Text>
              </View>
              <View style={styles.stat}>
                <Users size={32} color={Colors.amber} />
                <Text style={styles.statValue}>{users.length}</Text>
                <Text style={styles.statLabel}>Users</Text>
              </View>
              <View style={styles.stat}>
                <ClipboardList size={32} color={Colors.yellow} />
                <Text style={styles.statValue}>{merchantRequests.length}</Text>
                <Text style={styles.statLabel}>Requests</Text>
              </View>
            </View>
          </Card>

          <Card style={styles.actionCard}>
            <Text style={styles.cardTitle}>Quick Actions</Text>
            <Button
              title="Create Establishment"
              onPress={() => setShowEstablishmentModal(true)}
              style={styles.actionButton}
              testID="create-establishment-button"
            />
            <Button
              title="Manage Users"
              onPress={() => setShowUserModal(true)}
              variant="secondary"
              style={styles.actionButton}
              testID="manage-users-button"
            />
            <Button
              title="Merchant Requests"
              onPress={() => setShowRequestsModal(true)}
              variant="outline"
              testID="merchant-requests-button"
            />
          </Card>

          <Card style={styles.listCard}>
            <Text style={styles.cardTitle}>Establishments</Text>
            {establishments.length === 0 ? (
              <Text style={styles.emptyText}>No establishments yet</Text>
            ) : (
              establishments.map((est) => (
                <View key={est.id} style={styles.listItem}>
                  <View>
                    <Text style={styles.listItemTitle}>{est.name}</Text>
                    <Text style={styles.listItemSubtitle}>{est.address}</Text>
                  </View>
                </View>
              ))
            )}
          </Card>
        </ScrollView>

        <BottomSheet
          visible={showEstablishmentModal}
          onClose={() => setShowEstablishmentModal(false)}
          title="Create Establishment"
          testID="establishment-modal"
        >
          <FormInput
            label="Name"
            value={estName}
            onChangeText={setEstName}
            placeholder="Enter establishment name"
            testID="est-name"
          />
          <FormInput
            label="Address"
            value={estAddress}
            onChangeText={setEstAddress}
            placeholder="Enter address"
            testID="est-address"
          />
          <Button
            title="Create"
            onPress={handleCreateEstablishment}
            loading={loading}
            testID="create-est-button"
          />
        </BottomSheet>

        <BottomSheet
          visible={showUserModal}
          onClose={() => setShowUserModal(false)}
          title="Manage Users"
          testID="user-modal"
        >
          <FormInput
            label="Search Users"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by username or email"
            testID="search-users"
          />
          <ScrollView style={styles.userList}>
            {filteredUsers.map((u) => (
              <View key={u.id} style={styles.userItem}>
                <View style={styles.userInfo}>
                  <Text style={styles.userItemTitle}>{u.username}</Text>
                  <Text style={styles.userItemSubtitle}>{u.email}</Text>
                  <Text style={styles.userRole}>Role: {u.role}</Text>
                </View>
                {u.role === 'USER' && (
                  <Button
                    title="Make Merchant"
                    onPress={() => handleAssignMerchant(u.id)}
                    size="small"
                    variant="secondary"
                    testID={`assign-merchant-${u.id}`}
                  />
                )}
              </View>
            ))}
          </ScrollView>
        </BottomSheet>

        <BottomSheet
          visible={showRequestsModal}
          onClose={() => setShowRequestsModal(false)}
          title="Merchant Requests"
          testID="requests-modal"
        >
          <ScrollView style={styles.requestsList}>
            {merchantRequests.length === 0 ? (
              <Text style={styles.emptyText}>No pending requests</Text>
            ) : (
              merchantRequests.map((req) => (
                <View key={req.id} style={styles.requestItem}>
                  <View style={styles.requestInfo}>
                    <Text style={styles.requestTitle}>{req.businessName}</Text>
                    <Text style={styles.requestSubtitle}>
                      {req.businessAddress}
                    </Text>
                    <Text style={styles.requestDetail}>Phone: {req.phone}</Text>
                    {req.description && (
                      <Text style={styles.requestDescription}>{req.description}</Text>
                    )}
                  </View>
                  <View style={styles.requestActions}>
                    <Button
                      title="Approve"
                      onPress={() => setConfirmModal({ visible: true, type: 'approve', requestId: req.id })}
                      size="small"
                      style={styles.requestButton}
                      testID={`approve-request-${req.id}`}
                    />
                    <Button
                      title="Reject"
                      onPress={() => setConfirmModal({ visible: true, type: 'reject', requestId: req.id })}
                      size="small"
                      variant="outline"
                      testID={`reject-request-${req.id}`}
                    />
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </BottomSheet>

        <ModalConfirm
          visible={confirmModal.visible}
          onClose={() => setConfirmModal({ visible: false, type: 'approve', requestId: '' })}
          title={confirmModal.type === 'approve' ? 'Approve Request' : 'Reject Request'}
          message={
            confirmModal.type === 'approve'
              ? 'Are you sure you want to approve this merchant request? The user will be granted merchant role and an establishment will be created.'
              : 'Are you sure you want to reject this merchant request?'
          }
          onConfirm={() => {
            if (confirmModal.type === 'approve') {
              handleApproveRequest(confirmModal.requestId);
            } else {
              handleRejectRequest(confirmModal.requestId);
            }
          }}
          confirmText={confirmModal.type === 'approve' ? 'Approve' : 'Reject'}
          destructive={confirmModal.type === 'reject'}
          testID="confirm-modal"
        />

        <ModalSuccess
          visible={successModal.visible}
          onClose={() => setSuccessModal({ visible: false, message: '' })}
          title="Success"
          message={successModal.message}
          testID="admin-success-modal"
        />

        <ModalError
          visible={errorModal.visible}
          onClose={() => setErrorModal({ visible: false, message: '' })}
          title="Error"
          message={errorModal.message}
          testID="admin-error-modal"
        />
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
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text.primary,
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
  listCard: {
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
  userList: {
    maxHeight: 300,
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
  requestsList: {
    maxHeight: 400,
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
});
