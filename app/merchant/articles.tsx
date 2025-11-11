import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useBar } from '@/contexts/BarContext';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useResponsive, useResponsiveValue } from '@/hooks/useResponsive';
import { scaleFontSize, scaleSpacing } from '@/utils/responsive';
import { api } from '@/services/api';
import { Article, ArticleCategory } from '@/types';

const CATEGORIES: { value: ArticleCategory; label: string; icon: string }[] = [
  { value: 'BEER', label: 'Birre', icon: 'beer-outline' },
  { value: 'WINE', label: 'Vini', icon: 'wine-outline' },
  { value: 'SPIRITS', label: 'Liquori', icon: 'flask-outline' },
  { value: 'COCKTAIL', label: 'Cocktail', icon: 'color-palette-outline' },
  { value: 'SOFT_DRINK', label: 'Analcolici', icon: 'water-outline' },
  { value: 'FOOD', label: 'Cibo', icon: 'restaurant-outline' },
  { value: 'OTHER', label: 'Altro', icon: 'ellipsis-horizontal-outline' },
];

export default function ArticlesScreen() {
  const { user } = useAuth();
  const { selectedBar } = useBar();
  const colors = useThemeColors();
  const { isSmallDevice } = useResponsive();
  const router = useRouter();

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ArticleCategory | undefined>();
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'BEER' as ArticleCategory,
    brand: '',
    size: '',
    description: '',
    barcode: '',
    minStock: '10',
  });

  // Check permissions
  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }

    if (!selectedBar?.hasStockManagement) {
      Alert.alert(
        'Gestione Stock Disabilitata',
        'Gestione stock non abilitata per questo esercizio.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
      return;
    }

    if (user.role === 'MERCHANT' && !user.canManageStock) {
      Alert.alert(
        'Accesso Negato',
        'Non hai i permessi per gestire il magazzino. Contatta il senior merchant.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
      return;
    }

    if (user.role !== 'ROOT' && user.role !== 'SENIOR_MERCHANT' && user.role !== 'MERCHANT') {
      Alert.alert('Accesso Negato', 'Solo i merchant possono accedere a questa sezione.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  }, [user]);

  useEffect(() => {
    loadArticles();
  }, [selectedCategory, showLowStockOnly, searchQuery]);

  const loadArticles = async () => {
    if (!user?.establishmentId) return;

    try {
      setLoading(true);
      const filters = {
        category: selectedCategory,
        search: searchQuery || undefined,
        lowStock: showLowStockOnly,
      };

      const data = await api.articles.getList('token', user.establishmentId, filters);
      setArticles(data);
    } catch (error: any) {
      Alert.alert('Errore', error.message || 'Impossibile caricare gli articoli');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (article?: Article) => {
    if (article) {
      setEditingArticle(article);
      setFormData({
        name: article.name,
        category: article.category,
        brand: article.brand || '',
        size: article.size || '',
        description: article.description || '',
        barcode: article.barcode || '',
        minStock: article.minStock.toString(),
      });
    } else {
      setEditingArticle(null);
      setFormData({
        name: '',
        category: 'BEER',
        brand: '',
        size: '',
        description: '',
        barcode: '',
        minStock: '10',
      });
    }
    setModalVisible(true);
  };

  const handleSaveArticle = async () => {
    if (!user?.establishmentId) return;

    if (!formData.name.trim()) {
      Alert.alert('Errore', 'Il nome è obbligatorio');
      return;
    }

    try {
      const articleData = {
        establishmentId: user.establishmentId,
        name: formData.name.trim(),
        category: formData.category,
        brand: formData.brand.trim() || undefined,
        size: formData.size.trim() || undefined,
        description: formData.description.trim() || undefined,
        barcode: formData.barcode.trim() || undefined,
        minStock: parseInt(formData.minStock) || 10,
      };

      if (editingArticle) {
        await api.articles.update('token', editingArticle.id, articleData);
        Alert.alert('Successo', 'Articolo aggiornato');
      } else {
        await api.articles.create('token', articleData);
        Alert.alert('Successo', 'Articolo creato');
      }

      setModalVisible(false);
      loadArticles();
    } catch (error: any) {
      Alert.alert('Errore', error.message || 'Impossibile salvare l\'articolo');
    }
  };

  const handleDeleteArticle = (article: Article) => {
    Alert.alert(
      'Conferma Eliminazione',
      `Vuoi eliminare "${article.name}"? Questa azione non può essere annullata.`,
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.articles.delete('token', article.id);
              Alert.alert('Successo', 'Articolo eliminato');
              loadArticles();
            } catch (error: any) {
              Alert.alert('Errore', error.message || 'Impossibile eliminare l\'articolo');
            }
          },
        },
      ]
    );
  };

  const getCategoryIcon = (category: ArticleCategory) => {
    return CATEGORIES.find((c) => c.value === category)?.icon || 'help-outline';
  };

  const getCategoryLabel = (category: ArticleCategory) => {
    return CATEGORIES.find((c) => c.value === category)?.label || category;
  };

  const renderArticleItem = ({ item }: { item: Article }) => {
    const isLowStock = item.currentStock <= item.minStock;

    return (
      <TouchableOpacity
        style={{
          backgroundColor: colors.background.card,
          padding: scaleSpacing(16),
          marginHorizontal: scaleSpacing(16),
          marginBottom: scaleSpacing(12),
          borderRadius: 12,
          borderLeftWidth: 4,
          borderLeftColor: isLowStock ? colors.error : colors.amber,
        }}
        onPress={() => handleOpenModal(item)}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: scaleSpacing(4) }}>
              <Ionicons name={getCategoryIcon(item.category) as any} size={20} color={colors.amber} />
              <Text
                style={{
                  fontSize: scaleFontSize(16),
                  fontWeight: 'bold',
                  color: colors.text.primary,
                  marginLeft: scaleSpacing(8),
                }}
              >
                {item.name}
              </Text>
            </View>

            {item.brand && (
              <Text style={{ fontSize: scaleFontSize(14), color: colors.text.secondary, marginBottom: scaleSpacing(4) }}>
                {item.brand} {item.size && `• ${item.size}`}
              </Text>
            )}

            <Text style={{ fontSize: scaleFontSize(13), color: colors.text.secondary, marginBottom: scaleSpacing(8) }}>
              {getCategoryLabel(item.category)}
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text
                style={{
                  fontSize: scaleFontSize(18),
                  fontWeight: 'bold',
                  color: isLowStock ? colors.error : colors.success,
                }}
              >
                {item.currentStock}
              </Text>
              <Text style={{ fontSize: scaleFontSize(14), color: colors.text.secondary, marginLeft: scaleSpacing(4) }}>
                / {item.minStock} min
              </Text>
            </View>

            {isLowStock && (
              <View
                style={{
                  backgroundColor: colors.error + '20',
                  paddingHorizontal: scaleSpacing(8),
                  paddingVertical: scaleSpacing(4),
                  borderRadius: 6,
                  marginTop: scaleSpacing(8),
                  alignSelf: 'flex-start',
                }}
              >
                <Text style={{ fontSize: scaleFontSize(12), color: colors.error, fontWeight: 'bold' }}>
                  ⚠️ Scorta bassa
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={() => handleDeleteArticle(item)}
            style={{ padding: scaleSpacing(8) }}
          >
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: scaleSpacing(16),
          paddingVertical: scaleSpacing(12),
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: scaleSpacing(12) }}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={{ fontSize: scaleFontSize(20), fontWeight: 'bold', color: colors.text.primary }}>
            Articoli Magazzino
          </Text>
        </View>
        <TouchableOpacity onPress={() => handleOpenModal()}>
          <Ionicons name="add-circle" size={28} color={colors.amber} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={{ paddingHorizontal: scaleSpacing(16), paddingTop: scaleSpacing(12) }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.background.card,
            borderRadius: 10,
            paddingHorizontal: scaleSpacing(12),
            height: scaleSpacing(44),
          }}
        >
          <Ionicons name="search" size={20} color={colors.text.secondary} />
          <TextInput
            style={{
              flex: 1,
              marginLeft: scaleSpacing(8),
              fontSize: scaleFontSize(15),
              color: colors.text.primary,
            }}
            placeholder="Cerca per nome, marca o codice..."
            placeholderTextColor={colors.text.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ maxHeight: scaleSpacing(60) }}
        contentContainerStyle={{ paddingHorizontal: scaleSpacing(16), paddingVertical: scaleSpacing(12) }}
      >
        <TouchableOpacity
          style={{
            paddingHorizontal: scaleSpacing(16),
            paddingVertical: scaleSpacing(8),
            borderRadius: 20,
            backgroundColor: showLowStockOnly ? colors.error : colors.background.card,
            marginRight: scaleSpacing(8),
          }}
          onPress={() => setShowLowStockOnly(!showLowStockOnly)}
        >
          <Text
            style={{
              fontSize: scaleFontSize(14),
              fontWeight: '600',
              color: showLowStockOnly ? '#FFF' : colors.text.primary,
            }}
          >
            ⚠️ Scorta bassa
          </Text>
        </TouchableOpacity>

        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.value}
            style={{
              paddingHorizontal: scaleSpacing(16),
              paddingVertical: scaleSpacing(8),
              borderRadius: 20,
              backgroundColor: selectedCategory === cat.value ? colors.amber : colors.background.card,
              marginRight: scaleSpacing(8),
            }}
            onPress={() => setSelectedCategory(selectedCategory === cat.value ? undefined : cat.value)}
          >
            <Text
              style={{
                fontSize: scaleFontSize(14),
                fontWeight: '600',
                color: selectedCategory === cat.value ? '#FFF' : colors.text.primary,
              }}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Articles List */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.amber} />
        </View>
      ) : articles.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: scaleSpacing(32) }}>
          <Ionicons name="cube-outline" size={64} color={colors.text.secondary} />
          <Text
            style={{
              fontSize: scaleFontSize(18),
              fontWeight: 'bold',
              color: colors.text.primary,
              marginTop: scaleSpacing(16),
              textAlign: 'center',
            }}
          >
            Nessun articolo
          </Text>
          <Text
            style={{
              fontSize: scaleFontSize(14),
              color: colors.text.secondary,
              marginTop: scaleSpacing(8),
              textAlign: 'center',
            }}
          >
            Aggiungi il tuo primo articolo per iniziare a gestire il magazzino
          </Text>
        </View>
      ) : (
        <FlatList
          data={articles}
          renderItem={renderArticleItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: scaleSpacing(12) }}
        />
      )}

      {/* Create/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              backgroundColor: colors.background.primary,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              maxHeight: '90%',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: scaleSpacing(16),
                paddingVertical: scaleSpacing(16),
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <Text style={{ fontSize: scaleFontSize(18), fontWeight: 'bold', color: colors.text.primary }}>
                {editingArticle ? 'Modifica Articolo' : 'Nuovo Articolo'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ paddingHorizontal: scaleSpacing(16), paddingVertical: scaleSpacing(16) }}
              contentContainerStyle={{ paddingBottom: scaleSpacing(32) }}
            >
              {/* Nome */}
              <Text style={{ fontSize: scaleFontSize(14), fontWeight: '600', color: colors.text.primary, marginBottom: scaleSpacing(8) }}>
                Nome *
              </Text>
              <TextInput
                style={{
                  backgroundColor: colors.background.card,
                  borderRadius: 10,
                  paddingHorizontal: scaleSpacing(12),
                  height: scaleSpacing(44),
                  fontSize: scaleFontSize(15),
                  color: colors.text.primary,
                  marginBottom: scaleSpacing(16),
                }}
                placeholder="Es. Heineken"
                placeholderTextColor={colors.text.secondary}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />

              {/* Categoria */}
              <Text style={{ fontSize: scaleFontSize(14), fontWeight: '600', color: colors.text.primary, marginBottom: scaleSpacing(8) }}>
                Categoria *
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: scaleSpacing(16) }}
              >
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.value}
                    style={{
                      paddingHorizontal: scaleSpacing(16),
                      paddingVertical: scaleSpacing(10),
                      borderRadius: 10,
                      backgroundColor: formData.category === cat.value ? colors.amber : colors.background.card,
                      marginRight: scaleSpacing(8),
                    }}
                    onPress={() => setFormData({ ...formData, category: cat.value })}
                  >
                    <Text
                      style={{
                        fontSize: scaleFontSize(14),
                        fontWeight: '600',
                        color: formData.category === cat.value ? '#FFF' : colors.text.primary,
                      }}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Marca */}
              <Text style={{ fontSize: scaleFontSize(14), fontWeight: '600', color: colors.text.primary, marginBottom: scaleSpacing(8) }}>
                Marca
              </Text>
              <TextInput
                style={{
                  backgroundColor: colors.background.card,
                  borderRadius: 10,
                  paddingHorizontal: scaleSpacing(12),
                  height: scaleSpacing(44),
                  fontSize: scaleFontSize(15),
                  color: colors.text.primary,
                  marginBottom: scaleSpacing(16),
                }}
                placeholder="Es. Heineken"
                placeholderTextColor={colors.text.secondary}
                value={formData.brand}
                onChangeText={(text) => setFormData({ ...formData, brand: text })}
              />

              {/* Formato */}
              <Text style={{ fontSize: scaleFontSize(14), fontWeight: '600', color: colors.text.primary, marginBottom: scaleSpacing(8) }}>
                Formato
              </Text>
              <TextInput
                style={{
                  backgroundColor: colors.background.card,
                  borderRadius: 10,
                  paddingHorizontal: scaleSpacing(12),
                  height: scaleSpacing(44),
                  fontSize: scaleFontSize(15),
                  color: colors.text.primary,
                  marginBottom: scaleSpacing(16),
                }}
                placeholder="Es. 33cl, 75cl, 1L"
                placeholderTextColor={colors.text.secondary}
                value={formData.size}
                onChangeText={(text) => setFormData({ ...formData, size: text })}
              />

              {/* Codice a barre */}
              <Text style={{ fontSize: scaleFontSize(14), fontWeight: '600', color: colors.text.primary, marginBottom: scaleSpacing(8) }}>
                Codice a Barre
              </Text>
              <TextInput
                style={{
                  backgroundColor: colors.background.card,
                  borderRadius: 10,
                  paddingHorizontal: scaleSpacing(12),
                  height: scaleSpacing(44),
                  fontSize: scaleFontSize(15),
                  color: colors.text.primary,
                  marginBottom: scaleSpacing(16),
                }}
                placeholder="Es. 8714800001234"
                placeholderTextColor={colors.text.secondary}
                value={formData.barcode}
                onChangeText={(text) => setFormData({ ...formData, barcode: text })}
                keyboardType="numeric"
              />

              {/* Scorta minima */}
              <Text style={{ fontSize: scaleFontSize(14), fontWeight: '600', color: colors.text.primary, marginBottom: scaleSpacing(8) }}>
                Scorta Minima *
              </Text>
              <TextInput
                style={{
                  backgroundColor: colors.background.card,
                  borderRadius: 10,
                  paddingHorizontal: scaleSpacing(12),
                  height: scaleSpacing(44),
                  fontSize: scaleFontSize(15),
                  color: colors.text.primary,
                  marginBottom: scaleSpacing(16),
                }}
                placeholder="10"
                placeholderTextColor={colors.text.secondary}
                value={formData.minStock}
                onChangeText={(text) => setFormData({ ...formData, minStock: text })}
                keyboardType="numeric"
              />

              {/* Descrizione */}
              <Text style={{ fontSize: scaleFontSize(14), fontWeight: '600', color: colors.text.primary, marginBottom: scaleSpacing(8) }}>
                Descrizione
              </Text>
              <TextInput
                style={{
                  backgroundColor: colors.background.card,
                  borderRadius: 10,
                  paddingHorizontal: scaleSpacing(12),
                  paddingVertical: scaleSpacing(12),
                  fontSize: scaleFontSize(15),
                  color: colors.text.primary,
                  marginBottom: scaleSpacing(24),
                  height: scaleSpacing(100),
                  textAlignVertical: 'top',
                }}
                placeholder="Descrizione opzionale..."
                placeholderTextColor={colors.text.secondary}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                multiline
                numberOfLines={4}
              />

              {/* Save Button */}
              <TouchableOpacity
                style={{
                  backgroundColor: colors.amber,
                  borderRadius: 10,
                  paddingVertical: scaleSpacing(14),
                  alignItems: 'center',
                }}
                onPress={handleSaveArticle}
              >
                <Text style={{ fontSize: scaleFontSize(16), fontWeight: 'bold', color: '#FFF' }}>
                  {editingArticle ? 'Aggiorna Articolo' : 'Crea Articolo'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
