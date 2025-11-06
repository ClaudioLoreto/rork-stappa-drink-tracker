import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Search, MapPin, LogOut, TicketPercent } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useBar } from '@/contexts/BarContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { api } from '@/services/api';
import Colors from '@/constants/colors';
import { Establishment, Promo } from '@/types';
import Card from '@/components/Card';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SelectBarScreen() {
  const router = useRouter();
  const { token, logout } = useAuth();
  const { selectBar } = useBar();
  const { t } = useLanguage();
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [promos, setPromos] = useState<Record<string, Promo | null>>({});

  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadEstablishments();
  }, []);

  const loadEstablishments = async () => {
    if (!token) return;

    try {
      const data = await api.establishments.list(token);
      setEstablishments(data);
      const entries: Record<string, Promo | null> = {};
      await Promise.all(
        data.map(async (est) => {
          try {
            entries[est.id] = await api.promos.getActive(token, est.id);
          } catch (e) {
            entries[est.id] = null;
          }
        })
      );
      setPromos(entries);
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

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const filteredEstablishments = establishments.filter((est) =>
    est.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    est.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.wrapper}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={[styles.headerContainer, { paddingTop: insets.top + 12 }]}>
            <View style={styles.header}>
              <Text style={styles.title}>{t('user.selectBar')}</Text>
              <Text style={styles.subtitle}>{t('user.searchBar')}</Text>
            </View>
            <TouchableOpacity
              style={[styles.logoutButton, { top: insets.top + 8 }]}
              onPress={handleLogout}
              testID="logout-button"
            >
              <LogOut size={22} color={Colors.orange} />
            </TouchableOpacity>
          </View>

        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.text.secondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('common.searchPlaceholder')}
            placeholderTextColor={Colors.text.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            testID="search-bar"
          />
        </View>

        {Object.values(promos).some((p) => !!p) && (
          <View style={styles.carouselContainer}>
            <Text style={styles.carouselTitle}>{t('social.activePromos')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
              {establishments.map((est) => {
                const p = promos[est.id];
                if (!p) return null;
                return (
                  <TouchableOpacity key={`promo-${est.id}`} onPress={() => router.push(`/social/${est.id}`)} activeOpacity={0.8} testID={`promo-${est.id}`}>
                    <Card style={styles.promoCard}>
                      <View style={styles.promoCardHeader}>
                        <TicketPercent size={18} color={Colors.orange} />
                        <Text style={styles.promoEstName} numberOfLines={1}>{est.name}</Text>
                      </View>
                      <Text style={styles.promoSubtitle}>{t('merchant.ticketsRequired')}: {p.ticketsRequired}</Text>
                      <Text style={styles.promoSubtitle}>{t('merchant.rewardValue')}: €{p.rewardValue}</Text>
                    </Card>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {loading ? (
            <Text style={styles.emptyText}>{t('common.loading')}</Text>
          ) : filteredEstablishments.length === 0 ? (
            <Text style={styles.emptyText}>{t('common.noResults')}</Text>
          ) : (
            filteredEstablishments.map((est) => (
              <TouchableOpacity
                key={est.id}
                onPress={() => handleSelectBar(est)}
                testID={`bar-${est.id}`}
                activeOpacity={0.7}
              >
                <Card style={styles.barCard}>
                  <View style={styles.barInfo}>
                    <MapPin size={24} color={Colors.orange} />
                    <View style={styles.barDetails}>
                      <Text style={styles.barName} numberOfLines={2}>{est.name}</Text>
                      <Text style={styles.barAddress} numberOfLines={2}>{est.address}</Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    minHeight: 80,
  },
  header: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text.primary,
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'absolute',
    right: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 15,
    color: Colors.text.primary,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  carouselContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  carouselTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  carousel: {
    gap: 10,
    paddingBottom: 8,
  },
  promoCard: {
    width: 220,
    marginRight: 10,
  },
  promoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  promoEstName: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    flex: 1,
  },
  promoSubtitle: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.text.secondary,
    fontSize: 15,
    marginTop: 40,
  },
  barCard: {
    marginBottom: 12,
  },
  barInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  barDetails: {
    flex: 1,
    marginLeft: 12,
  },
  barName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 4,
    lineHeight: 22,
  },
  barAddress: {
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
});
