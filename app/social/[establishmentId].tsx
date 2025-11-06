import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  TextInput as RNTextInput,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import {
  MessageCircle,
  Star,
  Heart,
  Send,
  Plus,
  Clock,
  MapPin,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { api } from '@/services/api';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import Card from '@/components/Card';
import { FormInput } from '@/components/Form';
import BottomSheet from '@/components/BottomSheet';
import { ModalSuccess, ModalError } from '@/components/ModalKit';
import { Post, Story, Review, ChatMessage, SocialStats, Establishment } from '@/types';

type TabType = 'posts' | 'stories' | 'chat' | 'reviews';

export default function SocialPageScreen() {
  const { establishmentId } = useLocalSearchParams<{ establishmentId: string }>();
  const { user, token } = useAuth();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [stats, setStats] = useState<SocialStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newStoryContent, setNewStoryContent] = useState('');
  const [newMessageContent, setNewMessageContent] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');

  const [successModal, setSuccessModal] = useState({ visible: false, message: '' });
  const [errorModal, setErrorModal] = useState({ visible: false, message: '' });

  const isSocialManager = user?.role === 'SENIOR_MERCHANT' || user?.isSocialManager;
  const canEdit = isSocialManager && user?.establishmentId === establishmentId;

  const loadData = useCallback(async () => {
    if (!token || !establishmentId) return;

    try {
      const [estabList, postsData, storiesData, reviewsData, statsData, chatData] = await Promise.all([
        api.establishments.list(token),
        api.social.setPosts(token, establishmentId),
        api.social.getStories(token, establishmentId),
        api.social.getReviews(token, establishmentId),
        api.social.getStats(token, establishmentId),
        api.social.getChatMessages(token, establishmentId, user?.id),
      ]);

      const estab = estabList.find(e => e.id === establishmentId);
      if (estab) setEstablishment(estab);
      
      setPosts(postsData);
      setStories(storiesData);
      setReviews(reviewsData);
      setStats(statsData);
      setChatMessages(chatData);
    } catch (error) {
      console.error('Failed to load social data:', error);
      setErrorModal({ visible: true, message: t('common.error') });
    }
  }, [token, establishmentId, user, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleCreatePost = async () => {
    if (!token || !user || !newPostContent.trim()) return;

    setLoading(true);
    try {
      await api.social.createPost(token, establishmentId, user.id, newPostContent);
      setSuccessModal({ visible: true, message: t('social.createPost') });
      setNewPostContent('');
      setShowCreateModal(false);
      loadData();
    } catch (error: any) {
      setErrorModal({ visible: true, message: error.message || t('common.error') });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStory = async () => {
    if (!token || !user || !newStoryContent.trim()) return;

    setLoading(true);
    try {
      await api.social.createStory(token, establishmentId, user.id, newStoryContent);
      setSuccessModal({ visible: true, message: t('social.createStory') });
      setNewStoryContent('');
      setShowCreateModal(false);
      loadData();
    } catch (error: any) {
      setErrorModal({ visible: true, message: error.message || t('common.error') });
    } finally {
      setLoading(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!token || !user) return;

    try {
      await api.social.likePost(token, postId, user.id);
      loadData();
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!token || !user || !newMessageContent.trim()) return;

    try {
      await api.social.sendChatMessage(token, establishmentId, user.id, newMessageContent);
      setNewMessageContent('');
      loadData();
    } catch (error: any) {
      setErrorModal({ visible: true, message: error.message || t('common.error') });
    }
  };

  const handleSubmitReview = async () => {
    if (!token || !user || reviewRating === 0) return;

    setLoading(true);
    try {
      await api.social.createReview(
        token,
        establishmentId,
        user.id,
        reviewRating,
        reviewComment
      );
      setSuccessModal({ visible: true, message: t('social.submitReview') });
      setReviewRating(0);
      setReviewComment('');
      setShowReviewModal(false);
      loadData();
    } catch (error: any) {
      setErrorModal({ visible: true, message: error.message || t('common.error') });
    } finally {
      setLoading(false);
    }
  };

  const renderPostItem = ({ item }: { item: Post }) => (
    <Card style={styles.postCard}>
      <View style={styles.postHeader}>
        <Text style={styles.postAuthor}>{t('social.postedBy')} {establishment?.name}</Text>
        <Text style={styles.postDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <Text style={styles.postContent}>{item.content}</Text>
      <View style={styles.postActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleLikePost(item.id)}
        >
          <Heart
            size={20}
            color={item.likes.includes(user?.id || '') ? Colors.error : Colors.text.secondary}
            fill={item.likes.includes(user?.id || '') ? Colors.error : 'none'}
          />
          <Text style={styles.actionText}>
            {t('social.likesCount', { count: item.likes.length })}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <MessageCircle size={20} color={Colors.text.secondary} />
          <Text style={styles.actionText}>
            {t('social.commentsCount', { count: item.commentCount })}
          </Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  const renderStoryItem = ({ item }: { item: Story }) => {
    const hoursLeft = Math.floor(
      (new Date(item.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60)
    );

    return (
      <Card style={styles.storyCard}>
        <View style={styles.storyHeader}>
          <Clock size={16} color={Colors.text.secondary} />
          <Text style={styles.storyExpiry}>
            {t('social.storyExpires', { hours: hoursLeft })}
          </Text>
        </View>
        <Text style={styles.storyContent}>{item.content}</Text>
        <Text style={styles.storyViews}>
          {t('social.viewsCount', { count: item.views.length })}
        </Text>
      </Card>
    );
  };

  const renderReviewItem = ({ item }: { item: Review }) => (
    <Card style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Text style={styles.reviewAuthor}>{item.username}</Text>
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={16}
              color={star <= item.rating ? Colors.yellow : Colors.border}
              fill={star <= item.rating ? Colors.yellow : 'none'}
            />
          ))}
        </View>
      </View>
      <Text style={styles.reviewComment}>{item.comment}</Text>
      <Text style={styles.reviewDate}>
        {new Date(item.createdAt).toLocaleDateString()}
      </Text>
    </Card>
  );

  const renderChatMessage = ({ item }: { item: ChatMessage }) => {
    const isMyMessage = item.senderId === user?.id;

    return (
      <View style={[styles.messageContainer, isMyMessage && styles.myMessageContainer]}>
        <View style={[styles.messageBubble, isMyMessage && styles.myMessageBubble]}>
          <Text style={styles.messageSender}>{item.senderName}</Text>
          <Text style={[styles.messageText, isMyMessage && styles.myMessageText]}>
            {item.content}
          </Text>
          <Text style={[styles.messageTime, isMyMessage && styles.myMessageTime]}>
            {new Date(item.createdAt).toLocaleTimeString()}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: establishment?.name || t('social.socialPage'),
          headerStyle: { backgroundColor: Colors.cream },
        }}
      />
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <MapPin size={20} color={Colors.orange} />
            <View style={styles.headerTextContainer}>
              <Text style={styles.venueName}>{establishment?.name}</Text>
              <Text style={styles.venueAddress}>{establishment?.address}</Text>
            </View>
          </View>
          <View style={styles.statusBadge}>
            <View
              style={[
                styles.statusDot,
                establishment?.isOpen ? styles.statusOpen : styles.statusClosed,
              ]}
            />
            <Text style={styles.statusText}>
              {establishment?.isOpen ? t('social.openNow') : t('social.closedNow')}
            </Text>
          </View>
        </View>

        {stats && (
          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.postsCount}</Text>
              <Text style={styles.statLabel}>{t('social.posts')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.averageRating.toFixed(1)}</Text>
              <Text style={styles.statLabel}>{t('social.averageRating')}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.reviewCount}</Text>
              <Text style={styles.statLabel}>{t('social.reviews')}</Text>
            </View>
          </View>
        )}

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'posts' && styles.tabActive]}
            onPress={() => setActiveTab('posts')}
          >
            <Text style={[styles.tabText, activeTab === 'posts' && styles.tabTextActive]}>
              {t('social.posts')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'stories' && styles.tabActive]}
            onPress={() => setActiveTab('stories')}
          >
            <Text style={[styles.tabText, activeTab === 'stories' && styles.tabTextActive]}>
              {t('social.stories')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'chat' && styles.tabActive]}
            onPress={() => setActiveTab('chat')}
          >
            <Text style={[styles.tabText, activeTab === 'chat' && styles.tabTextActive]}>
              {t('social.chat')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'reviews' && styles.tabActive]}
            onPress={() => setActiveTab('reviews')}
          >
            <Text style={[styles.tabText, activeTab === 'reviews' && styles.tabTextActive]}>
              {t('social.reviews')}
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'posts' && (
          <FlatList
            data={posts}
            renderItem={renderPostItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              <Text style={styles.emptyText}>{t('social.noPosts')}</Text>
            }
          />
        )}

        {activeTab === 'stories' && (
          <FlatList
            data={stories}
            renderItem={renderStoryItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              <Text style={styles.emptyText}>{t('social.noStories')}</Text>
            }
          />
        )}

        {activeTab === 'chat' && (
          <View style={styles.chatContainer}>
            <FlatList
              data={chatMessages}
              renderItem={renderChatMessage}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.chatList}
              ListEmptyComponent={
                <Text style={styles.emptyText}>{t('social.noMessages')}</Text>
              }
            />
            <View style={styles.chatInput}>
              <RNTextInput
                style={styles.chatTextInput}
                placeholder={t('social.writeMessage')}
                value={newMessageContent}
                onChangeText={setNewMessageContent}
                multiline
              />
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSendMessage}
              >
                <Send size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === 'reviews' && (
          <FlatList
            data={reviews}
            renderItem={renderReviewItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              <Text style={styles.emptyText}>{t('social.noPosts')}</Text>
            }
            ListFooterComponent={
              !canEdit ? (
                <Button
                  title={t('social.leaveReview')}
                  onPress={() => setShowReviewModal(true)}
                  style={styles.reviewButton}
                />
              ) : null
            }
          />
        )}

        {canEdit && activeTab !== 'chat' && (
          <TouchableOpacity
            style={styles.fab}
            onPress={() => setShowCreateModal(true)}
          >
            <Plus size={28} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        <BottomSheet
          visible={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title={
            activeTab === 'posts'
              ? t('social.createPost')
              : t('social.createStory')
          }
        >
          <View style={styles.createForm}>
            <FormInput
              label={activeTab === 'posts' ? t('social.createPost') : t('social.createStory')}
              value={activeTab === 'posts' ? newPostContent : newStoryContent}
              onChangeText={activeTab === 'posts' ? setNewPostContent : setNewStoryContent}
              placeholder={
                activeTab === 'posts'
                  ? t('social.writePost')
                  : t('social.writeStory')
              }
              multiline
              numberOfLines={4}
            />
            <Button
              title={t('common.save')}
              onPress={
                activeTab === 'posts' ? handleCreatePost : handleCreateStory
              }
              loading={loading}
            />
          </View>
        </BottomSheet>

        <BottomSheet
          visible={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          title={t('social.leaveReview')}
        >
          <View style={styles.reviewForm}>
            <Text style={styles.reviewFormLabel}>{t('social.yourRating')}</Text>
            <View style={styles.ratingInput}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setReviewRating(star)}
                >
                  <Star
                    size={32}
                    color={star <= reviewRating ? Colors.yellow : Colors.border}
                    fill={star <= reviewRating ? Colors.yellow : 'none'}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <FormInput
              label={t('social.writeReview')}
              value={reviewComment}
              onChangeText={setReviewComment}
              placeholder={t('social.writeReview')}
              multiline
              numberOfLines={4}
            />
            <Button
              title={t('social.submitReview')}
              onPress={handleSubmitReview}
              loading={loading}
              disabled={reviewRating === 0}
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
    backgroundColor: Colors.cream,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  venueName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  venueAddress: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.amber + '40',
    borderRadius: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusOpen: {
    backgroundColor: Colors.success,
  },
  statusClosed: {
    backgroundColor: Colors.error,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.orange,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  tabs: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    backgroundColor: '#FFFFFF',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.cream,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: Colors.orange,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 16,
  },
  postCard: {
    marginBottom: 16,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  postAuthor: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  postDate: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  postContent: {
    fontSize: 16,
    color: Colors.text.primary,
    lineHeight: 24,
    marginBottom: 16,
  },
  postActions: {
    flexDirection: 'row',
    gap: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  storyCard: {
    marginBottom: 12,
  },
  storyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  storyExpiry: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  storyContent: {
    fontSize: 16,
    color: Colors.text.primary,
    lineHeight: 24,
    marginBottom: 8,
  },
  storyViews: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  reviewCard: {
    marginBottom: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewAuthor: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  reviewComment: {
    fontSize: 14,
    color: Colors.text.primary,
    lineHeight: 20,
    marginBottom: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  chatContainer: {
    flex: 1,
  },
  chatList: {
    padding: 16,
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  myMessageBubble: {
    backgroundColor: Colors.orange,
  },
  messageSender: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: Colors.text.primary,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  messageTime: {
    fontSize: 10,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  myMessageTime: {
    color: '#FFFFFF' + 'CC',
  },
  chatInput: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
  },
  chatTextInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.cream,
    fontSize: 14,
    color: Colors.text.primary,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.orange,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.text.secondary,
    fontSize: 14,
    paddingVertical: 40,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.orange,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  createForm: {
    paddingBottom: 20,
  },
  reviewForm: {
    paddingBottom: 20,
  },
  reviewFormLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 12,
  },
  ratingInput: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  reviewButton: {
    marginTop: 16,
  },
});
