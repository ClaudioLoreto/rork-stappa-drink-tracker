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
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Search, MapPin, LogOut, TicketPercent, Heart } from 'lucide-react-native';
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
  const { token, logout, user } = useAuth();
  const { selectBar } = useBar();
  const { t } = useLanguage();
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [promos, setPromos] = useState<Record<string, Promo | null>>({});
  const [favorites, setFavorites] = useState<string[]>([]);
  const [usageFrequency, setUsageFrequency] = useState<Record<string, number>>({});

  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadEstablishments();
    loadFavorites();
    loadUsageFrequency();
  }, []);

  const loadFavorites = async () => {
    if (!token || !user) return;
    try {
      const favs = await api.users.getFavorites(token, user.id);
      setFavorites(favs);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
  };

  const loadUsageFrequency = async () => {
    if (!token || !user) return;
    try {
      const validations = await api.validations.listUser(token, user.id);
      const frequency: Record<string, number> = {};
      validations.forEach((v: any) => {
        frequency[v.establishmentId] = (frequency[v.establishmentId] || 0) + 1;
      });
      setUsageFrequency(frequency);
    } catch (error) {
      console.error('Failed to load usage frequency:', error);
    }
  };

  const toggleFavorite = async (establishmentId: string) => {
    if (!token || !user) return;
    try {
      const result = await api.users.toggleFavorite(token, user.id, establishmentId);
      setFavorites(result.favorites);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      Alert.alert(t('common.error'), 'Impossibile aggiornare i preferiti');
    }
  };

  const loadEstablishments = async () => {
    if (!token) return;

    try {
      const data = await api.establishments.list(token);
      setEstablishments(data);
      const entries: Record<string, Promo | null> = {};
      await Promise.all(
        data.map(async (est) => {
          try {
            const promo = await api.promos.getActive(token, est.id);
            // Valida che la promo sia attiva E nel periodo valido
            if (promo && isPromoValid(promo)) {
              entries[est.id] = promo;
            } else {
              entries[est.id] = null;
            }
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

  // Valida se la promo è nel periodo attivo (startDate <= oggi <= endDate)
  const isPromoValid = (promo: Promo): boolean => {
    const now = new Date();
    const start = new Date(promo.startDate);
    const end = new Date(promo.endDate);
    return promo.isActive && now >= start && now <= end;
  };

  // Calcola priorità di vicinanza: 1=stessa città, 2=stessa provincia, 3=stessa regione, 4=altro
  const getProximityScore = (establishment: Establishment): number => {
    if (!user || !user.city || !establishment.city) return 4;
    
    try {
      if (establishment.city && user.city && establishment.city.toLowerCase() === user.city.toLowerCase()) {
        return 1; // Stessa città - massima priorità
      }
      if (establishment.province && user.province && establishment.province.toLowerCase() === user.province.toLowerCase()) {
        return 2; // Stessa provincia
      }
      if (establishment.region && user.region && establishment.region.toLowerCase() === user.region.toLowerCase()) {
        return 3; // Stessa regione
      }
    } catch (e) {
      console.warn('Error calculating proximity score', e);
      return 4;
    }
    return 4; // Altro
  };

  // Filtra e ordina establishments: PREFERITI → USATI → VICINI → ALTRI
  const sortedEstablishments = useMemo(() => {
    if (!establishments) return [];
    
    const filtered = establishments.filter((est) => {
      if (!est) return false;
      const query = searchQuery ? searchQuery.toLowerCase() : '';
      return (
        (est.name && est.name.toLowerCase().includes(query)) ||
        (est.address && est.address.toLowerCase().includes(query)) ||
        (est.city && est.city.toLowerCase().includes(query))
      );
    });

    return filtered.sort((a, b) => {
      // 1. PRIORITÀ MASSIMA: Preferiti (cuoricino)
      const aIsFav = favorites.includes(a.id) ? 1 : 0;
      const bIsFav = favorites.includes(b.id) ? 1 : 0;
      if (aIsFav !== bIsFav) {
        return bIsFav - aIsFav; // Preferiti sempre primi
      }

      // 2. SECONDA PRIORITÀ: Frequenza utilizzo (più usati prima)
      const aUsage = usageFrequency[a.id] || 0;
      const bUsage = usageFrequency[b.id] || 0;
      if (aUsage !== bUsage) {
        return bUsage - aUsage; // Più usati prima
      }

      // 3. TERZA PRIORITÀ: Presenza promo attiva
      const aHasPromo = promos[a.id] !== null ? 1 : 0;
      const bHasPromo = promos[b.id] !== null ? 1 : 0;
      if (aHasPromo !== bHasPromo) {
        return bHasPromo - aHasPromo; // Con promo prima
      }
      
      // 4. QUARTA PRIORITÀ: Vicinanza geografica
      const aProximity = getProximityScore(a);
      const bProximity = getProximityScore(b);
      if (aProximity !== bProximity) {
        return aProximity - bProximity; // Più vicini prima
      }
      
      // 5. INFINE: Ordine alfabetico
      return (a.name || '').localeCompare(b.name || '');
    });
  }, [establishments, promos, searchQuery, user, favorites, usageFrequency]);

  // Filtra establishments con promo valida per il carousel (ordinati per vicinanza)
  const establishmentsWithPromos = useMemo(() => {
    const withPromos = establishments.filter((est) => {
      const promo = promos[est.id];
      return promo && isPromoValid(promo);
    });

    // Ordina SOLO per vicinanza nel carousel (tutti i bar con promo, dal più vicino al più lontano)
    return withPromos.sort((a, b) => {
      const aProximity = getProximityScore(a);
      const bProximity = getProximityScore(b);
      
      if (aProximity !== bProximity) {
        return aProximity - bProximity; // Più vicini prima
      }
      
      return a.name.localeCompare(b.name); // Alfabetico se stessa vicinanza
    });
  }, [establishments, promos, user]);

  const handleSelectBar = async (establishment: Establishment) => {
    // Verifica che il bar abbia una promo attiva prima di permettere la selezione
    const promo = promos[establishment.id];
    if (!promo || !isPromoValid(promo)) {
      Alert.alert(
        t('errors.noActivePromo'),
        t('errors.merchantMustHavePromo'),
        [{ text: 'OK' }]
      );
      return;
    }
    
    await selectBar(establishment);
    router.replace('/user');
  };

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

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

        {establishmentsWithPromos.length > 0 && (
          <View style={styles.carouselContainer}>
            <View style={styles.carouselHeader}>
              <View style={styles.carouselTitleRow}>
                <Text style={styles.carouselTitle}>🎉 {t('social.activePromos')}</Text>
                <Text style={styles.carouselSubtitle}>📍 {t('location.nearYou')}</Text>
              </View>
              <View style={styles.promoBadge}>
                <Text style={styles.promoBadgeText}>
                  {establishmentsWithPromos.length}
                </Text>
              </View>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.carousel}
              decelerationRate="fast"
              snapToInterval={240}
              snapToAlignment="center"
            >
              {establishmentsWithPromos.map((est) => {
                const p = promos[est.id];
                if (!p) return null;
                
                const proximityScore = getProximityScore(est);
                let locationIcon = '🌍';
                if (proximityScore === 1) locationIcon = '📍';
                else if (proximityScore === 2) locationIcon = '🗺️';
                
                return (
                  <TouchableOpacity 
                    key={`promo-${est.id}`} 
                    onPress={() => router.push(`/social/${est.id}`)} 
                    activeOpacity={0.8} 
                    testID={`promo-${est.id}`}
                  >
                    <Card style={styles.promoCard}>
                      <View style={styles.promoHeader}>
                        <View style={styles.promoIconBadge}>
                          <TicketPercent size={20} color={Colors.orange} />
                        </View>
                        <Text style={styles.promoTag}>PROMO ATTIVA</Text>
                      </View>
                      <View style={styles.promoTitleRow}>
                        <Text style={styles.promoEstName} numberOfLines={2}>{est.name}</Text>
                        <Text style={styles.promoLocation}>{locationIcon}</Text>
                      </View>
                      {est.city && (
                        <Text style={styles.promoCityName} numberOfLines={1}>
                          {est.city}
                        </Text>
                      )}
                      <View style={styles.promoDivider} />
                      <View style={styles.promoDetails}>
                        <View style={styles.promoDetail}>
                          <Text style={styles.promoLabel}>{t('merchant.ticketsRequired')}</Text>
                          <Text style={styles.promoValue}>{p.ticketsRequired} 🎫</Text>
                        </View>
                        <View style={styles.promoDetail}>
                          <Text style={styles.promoLabel}>{t('merchant.rewardValue')}</Text>
                          <Text style={styles.promoValue}>€{p.rewardValue}</Text>
                        </View>
                      </View>
                      {p.description && (
                        <Text style={styles.promoDescription} numberOfLines={2}>
                          {p.description}
                        </Text>
                      )}
                      <View style={styles.promoFooter}>
                        <Text style={styles.promoFooterText}>Tocca per scoprire →</Text>
                      </View>
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
          ) : sortedEstablishments.length === 0 ? (
            <Text style={styles.emptyText}>{t('common.noResults')}</Text>
          ) : (
            sortedEstablishments.map((est: Establishment) => {
              const hasPromo = promos[est.id] && isPromoValid(promos[est.id]!);
              const proximityScore = getProximityScore(est);
              const isFavorite = favorites.includes(est.id);
              const usageCount = usageFrequency[est.id] || 0;
              let locationBadge = '';
              
              if (proximityScore === 1) locationBadge = '📍 ' + t('location.sameCity');
              else if (proximityScore === 2) locationBadge = '🗺️ ' + t('location.sameProvince');
              else if (proximityScore === 3) locationBadge = '🌍 ' + t('location.sameRegion');
              
              return (
                <View key={est.id} style={styles.barCardWrapper}>
                  <TouchableOpacity
                    onPress={() => handleSelectBar(est)}
                    testID={`bar-${est.id}`}
                    activeOpacity={0.7}
                    disabled={!hasPromo}
                    style={{ flex: 1 }}
                  >
                    <Card style={hasPromo ? styles.barCard : {...styles.barCard, ...styles.barCardDisabled}}>
                      <View style={styles.barInfo}>
                        <MapPin size={24} color={hasPromo ? Colors.orange : Colors.text.secondary} />
                        <View style={styles.barDetails}>
                          <View style={styles.barHeader}>
                            <View style={styles.barTitleRow}>
                              {isFavorite && <Text style={styles.favoriteBadge}>⭐</Text>}
                              <Text style={hasPromo ? styles.barName : {...styles.barName, ...styles.barNameDisabled}} numberOfLines={2}>
                                {est.name}
                              </Text>
                              {hasPromo && <View style={styles.activePromoBadge}><Text style={styles.activePromoText}>✓</Text></View>}
                            </View>
                          </View>
                          <Text style={styles.barAddress} numberOfLines={1}>{est.address}</Text>
                          <View style={styles.badgeRow}>
                            {locationBadge && <Text style={styles.locationBadge}>{locationBadge}</Text>}
                            {usageCount > 0 && (
                              <Text style={styles.usageBadge}>
                                🍺 {usageCount} {usageCount === 1 ? 'volta' : 'volte'}
                              </Text>
                            )}
                          </View>
                          {!hasPromo && (
                            <Text style={styles.noPromoWarning}>⚠️ {t('errors.noActivePromoShort')}</Text>
                          )}
                        </View>
                      </View>
                    </Card>
                  </TouchableOpacity>
                  
                  {/* Pulsante cuoricino per preferiti */}
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      toggleFavorite(est.id);
                    }}
                    style={styles.favoriteButton}
                    activeOpacity={0.7}
                  >
                    <Heart
                      size={22}
                      color={isFavorite ? '#FF6B6B' : Colors.text.secondary}
                      fill={isFavorite ? '#FF6B6B' : 'none'}
                    />
                  </TouchableOpacity>
                </View>
              );
            })
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
    backgroundColor: '#FFF8F0',
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
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
    minHeight: 80,
  },
  header: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '900' as const,
    color: Colors.orange,
    marginBottom: 4,
    textAlign: 'center',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(255, 138, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#8B7355',
    textAlign: 'center',
    fontWeight: '500' as const,
  },
  logoutButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E8DDD0',
    position: 'absolute',
    right: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#E8DDD0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
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
  carouselHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  carouselTitleRow: {
    flexDirection: 'column',
  },
  carouselTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  carouselSubtitle: {
    fontSize: 11,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  promoBadge: {
    backgroundColor: Colors.orange,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoBadgeText: {
    fontSize: 12,
    fontWeight: '800' as const,
    color: '#FFFFFF',
  },
  carousel: {
    gap: 10,
    paddingBottom: 8,
    paddingRight: 16,
  },
  promoCard: {
    width: 220,
    marginRight: 10,
    backgroundColor: Colors.orange + '10',
    borderWidth: 2,
    borderColor: Colors.orange + '30',
  },
  promoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  promoIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.orange + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoTag: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: Colors.orange,
    backgroundColor: Colors.orange + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  promoEstName: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    flex: 1,
  },
  promoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  promoLocation: {
    fontSize: 18,
    marginLeft: 6,
  },
  promoCityName: {
    fontSize: 11,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  promoDivider: {
    height: 1,
    backgroundColor: Colors.orange + '20',
    marginBottom: 10,
  },
  promoDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  promoDetail: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  promoLabel: {
    fontSize: 10,
    color: Colors.text.secondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  promoValue: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.orange,
  },
  promoDescription: {
    fontSize: 11,
    color: Colors.text.secondary,
    marginTop: 8,
    lineHeight: 16,
  },
  promoFooter: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.orange + '20',
  },
  promoFooterText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.orange,
    textAlign: 'center',
  },
  promoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
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
  barCardWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  barCard: {
    flex: 1,
    marginBottom: 0,
  },
  barCardDisabled: {
    opacity: 0.6,
    backgroundColor: Colors.border + '20',
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
  barHeader: {
    marginBottom: 2,
  },
  barTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  favoriteBadge: {
    fontSize: 16,
    marginRight: 6,
  },
  barName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    flex: 1,
    lineHeight: 22,
  },
  barNameDisabled: {
    color: Colors.text.secondary,
  },
  activePromoBadge: {
    backgroundColor: Colors.orange,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  activePromoText: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: '#FFFFFF',
  },
  barAddress: {
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 18,
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  locationBadge: {
    fontSize: 11,
    color: Colors.orange,
    fontWeight: '600' as const,
  },
  usageBadge: {
    fontSize: 11,
    color: Colors.text.secondary,
    fontWeight: '500' as const,
  },
  favoriteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  noPromoWarning: {
    fontSize: 11,
    color: '#FF6B6B',
    fontStyle: 'italic',
    marginTop: 4,
  },
});
