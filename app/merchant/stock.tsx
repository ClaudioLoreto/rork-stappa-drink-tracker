import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Package,
  Plus,
  Minus,
  Camera,
  AlertTriangle,
  Search,
  TrendingDown,
  Filter,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useBar } from '@/contexts/BarContext';
import { useThemeColors } from '@/hooks/useThemeColors';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { ModalError, ModalSuccess } from '@/components/ModalKit';
import { api } from '@/services/api';
import type { Article, StockEntry } from '@/types';
import Colors from '@/constants/colors';

export default function StockManagementScreen() {
  const router = useRouter();
  const { user, token } = useAuth();
  const { selectedBar } = useBar();
  const { t } = useLanguage();
  const colors = useThemeColors();

  const [articles, setArticles] = useState<Article[]>([]);
  const [stock, setStock] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [errorModal, setErrorModal] = useState({ visible: false, message: '' });
  const [successModal, setSuccessModal] = useState({ visible: false, message: '' });
  const [updatingStock, setUpdatingStock] = useState<string | null>(null);

  // Check permissions
  const canManageStock =
    user?.role === 'SENIOR_MERCHANT' || (user?.role === 'MERCHANT' && user?.canManageStock);

  const hasStockManagementEnabled = selectedBar?.hasStockManagement ?? false;

  useEffect(() => {
    if (!canManageStock) {
      setErrorModal({ visible: true, message: t('common.noPermission') });
      return;
    }
    if (!hasStockManagementEnabled) {
      setErrorModal({ visible: true, message: 'Gestione stock non abilitata per questo esercizio' });
      return;
    }
    loadData();
  }, [selectedBar]);

  const loadData = async () => {
    if (!token || !selectedBar) return;

    setLoading(true);
    try {
      const [articlesData, stockData] = await Promise.all([
        api.articles.getList(token, selectedBar.id),
        api.stock.getStock(token, selectedBar.id),
      ]);

      setArticles(articlesData);
      
      // Convert stock array to map for easy lookup
      const stockMap: Record<string, number> = {};
      stockData.forEach((entry: StockEntry) => {
        stockMap[entry.articleId] = entry.quantity;
      });
      setStock(stockMap);
    } catch (error) {
      setErrorModal({ visible: true, message: t('common.loadError') });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = useCallback(
    async (articleId: string, delta: number) => {
      if (!token || !selectedBar || !user) return;

      setUpdatingStock(articleId);
      try {
        const currentQuantity = stock[articleId] || 0;
        const newQuantity = Math.max(0, currentQuantity + delta);

        const type = delta > 0 ? 'LOAD' : 'UNLOAD';
        const absQuantity = Math.abs(delta);

        await api.stock.updateStock(token, articleId, absQuantity, type, user.id);

        setStock((prev) => ({
          ...prev,
          [articleId]: newQuantity,
        }));
      } catch (error) {
        setErrorModal({ visible: true, message: t('common.updateError') });
      } finally {
        setUpdatingStock(null);
      }
    },
    [token, selectedBar, user, stock]
  );

  const handleOpenCamera = () => {
    router.push('/merchant/stock/camera' as any);
  };

  // Filter articles
  const filteredArticles = articles.filter((article) => {
    const matchesSearch = article.name.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (showLowStockOnly) {
      const currentStock = stock[article.id] || 0;
      return currentStock <= article.minStock;
    }

    return true;
  });

  // Group by low stock status
  const lowStockArticles = filteredArticles.filter(
    (article) => (stock[article.id] || 0) <= article.minStock
  );

  const normalStockArticles = filteredArticles.filter(
    (article) => (stock[article.id] || 0) > article.minStock
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'BEER':
        return '🍺';
      case 'WINE':
        return '🍷';
      case 'SPIRITS':
        return '🥃';
      case 'COCKTAIL':
        return '🍹';
      case 'SOFT_DRINK':
        return '🥤';
      case 'FOOD':
        return '🍔';
      default:
        return '📦';
    }
  };

  const renderArticleCard = (article: Article) => {
    const currentStock = stock[article.id] || 0;
    const isLowStock = currentStock <= article.minStock;
    const isUpdating = updatingStock === article.id;

    return (
      <Card key={article.id} style={styles.articleCard}>
        <View style={styles.articleHeader}>
          <View style={styles.articleInfo}>
            <View style={styles.articleTitleRow}>
              <Text style={styles.categoryIcon}>{getCategoryIcon(article.category)}</Text>
              <View style={styles.articleTexts}>
                <Text style={[styles.articleName, { color: colors.text.primary }]}>
                  {article.name}
                </Text>
                {article.brand && (
                  <Text style={[styles.articleSku, { color: colors.text.secondary }]}>
                    {article.brand}
                  </Text>
                )}
              </View>
            </View>
          </View>
          {isLowStock && (
            <View style={styles.lowStockBadge}>
              <AlertTriangle size={14} color="#FFFFFF" />
            </View>
          )}
        </View>

        <View style={styles.stockSection}>
          <View style={styles.stockInfo}>
            <Text style={[styles.stockLabel, { color: colors.text.secondary }]}>
              Stock Attuale
            </Text>
            <Text
              style={[
                styles.stockValue,
                { color: isLowStock ? colors.error : colors.text.primary },
              ]}
            >
              {currentStock} pz
            </Text>
            {isLowStock && (
              <Text style={[styles.minStockText, { color: colors.error }]}>
                Min: {article.minStock}
              </Text>
            )}
          </View>

          <View style={styles.stockControls}>
            <TouchableOpacity
              style={[styles.stockButton, styles.decreaseButton]}
              onPress={() => handleUpdateStock(article.id, -1)}
              disabled={isUpdating || currentStock === 0}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Minus size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.stockButton, styles.increaseButton]}
              onPress={() => handleUpdateStock(article.id, 1)}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Plus size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    );
  };

  if (!canManageStock || !hasStockManagementEnabled) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background.primary }]}>
        <View style={styles.container}>
          <Text style={[styles.noPermissionText, { color: colors.text.secondary }]}>
            {!canManageStock ? t('common.noPermission') : 'Gestione stock non abilitata per questo esercizio'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Dynamic styles
  const dynamicStyles = StyleSheet.create({
    searchInput: {
      ...styles.searchInput,
      backgroundColor: colors.background.card,
      color: colors.text.primary,
      borderColor: colors.border,
    },
    filterButton: {
      ...styles.filterButton,
      backgroundColor: showLowStockOnly ? colors.orange + '20' : colors.background.card,
      borderColor: showLowStockOnly ? colors.orange : colors.border,
    },
    filterText: {
      ...styles.filterText,
      color: showLowStockOnly ? colors.orange : colors.text.secondary,
    },
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <Stack.Screen
        options={{
          title: 'Gestione Stock',
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.background.card,
          },
          headerTintColor: colors.text.primary,
        }}
      />
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        {/* Search and Filters */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Search size={20} color={colors.text.secondary} />
            <TextInput
              style={dynamicStyles.searchInput}
              placeholder="Cerca articolo o SKU..."
              placeholderTextColor={colors.text.secondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <TouchableOpacity
            style={dynamicStyles.filterButton}
            onPress={() => setShowLowStockOnly(!showLowStockOnly)}
          >
            <TrendingDown
              size={18}
              color={showLowStockOnly ? colors.orange : colors.text.secondary}
            />
            <Text style={dynamicStyles.filterText}>Stock Basso</Text>
          </TouchableOpacity>
        </View>

        {/* Camera Button */}
        <View style={styles.cameraSection}>
          <Button
            title="📷  Scatta Foto Inventario"
            onPress={handleOpenCamera}
            style={styles.cameraButton}
          />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.orange} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Low Stock Alert */}
            {lowStockArticles.length > 0 && !showLowStockOnly && (
              <View style={styles.alertSection}>
                <View style={styles.alertHeader}>
                  <AlertTriangle size={20} color={colors.error} />
                  <Text style={[styles.alertTitle, { color: colors.error }]}>
                    Stock in Esaurimento ({lowStockArticles.length})
                  </Text>
                </View>
                {lowStockArticles.slice(0, 3).map(renderArticleCard)}
                {lowStockArticles.length > 3 && (
                  <TouchableOpacity
                    style={styles.viewAllButton}
                    onPress={() => setShowLowStockOnly(true)}
                  >
                    <Text style={[styles.viewAllText, { color: colors.orange }]}>
                      Vedi tutti ({lowStockArticles.length - 3} altri)
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* All Articles or Low Stock Only */}
            {showLowStockOnly ? (
              <>
                {lowStockArticles.length === 0 ? (
                  <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
                    Nessun articolo con stock basso
                  </Text>
                ) : (
                  lowStockArticles.map(renderArticleCard)
                )}
              </>
            ) : (
              <>
                {normalStockArticles.length > 0 && (
                  <View style={styles.normalSection}>
                    <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>
                      Altri Articoli
                    </Text>
                    {normalStockArticles.map(renderArticleCard)}
                  </View>
                )}
              </>
            )}

            {filteredArticles.length === 0 && !loading && (
              <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
                Nessun articolo trovato
              </Text>
            )}
          </ScrollView>
        )}

        <ModalError
          visible={errorModal.visible}
          onClose={() => setErrorModal({ visible: false, message: '' })}
          title={t('common.error')}
          message={errorModal.message}
        />

        <ModalSuccess
          visible={successModal.visible}
          onClose={() => setSuccessModal({ visible: false, message: '' })}
          title={t('common.success')}
          message={successModal.message}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchSection: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  cameraSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  cameraButton: {
    flexDirection: 'row',
    gap: 8,
  },
  scrollContent: {
    padding: 16,
  },
  alertSection: {
    marginBottom: 24,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  viewAllButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  normalSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  articleCard: {
    marginBottom: 12,
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  articleInfo: {
    flex: 1,
  },
  articleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryIcon: {
    fontSize: 32,
  },
  articleTexts: {
    flex: 1,
  },
  articleName: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  articleSku: {
    fontSize: 13,
  },
  lowStockBadge: {
    backgroundColor: Colors.error,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stockSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockInfo: {
    flex: 1,
  },
  stockLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  stockValue: {
    fontSize: 24,
    fontWeight: '800' as const,
    marginBottom: 2,
  },
  minStockText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  stockControls: {
    flexDirection: 'row',
    gap: 8,
  },
  stockButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  decreaseButton: {
    backgroundColor: Colors.error,
  },
  increaseButton: {
    backgroundColor: Colors.success,
  },
  noPermissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
});
