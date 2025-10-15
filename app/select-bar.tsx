import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Search, MapPin } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useBar } from '@/contexts/BarContext';
import { api } from '@/services/api';
import Colors from '@/constants/colors';
import { Establishment } from '@/types';
import Card from '@/components/Card';

export default function SelectBarScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const { selectBar } = useBar();
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEstablishments();
  }, []);

  const loadEstablishments = async () => {
    if (!token) return;

    try {
      const data = await api.establishments.list(token);
      setEstablishments(data);
    } catch (error) {
      console.error('Failed to load establishments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBar = async (establishment: Establishment) => {
    await selectBar(establishment);
    router.replace('/user');
  };

  const filteredEstablishments = establishments.filter((est) =>
    est.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    est.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Your Bar</Text>
          <Text style={styles.subtitle}>Choose the bar where you&apos;re drinking today</Text>
        </View>

        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.text.secondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search bars..."
            placeholderTextColor={Colors.text.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            testID="search-bar"
          />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {loading ? (
            <Text style={styles.emptyText}>Loading...</Text>
          ) : filteredEstablishments.length === 0 ? (
            <Text style={styles.emptyText}>No bars found</Text>
          ) : (
            filteredEstablishments.map((est) => (
              <TouchableOpacity
                key={est.id}
                onPress={() => handleSelectBar(est)}
                testID={`bar-${est.id}`}
              >
                <Card style={styles.barCard}>
                  <View style={styles.barInfo}>
                    <MapPin size={24} color={Colors.orange} />
                    <View style={styles.barDetails}>
                      <Text style={styles.barName}>{est.name}</Text>
                      <Text style={styles.barAddress}>{est.address}</Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
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
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: Colors.text.primary,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.text.secondary,
    fontSize: 16,
    marginTop: 40,
  },
  barCard: {
    marginBottom: 16,
  },
  barInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barDetails: {
    flex: 1,
    marginLeft: 16,
  },
  barName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  barAddress: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
});
