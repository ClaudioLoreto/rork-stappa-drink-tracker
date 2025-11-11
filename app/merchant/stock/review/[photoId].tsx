import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Check,
  X,
  Plus,
  Minus,
  ChevronDown,
  AlertTriangle,
  Package,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useBar } from '@/contexts/BarContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useThemeColors } from '@/hooks/useThemeColors';
import Card from '@/components/Card';
import Button from '@/components/Button';
import BottomSheet from '@/components/BottomSheet';
import { ModalError, ModalSuccess } from '@/components/ModalKit';
import { api } from '@/services/api';
import type { StockPhoto, ArticleRecognition, Article } from '@/types';
import Colors from '@/constants/colors';

export default function ReviewRecognitionsScreen() {
  const router = useRouter();
  const { photoId } = useLocalSearchParams<{ photoId: string }>();
  const { user, token } = useAuth();
  const { selectedBar } = useBar();
  const { t } = useLanguage();
  const colors = useThemeColors();

  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [stockPhoto, setStockPhoto] = useState<StockPhoto | null>(null);
  const [recognitions, setRecognitions] = useState<ArticleRecognition[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [showArticleSelector, setShowArticleSelector] = useState(false);
  const [selectedRecognitionIndex, setSelectedRecognitionIndex] = useState<number | null>(null);
  const [errorModal, setErrorModal] = useState({ visible: false, message: '' });
  const [successModal, setSuccessModal] = useState({ visible: false, message: '' });

  // Check permissions
  const canManageStock =
    user?.role === 'SENIOR_MERCHANT' || (user?.role === 'MERCHANT' && user?.canManageStock);

  const hasStockManagementEnabled = selectedBar?.hasStockManagement ?? false;

  useEffect(() => {
    if (!canManageStock || !hasStockManagementEnabled) {
      Alert.alert(
        t('common.error'),
        !canManageStock ? t('common.noPermission') : 'Gestione stock non abilitata per questo esercizio'
      );
      router.back();
      return;
    }
    loadData();
  }, [photoId]);

  const loadData = async () => {
    if (!token || !selectedBar || !photoId) return;

    setLoading(true);
    try {
      const [photoData, articlesData] = await Promise.all([
        api.stockPhotos.getById(token, photoId),
        api.articles.getList(token, selectedBar.id),
      ]);

      setStockPhoto(photoData);
      setRecognitions(photoData.recognitions || []);
      setArticles(articlesData);
    } catch (error) {
      setErrorModal({ visible: true, message: t('common.loadError') });
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (index: number, delta: number) => {
    setRecognitions((prev) => {
      const updated = [...prev];
      updated[index].quantity = Math.max(0, updated[index].quantity + delta);
      return updated;
    });
  };

  const handleArticleSelect = (index: number) => {
    setSelectedRecognitionIndex(index);
    setShowArticleSelector(true);
  };

  const handleArticleAssign = (articleId: string) => {
    if (selectedRecognitionIndex === null) return;

    setRecognitions((prev) => {
      const updated = [...prev];
      updated[selectedRecognitionIndex].articleId = articleId;
      updated[selectedRecognitionIndex].status = 'CONFIRMED';
      return updated;
    });
    setShowArticleSelector(false);
    setSelectedRecognitionIndex(null);
  };

  const handleToggleConfirm = (index: number) => {
    setRecognitions((prev) => {
      const updated = [...prev];
      updated[index].status =
        updated[index].status === 'CONFIRMED' ? 'PENDING' : 'CONFIRMED';
      return updated;
    });
  };

  const handleConfirmAll = async () => {
    if (!token || !photoId || !selectedBar) return;

    // Check if all recognitions are confirmed
    const unconfirmed = recognitions.filter((r) => r.status !== 'CONFIRMED');
    if (unconfirmed.length > 0) {
      Alert.alert(
        'Conferma Incompleta',
        `Ci sono ${unconfirmed.length} articoli non confermati. Confermarli tutti?`,
        [
          { text: 'Annulla', style: 'cancel' },
          {
            text: 'Conferma Tutti',
            onPress: () => proceedWithConfirmation(),
          },
        ]
      );
      return;
    }

    await proceedWithConfirmation();
  };

  const proceedWithConfirmation = async () => {
    if (!token || !photoId || !user) return;

    setConfirming(true);
    try {
      // Confirm all recognitions and update stock
      await api.stockPhotos.confirmAllAndUpdate(token, photoId, user.id);

      setSuccessModal({
        visible: true,
        message: `✅ ${recognitions.length} articoli aggiunti allo stock!`,
      });

      // Navigate back after success
      setTimeout(() => {
        router.back();
        router.back(); // Go back to stock screen
      }, 1500);
    } catch (error) {
      setErrorModal({
        visible: true,
        message: 'Errore durante l\'aggiornamento dello stock. Riprova.',
      });
    } finally {
      setConfirming(false);
    }
  };

  const handleDiscard = () => {
    Alert.alert(
      'Scarta Foto',
      'Sei sicuro di voler scartare questa foto e tutti i riconoscimenti?',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Scarta',
          style: 'destructive',
          onPress: () => {
            router.back();
            router.back();
          },
        },
      ]
    );
  };

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

  const getArticleName = (articleId?: string) => {
    if (!articleId) return 'Articolo non assegnato';
    const article = articles.find((a) => a.id === articleId);
    return article ? article.name : 'Articolo sconosciuto';
  };

  const confirmedCount = recognitions.filter((r) => r.status === 'CONFIRMED').length;
  const totalCount = recognitions.length;

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
        <Stack.Screen
          options={{
            title: 'Revisione Riconoscimenti',
            headerShown: true,
            headerStyle: {
              backgroundColor: colors.background.card,
            },
            headerTintColor: colors.text.primary,
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.orange} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <Stack.Screen
        options={{
          title: 'Revisione Riconoscimenti',
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.background.card,
          },
          headerTintColor: colors.text.primary,
        }}
      />
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Photo Preview */}
          {stockPhoto?.imageUrl && (
            <Card style={styles.photoCard}>
              <Image source={{ uri: stockPhoto.imageUrl }} style={styles.photoPreview} />
              <View style={styles.photoInfo}>
                <Text style={[styles.photoLabel, { color: colors.text.secondary }]}>
                  Foto Inventario
                </Text>
                <Text style={[styles.photoDate, { color: colors.text.primary }]}>
                  {new Date(stockPhoto.createdAt).toLocaleString('it-IT', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </Card>
          )}

          {/* Stats */}
          <Card style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Package size={24} color={colors.orange} />
                <Text style={[styles.statValue, { color: colors.text.primary }]}>
                  {totalCount}
                </Text>
                <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
                  Rilevati
                </Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statItem}>
                <Check size={24} color={Colors.success} />
                <Text style={[styles.statValue, { color: colors.text.primary }]}>
                  {confirmedCount}
                </Text>
                <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
                  Confermati
                </Text>
              </View>
            </View>
          </Card>

          {/* Recognition List */}
          <View style={styles.recognitionsList}>
            {recognitions.map((recognition, index) => {
              const article = articles.find((a) => a.id === recognition.articleId);
              const isConfirmed = recognition.status === 'CONFIRMED';

              return (
                <Card key={recognition.id} style={styles.recognitionCard}>
                  <View style={styles.recognitionHeader}>
                    <View style={styles.recognitionInfo}>
                      <Text style={styles.recognitionIcon}>
                        {article ? getCategoryIcon(article.category) : '❓'}
                      </Text>
                      <View style={styles.recognitionTexts}>
                        <Text style={[styles.recognitionName, { color: colors.text.primary }]}>
                          {getArticleName(recognition.articleId)}
                        </Text>
                        {recognition.confidence && (
                          <Text
                            style={[styles.recognitionConfidence, { color: colors.text.secondary }]}
                          >
                            Confidenza: {Math.round(recognition.confidence * 100)}%
                          </Text>
                        )}
                      </View>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.confirmToggle,
                        {
                          backgroundColor: isConfirmed
                            ? Colors.success + '20'
                            : colors.border + '40',
                        },
                      ]}
                      onPress={() => handleToggleConfirm(index)}
                    >
                      <Check
                        size={20}
                        color={isConfirmed ? Colors.success : colors.text.secondary}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Quantity Controls */}
                  <View style={styles.quantitySection}>
                    <Text style={[styles.quantityLabel, { color: colors.text.secondary }]}>
                      Quantità
                    </Text>
                    <View style={styles.quantityControls}>
                      <TouchableOpacity
                        style={[styles.quantityButton, { backgroundColor: colors.error + '20' }]}
                        onPress={() => handleQuantityChange(index, -1)}
                        disabled={recognition.quantity === 0}
                      >
                        <Minus size={18} color={colors.error} />
                      </TouchableOpacity>

                      <Text style={[styles.quantityValue, { color: colors.text.primary }]}>
                        {recognition.quantity}
                      </Text>

                      <TouchableOpacity
                        style={[
                          styles.quantityButton,
                          { backgroundColor: Colors.success + '20' },
                        ]}
                        onPress={() => handleQuantityChange(index, 1)}
                      >
                        <Plus size={18} color={Colors.success} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Article Assignment */}
                  <TouchableOpacity
                    style={[styles.articleSelector, { borderColor: colors.border }]}
                    onPress={() => handleArticleSelect(index)}
                  >
                    <Text
                      style={[
                        styles.articleSelectorText,
                        {
                          color: recognition.articleId
                            ? colors.text.primary
                            : colors.text.secondary,
                        },
                      ]}
                    >
                      {recognition.articleId
                        ? `${getCategoryIcon(article?.category || '')} ${getArticleName(
                            recognition.articleId
                          )}`
                        : 'Seleziona Articolo'}
                    </Text>
                    <ChevronDown size={20} color={colors.text.secondary} />
                  </TouchableOpacity>

                  {!isConfirmed && (
                    <View style={styles.warningBanner}>
                      <AlertTriangle size={16} color={Colors.orange} />
                      <Text style={[styles.warningText, { color: Colors.orange }]}>
                        Non confermato
                      </Text>
                    </View>
                  )}
                </Card>
              );
            })}
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View style={[styles.bottomActions, { backgroundColor: colors.background.card }]}>
          <TouchableOpacity
            style={[styles.discardButton, { borderColor: colors.error }]}
            onPress={handleDiscard}
          >
            <X size={20} color={colors.error} />
            <Text style={[styles.discardButtonText, { color: colors.error }]}>Scarta</Text>
          </TouchableOpacity>

          <Button
            title={`✓ Conferma Tutto (${confirmedCount}/${totalCount})`}
            onPress={handleConfirmAll}
            loading={confirming}
            disabled={recognitions.length === 0}
            style={styles.confirmButton}
          />
        </View>

        {/* Article Selector Modal */}
        <BottomSheet
          visible={showArticleSelector}
          onClose={() => {
            setShowArticleSelector(false);
            setSelectedRecognitionIndex(null);
          }}
          title="Seleziona Articolo"
        >
          <ScrollView style={styles.articleList}>
            {articles.map((article) => (
              <TouchableOpacity
                key={article.id}
                style={[styles.articleItem, { borderBottomColor: colors.border }]}
                onPress={() => handleArticleAssign(article.id)}
              >
                <Text style={styles.articleItemIcon}>{getCategoryIcon(article.category)}</Text>
                <View style={styles.articleItemTexts}>
                  <Text style={[styles.articleItemName, { color: colors.text.primary }]}>
                    {article.name}
                  </Text>
                  {article.brand && (
                    <Text style={[styles.articleItemBrand, { color: colors.text.secondary }]}>
                      {article.brand}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </BottomSheet>

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
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  photoCard: {
    marginBottom: 16,
    padding: 0,
    overflow: 'hidden',
  },
  photoPreview: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  photoInfo: {
    padding: 12,
  },
  photoLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  photoDate: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  statsCard: {
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800' as const,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 60,
    marginHorizontal: 16,
  },
  recognitionsList: {
    gap: 12,
  },
  recognitionCard: {
    gap: 12,
  },
  recognitionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  recognitionInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recognitionIcon: {
    fontSize: 32,
  },
  recognitionTexts: {
    flex: 1,
  },
  recognitionName: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  recognitionConfidence: {
    fontSize: 13,
  },
  confirmToggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantitySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  quantityLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityValue: {
    fontSize: 20,
    fontWeight: '800' as const,
    minWidth: 40,
    textAlign: 'center',
  },
  articleSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  articleSelectorText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.orange + '20',
  },
  warningText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  discardButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
  },
  discardButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  confirmButton: {
    flex: 2,
  },
  articleList: {
    maxHeight: 400,
    padding: 16,
  },
  articleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  articleItemIcon: {
    fontSize: 28,
  },
  articleItemTexts: {
    flex: 1,
  },
  articleItemName: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  articleItemBrand: {
    fontSize: 13,
  },
});
