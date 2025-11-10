import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput as RNTextInput,
  Alert,
} from 'react-native';
import { Star, Camera, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useLanguage } from '@/contexts/LanguageContext';
import { api } from '@/services/api';
import Colors from '@/constants/colors';
import Card from './Card';
import Button from './Button';
import BottomSheet from './BottomSheet';
import { ModalSuccess, ModalError } from './ModalKit';
import { Review } from '@/types';
import { isImageAppropriate } from '@/utils/moderation';

interface ReviewsManagerProps {
  establishmentId: string;
  token: string;
  userId?: string;
  canAddReview?: boolean;
}

export default function ReviewsManager({
  establishmentId,
  token,
  userId,
  canAddReview = false,
}: ReviewsManagerProps) {
  const { t } = useLanguage();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  
  const [successModal, setSuccessModal] = useState({ visible: false, message: '' });
  const [errorModal, setErrorModal] = useState({ visible: false, message: '' });

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const data = await api.social.getReviews(token, establishmentId);
      setReviews(data);
    } catch (error) {
      console.error('Failed to load reviews:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReviews();
    setRefreshing(false);
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const handlePickImages = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(t('common.error'), t('settings.galleryPermissionRequired'));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 5,
        base64: true,
      });

      if (!result.canceled && result.assets) {
        const newPhotos: string[] = [];
        for (const asset of result.assets) {
          if (asset.base64) {
            const dataUri = `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`;
            const isOk = await isImageAppropriate(dataUri);
            if (!isOk) {
              Alert.alert(t('common.error'), t('social.inappropriateContent'));
              return;
            }
            newPhotos.push(dataUri);
          }
        }
        setPhotos([...photos, ...newPhotos].slice(0, 5));
      }
    } catch (error) {
      console.error('Image picker error:', error);
    }
  };

  const handleSubmitReview = async () => {
    if (!userId) return;
    
    if (rating === 0) {
      Alert.alert(t('common.error'), t('reviews.selectRating'));
      return;
    }

    if (comment.trim().length > 1000) {
      Alert.alert(t('common.error'), t('reviews.commentTooLong'));
      return;
    }

    setLoading(true);
    try {
      await api.social.createReview(
        token,
        establishmentId,
        userId,
        rating,
        comment.trim(),
        photos
      );
      setSuccessModal({ visible: true, message: t('reviews.reviewAdded') });
      setShowAddModal(false);
      setRating(0);
      setComment('');
      setPhotos([]);
      loadReviews();
    } catch (error: any) {
      setErrorModal({ visible: true, message: error.message || t('common.error') });
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (value: number, onPress?: (rating: number) => void, interactive = false) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const filled = i <= (interactive && hoverRating > 0 ? hoverRating : value);
      const halfFilled = !filled && i - 0.5 === value;
      
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => onPress?.(i)}
          onPressIn={() => interactive && setHoverRating(i)}
          onPressOut={() => interactive && setHoverRating(0)}
          disabled={!interactive}
          style={styles.starButton}
        >
          <Star
            size={interactive ? 32 : 16}
            color={Colors.orange}
            fill={filled || halfFilled ? Colors.orange : 'none'}
          />
        </TouchableOpacity>
      );
    }
    return <View style={styles.starsRow}>{stars}</View>;
  };

  const renderReview = ({ item }: { item: Review }) => (
    <Card style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View>
          <Text style={styles.reviewUser}>{item.username}</Text>
          <Text style={styles.reviewDate}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        {renderStars(item.rating)}
      </View>
      
      {item.comment && (
        <Text style={styles.reviewComment}>{item.comment}</Text>
      )}
      
      {item.photos && item.photos.length > 0 && (
        <View style={styles.photosGrid}>
          {item.photos.map((photo, index) => (
            <Image
              key={index}
              source={{ uri: photo }}
              style={styles.reviewPhoto}
            />
          ))}
        </View>
      )}
    </Card>
  );

  return (
    <View style={styles.container}>
      <Card style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryLeft}>
            <Text style={styles.averageRating}>{averageRating.toFixed(1)}</Text>
            {renderStars(Math.round(averageRating * 2) / 2)}
          </View>
          <Text style={styles.reviewCount}>
            {reviews.length} {t('reviews.reviews')}
          </Text>
        </View>
        
        {canAddReview && userId && (
          <Button
            title={t('reviews.addReview')}
            onPress={() => setShowAddModal(true)}
            variant="secondary"
            style={styles.addButton}
          />
        )}
      </Card>

      <FlatList
        data={reviews}
        renderItem={renderReview}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>{t('reviews.noReviews')}</Text>
        }
        refreshing={refreshing}
        onRefresh={onRefresh}
      />

      {/* Add Review Modal */}
      <BottomSheet
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={t('reviews.addReview')}
      >
        <View style={styles.modalContent}>
          <Text style={styles.label}>{t('reviews.rating')}</Text>
          {renderStars(rating, setRating, true)}
          
          <Text style={styles.label}>{t('reviews.comment')}</Text>
          <RNTextInput
            style={styles.commentInput}
            value={comment}
            onChangeText={setComment}
            placeholder={t('reviews.commentPlaceholder')}
            multiline
            maxLength={1000}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>
            {comment.length}/1000 {t('reviews.characters')}
          </Text>
          
          <Text style={styles.label}>{t('reviews.photos')}</Text>
          <TouchableOpacity
            style={styles.photoButton}
            onPress={handlePickImages}
          >
            <Camera size={24} color={Colors.orange} />
            <Text style={styles.photoButtonText}>
              {t('reviews.addPhotos')} ({photos.length}/5)
            </Text>
          </TouchableOpacity>
          
          {photos.length > 0 && (
            <View style={styles.photosPreview}>
              {photos.map((photo, index) => (
                <View key={index} style={styles.photoPreview}>
                  <Image source={{ uri: photo }} style={styles.photoPreviewImage} />
                  <TouchableOpacity
                    style={styles.removePhoto}
                    onPress={() => setPhotos(photos.filter((_, i) => i !== index))}
                  >
                    <X size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
          
          <Button
            title={t('common.save')}
            onPress={handleSubmitReview}
            loading={loading}
            style={styles.submitButton}
          />
        </View>
      </BottomSheet>

      <ModalSuccess
        visible={successModal.visible}
        onClose={() => setSuccessModal({ visible: false, message: '' })}
        title={t('common.success')}
        message={successModal.message}
      />

      <ModalError
        visible={errorModal.visible}
        onClose={() => setErrorModal({ visible: false, message: '' })}
        title={t('common.error')}
        message={errorModal.message}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  summaryCard: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  averageRating: {
    fontSize: 48,
    fontWeight: '800' as const,
    color: Colors.text.primary,
  },
  reviewCount: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  addButton: {
    marginTop: 8,
  },
  listContent: {
    paddingBottom: 20,
  },
  reviewCard: {
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reviewUser: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  reviewDate: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  starButton: {
    padding: 2,
  },
  reviewComment: {
    fontSize: 14,
    color: Colors.text.primary,
    lineHeight: 20,
    marginBottom: 12,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap' as const,
    gap: 8,
  },
  reviewPhoto: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: Colors.cream,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.text.secondary,
    fontSize: 14,
    paddingVertical: 40,
  },
  modalContent: {
    paddingBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 12,
    marginTop: 16,
  },
  commentInput: {
    minHeight: 120,
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.cream,
    fontSize: 14,
    color: Colors.text.primary,
    textAlignVertical: 'top' as const,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  charCount: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'right',
    marginTop: 4,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.orange,
    borderStyle: 'dashed' as const,
  },
  photoButtonText: {
    fontSize: 14,
    color: Colors.orange,
    fontWeight: '600' as const,
  },
  photosPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap' as const,
    gap: 8,
    marginTop: 12,
  },
  photoPreview: {
    position: 'relative',
  },
  photoPreviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: Colors.cream,
  },
  removePhoto: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    marginTop: 24,
  },
});
