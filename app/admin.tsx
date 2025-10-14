import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Building2, Users, UserPlus } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import Button from '@/components/Button';
import Card from '@/components/Card';
import { FormInput } from '@/components/Form';
import BottomSheet from '@/components/BottomSheet';
import Colors from '@/constants/colors';
import { Establishment, User } from '@/types';

export default function AdminScreen() {
  const router = useRouter();
  const { user, token, logout } = useAuth();
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showEstablishmentModal, setShowEstablishmentModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [estName, setEstName] = useState('');
  const [estAddress, setEstAddress] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!token) return;

    try {
      const [estData, userData] = await Promise.all([
        api.establishments.list(token),
        api.users.list(token),
      ]);
      setEstablishments(estData);
      setUsers(userData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleCreateEstablishment = async () => {
    if (!token || !estName || !estAddress) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await api.establishments.create(estName, estAddress, token);
      Alert.alert('Success', 'Establishment created successfully');
      setEstName('');
      setEstAddress('');
      setShowEstablishmentModal(false);
      loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to create establishment');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignMerchant = async (userId: string) => {
    if (!token || establishments.length === 0) {
      Alert.alert('Error', 'Please create an establishment first');
      return;
    }

    try {
      await api.establishments.assignMerchant(establishments[0].id, userId, token);
      Alert.alert('Success', 'User assigned as merchant');
      loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to assign merchant');
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
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
              testID="manage-users-button"
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
});
