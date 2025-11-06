import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  TextInput as RNTextInput,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  MessageCircle,
  Star,
  Heart,
  Send,
  Plus,
  Clock,
  MapPin,
  Settings,
  ArrowRight,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { api } from '@/services/api';
import Colors from '@/constants/colors';
import { moderateContent, isImageAppropriate } from '@/utils/moderation';
import Button from '@/components/Button';
import Card from '@/components/Card';
import { FormInput } from '@/components/Form';
import BottomSheet from '@/components/BottomSheet';
import { ModalSuccess, ModalError } from '@/components/ModalKit';
import { Post, Story, Review, ChatMessage, SocialStats, Establishment, User, WeeklySchedule, DaySchedule } from '@/types';

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
  const [createType, setCreateType] = useState<null | 'post' | 'story'>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newStoryContent, setNewStoryContent] = useState('');
  const [postImages, setPostImages] = useState<string[]>([]);
  const [postVideo, setPostVideo] = useState<string | null>(null);
  const [storyVideo, setStoryVideo] = useState<string | null>(null);
  const [postStep, setPostStep] = useState<0 | 1>(0);
  const [newMessageContent, setNewMessageContent] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewPhotos, setReviewPhotos] = useState<string[]>([]);

  const [commentsVisible, setCommentsVisible] = useState(false);
  const [commentsTarget, setCommentsTarget] = useState<{ type: 'post' | 'story'; id: string } | null>(null);
  const [comments, setComments] = useState<import('@/types').Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  const [successModal, setSuccessModal] = useState({ visible: false, message: '' });
  const [errorModal, setErrorModal] = useState({ visible: false, message: '' });

  const [editVisible, setEditVisible] = useState(false);
  const [scheduleVisible, setScheduleVisible] = useState(false);
  const [managersVisible, setManagersVisible] = useState(false);
  const [isOpenOverride, setIsOpenOverride] = useState<boolean | null>(null);
  const [team, setTeam] = useState<User[]>([]);
  const [selectedManagerIds, setSelectedManagerIds] = useState<string[]>([]);

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

      if (user?.role === 'SENIOR_MERCHANT' && establishmentId) {
        const teamMembers = await api.establishments.getTeam(token, establishmentId);
        setTeam(teamMembers);
        setSelectedManagerIds(teamMembers.filter(u => u.isSocialManager).map(u => u.id));
      }
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
    if (!token || !user) return;
    if (!newPostContent.trim() && postImages.length === 0 && !postVideo) return;

    const { isClean, filteredText } = moderateContent(newPostContent);
    if (!isClean) {
      setErrorModal({ visible: true, message: t('social.inappropriateContent') });
      return;
    }

    // basic image moderation placeholder
    for (const uri of postImages) {
      const ok = await isImageAppropriate(uri);
      if (!ok) {
        setErrorModal({ visible: true, message: t('social.inappropriateContent') });
        return;
      }
    }

    // enforce media constraints: up to 10 photos or a single video up to 2 min (cannot measure length here)

    setLoading(true);
    try {
      await api.social.createPost(token, establishmentId, user.id, filteredText, postImages, postVideo ?? null, undefined);
      setSuccessModal({ visible: true, message: t('social.createPost') });
      setNewPostContent('');
      setPostImages([]);
      setPostVideo(null);
      setShowCreateModal(false);
      setCreateType(null);
      setPostStep(0);
      loadData();
    } catch (error: any) {
      setErrorModal({ visible: true, message: error.message || t('common.error') });
    } finally {
      setLoading(false);
    }
  };

  const openComments = async (target: { type: 'post' | 'story'; id: string }) => {
    if (!token) return;
    try {
      const list = await api.social.getComments(token, target.type === 'post' ? target.id : undefined, target.type === 'story' ? target.id : undefined);
      setComments(list);
      setCommentsTarget(target);
      setCommentsVisible(true);
    } catch (e) {
      console.log('Failed to load comments', e);
    }
  };

  const submitComment = async () => {
    if (!token || !user || !commentsTarget || !newComment.trim()) return;
    try {
      const created = await api.social.createComment(
        token,
        user.id,
        newComment,
        commentsTarget.type === 'post' ? commentsTarget.id : undefined,
        commentsTarget.type === 'story' ? commentsTarget.id : undefined
      );
      setComments(prev => [...prev, created]);
      setNewComment('');
      loadData();
    } catch (e) {
      setErrorModal({ visible: true, message: t('common.error') });
    }
  };

  const handleCreateStory = async () => {
    if (!token || !user) return;
    if (!newStoryContent.trim() && !storyVideo) return;

    const { isClean, filteredText } = moderateContent(newStoryContent);
    if (!isClean) {
      setErrorModal({ visible: true, message: t('social.inappropriateContent') });
      return;
    }

    setLoading(true);
    try {
      await api.social.createStory(token, establishmentId, user.id, filteredText, undefined, storyVideo ?? null, undefined);
      setSuccessModal({ visible: true, message: t('social.createStory') });
      setNewStoryContent('');
      setStoryVideo(null);
      setShowCreateModal(false);
      setCreateType(null);
      setPostStep(0);
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
        reviewComment,
        reviewPhotos
      );
      setSuccessModal({ visible: true, message: t('social.submitReview') });
      setReviewRating(0);
      setReviewComment('');
      setShowReviewModal(false);
      setReviewPhotos([]);
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
        <TouchableOpacity style={styles.actionButton} onPress={() => openComments({ type: 'post', id: item.id })}>
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
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.storyViews}>
            {t('social.viewsCount', { count: item.views.length })}
          </Text>
          <TouchableOpacity style={[styles.actionButton, { paddingVertical: 4 }]} onPress={() => openComments({ type: 'story', id: item.id })}>
            <MessageCircle size={16} color={Colors.text.secondary} />
            <Text style={styles.actionText}>{t('social.comments')}</Text>
          </TouchableOpacity>
        </View>
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

  const headerRight = useMemo(() => (
    canEdit ? (
      <TouchableOpacity onPress={() => setEditVisible(true)} style={{ paddingRight: 12 }} testID="open-edit-menu">
        <Settings size={22} color={Colors.orange} />
      </TouchableOpacity>
    ) : null
  ), [canEdit]);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: establishment?.name || t('social.socialPage'),
          headerStyle: { backgroundColor: Colors.cream },
          headerRight: () => headerRight,
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

        {establishment && canEdit && establishment.isOpen === false && (
          <Card style={{ margin: 16, backgroundColor: Colors.amber + '30' }}>
            <Text style={{ color: Colors.text.primary }}>{t('social.scheduleAlert')}</Text>
          </Card>
        )}

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
          <View style={{ flex: 1 }}>
            {canEdit && (
              <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
                <Button title={t('social.addStory')} onPress={() => { setShowCreateModal(true); setCreateType('story'); }} />
              </View>
            )}
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
          </View>
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

        {canEdit && activeTab === 'posts' && (
          <TouchableOpacity
            style={styles.fab}
            onPress={() => { setShowCreateModal(true); setCreateType('post'); setPostStep(0); }}
          >
            <Plus size={28} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        <BottomSheet
          visible={showCreateModal}
          onClose={() => { setShowCreateModal(false); setCreateType(null); }}
          title={createType === 'post' ? t('social.createPost') : t('social.createStory')}
        >
          {createType === 'post' ? (
            <View style={styles.createForm}>
              {postStep === 0 ? (
                <View style={{ gap: 12 }}>
                  <Button title={t('social.selectMedia')}
                    onPress={async () => {
                      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.All, allowsMultipleSelection: true, quality: 0.8, selectionLimit: 10 });
                      if (!res.canceled && res.assets) {
                        if (res.assets.length > 10) {
                          setPostImages([]);
                          setPostVideo(null);
                          Alert.alert(t('common.error'), t('social.tooManyMedia'));
                          setErrorModal({ visible: true, message: t('social.tooManyMedia') });
                          return;
                        }
                        const videos = res.assets.filter(a => (a.type || '').includes('video'));
                        if (videos.length > 0) {
                          setPostImages([]);
                          setPostVideo(videos[0].uri);
                        } else {
                          const uris = res.assets.map(a => a.uri);
                          setPostVideo(null);
                          setPostImages(uris.slice(0, 10));
                        }
                      }
                    }}
                  />
                  {(postImages.length > 0 || postVideo) && (
                    <View style={styles.previewGrid}>
                      {postVideo ? (
                        <View style={styles.videoPreview}>
                          <Text style={styles.videoBadge}>VIDEO</Text>
                          <Text style={styles.videoHint}>{t('social.videoLimitPost')}</Text>
                        </View>
                      ) : (
                        <View style={styles.previewRow}>
                          {postImages.map((uri) => (
                            <Image key={uri} source={{ uri }} style={styles.previewImage} />
                          ))}
                        </View>
                      )}
                    </View>
                  )}
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                    <TouchableOpacity
                      accessibilityLabel="next"
                      testID="post-next"
                      onPress={() => setPostStep(1)}
                      disabled={postImages.length === 0 && !postVideo}
                      style={[styles.arrowButton, (postImages.length === 0 && !postVideo) && styles.arrowButtonDisabled]}
                    >
                      <ArrowRight size={22} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={{ gap: 12 }}>
                  <FormInput
                    label={t('social.description')}
                    value={newPostContent}
                    onChangeText={setNewPostContent}
                    placeholder={t('social.writePost')}
                    multiline
                    numberOfLines={4}
                  />
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Button title={t('common.back')} variant="outline" onPress={() => setPostStep(0)} />
                    <Button title={t('common.save')} onPress={handleCreatePost} loading={loading} />
                  </View>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.createForm}>
              <FormInput
                label={t('social.description')}
                value={newStoryContent}
                onChangeText={setNewStoryContent}
                placeholder={t('social.writeStory')}
                multiline
                numberOfLines={3}
              />
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                <Button title={t('social.recordVideo')} onPress={async () => {
                  const res = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Videos, videoMaxDuration: 6, quality: 0.8 });
                  if (!res.canceled && res.assets && res.assets[0]) {
                    setStoryVideo(res.assets[0].uri);
                  }
                }} />
                <Button title={t('social.addVideo')} variant="secondary" onPress={async () => {
                  const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Videos, allowsMultipleSelection: false, quality: 0.8 });
                  if (!res.canceled && res.assets && res.assets[0]) {
                    setStoryVideo(res.assets[0].uri);
                  }
                }} />
              </View>
              <Button title={t('common.save')} onPress={handleCreateStory} loading={loading} disabled={!storyVideo} />
            </View>
          )}
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
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              <Button title={t('social.addPhotos')} variant="secondary" onPress={async () => {
                const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsMultipleSelection: true, quality: 0.8, selectionLimit: 6 - reviewPhotos.length });
                if (!res.canceled) {
                  const uris = res.assets?.map(a => a.uri) ?? [];
                  setReviewPhotos(prev => [...prev, ...uris].slice(0, 6));
                }
              }} />
              {reviewPhotos.length > 0 && (
                <Text style={{ color: Colors.text.secondary, alignSelf: 'center' }}>{reviewPhotos.length}/6</Text>
              )}
            </View>
            <Button
              title={t('social.submitReview')}
              onPress={handleSubmitReview}
              loading={loading}
              disabled={reviewRating === 0}
            />
          </View>
        </BottomSheet>

        <BottomSheet
          visible={editVisible}
          onClose={() => setEditVisible(false)}
          title={t('social.manageContent')}
        >
          <View style={{ gap: 16 }}>
            <Card>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.cardTitle}>{establishment?.isOpen ? t('social.setClosed') : t('social.setOpen')}</Text>
                <Button
                  title={establishment?.isOpen ? t('social.setClosed') : t('social.setOpen')}
                  onPress={async () => {
                    if (!token || !establishmentId) return;
                    const next = !establishment?.isOpen;
                    setIsOpenOverride(next);
                    try {
                      await api.schedule.setOpenStatus(token, establishmentId, next);
                      await loadData();
                    } catch (e) {
                      setErrorModal({ visible: true, message: t('common.error') });
                    }
                  }}
                />
              </View>
            </Card>

            <Button title={t('social.manageSchedule')} onPress={() => setScheduleVisible(true)} variant="secondary" />

            {user?.role === 'SENIOR_MERCHANT' && (
              <Button title={t('social.socialManagers')} onPress={() => setManagersVisible(true)} variant="outline" />
            )}
          </View>
        </BottomSheet>

        <BottomSheet
          visible={scheduleVisible}
          onClose={() => setScheduleVisible(false)}
          title={t('social.manageSchedule')}
        >
          <ScheduleManager establishmentId={establishmentId} onDone={() => { setScheduleVisible(false); loadData(); }} />
        </BottomSheet>

        <BottomSheet
          visible={managersVisible}
          onClose={() => setManagersVisible(false)}
          title={t('social.socialManagers')}
        >
          <View style={{ gap: 12 }}>
            {team.map(member => (
              <View key={member.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: Colors.text.primary }}>{member.username}</Text>
                <TouchableOpacity
                  onPress={async () => {
                    if (!token || !establishmentId) return;
                    const next = !selectedManagerIds.includes(member.id);
                    try {
                      await api.social.setSocialManager(token, establishmentId, member.id, next);
                      const updated = next
                        ? [...selectedManagerIds, member.id]
                        : selectedManagerIds.filter(id => id !== member.id);
                      setSelectedManagerIds(updated);
                    } catch (e) {
                      setErrorModal({ visible: true, message: t('common.error') });
                    }
                  }}
                  style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: selectedManagerIds.includes(member.id) ? Colors.orange : '#FFFFFF', borderWidth: 1, borderColor: Colors.border }}
                >
                  <Text style={{ color: selectedManagerIds.includes(member.id) ? '#FFFFFF' : Colors.text.primary }}>
                    {selectedManagerIds.includes(member.id) ? t('social.removeSocialManager') : t('social.addSocialManager')}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
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

        <BottomSheet
          visible={commentsVisible}
          onClose={() => { setCommentsVisible(false); setCommentsTarget(null); setComments([]); setNewComment(''); }}
          title={t('social.comments')}
        >
          <View style={{ maxHeight: 400 }}>
            <FlatList
              data={comments}
              keyExtractor={(c) => c.id}
              contentContainerStyle={{ paddingBottom: 12 }}
              renderItem={({ item }) => (
                <View style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border }}>
                  <Text style={{ fontWeight: '600', color: Colors.text.primary }}>{item.authorName}</Text>
                  <Text style={{ color: Colors.text.primary, marginTop: 4 }}>{item.content}</Text>
                  <Text style={{ color: Colors.text.secondary, fontSize: 12, marginTop: 4 }}>{new Date(item.createdAt).toLocaleString()}</Text>
                </View>
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>{t('social.noComments')}</Text>}
            />
            {user && (
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
                <RNTextInput
                  style={[styles.chatTextInput, { minHeight: 44 }]}
                  placeholder={t('social.writeComment')}
                  value={newComment}
                  onChangeText={setNewComment}
                  multiline
                />
                <TouchableOpacity style={styles.sendButton} onPress={submitComment}>
                  <Send size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </BottomSheet>
    </View>
  );
}

function ScheduleManager({ establishmentId, onDone }: { establishmentId: string; onDone: () => void }) {
  const { token } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState<boolean>(false);
  const [weekly, setWeekly] = useState<WeeklySchedule | null>(null);
  const [isRecurring, setIsRecurring] = useState<boolean>(true);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [reason, setReason] = useState<string>('');

  const defaultDay = (): DaySchedule => ({ isOpen: true, slots: [{ from: '09:00', to: '18:00' }] });

  useEffect(() => {
    const init = async () => {
      if (!token || !establishmentId) return;
      try {
        const existing = await api.schedule.get(token, establishmentId);
        if (existing) {
          setWeekly(existing);
        } else {
          setWeekly({
            monday: defaultDay(),
            tuesday: defaultDay(),
            wednesday: defaultDay(),
            thursday: defaultDay(),
            friday: defaultDay(),
            saturday: { isOpen: false, slots: [] },
            sunday: { isOpen: false, slots: [] },
          });
        }
      } catch (e) {
        console.log('Failed to load schedule', e);
      }
    };
    init();
  }, [token, establishmentId]);

  const save = async () => {
    if (!token || !weekly) return;
    setLoading(true);
    try {
      await api.schedule.update(token, establishmentId, weekly, isRecurring);
      onDone();
    } catch (e) {
      console.log('Failed to save schedule', e);
    } finally {
      setLoading(false);
    }
  };

  const addClosure = async () => {
    if (!token || !startDate || !endDate) return;
    setLoading(true);
    try {
      await api.schedule.addClosurePeriod(token, establishmentId, startDate, endDate, reason);
      onDone();
    } catch (e) {
      console.log('Failed to add closure', e);
    } finally {
      setLoading(false);
    }
  };

  const DayRow = ({ name, day }: { name: keyof WeeklySchedule; day: DaySchedule }) => (
    <Card style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Text style={{ fontWeight: '700', color: Colors.text.primary }}>
          {t(`social.${String(name)}`)}
        </Text>
        <TouchableOpacity
          onPress={() => setWeekly(prev => prev ? ({ ...prev, [name]: { ...prev[name], isOpen: !prev[name].isOpen } }) : prev)}
          style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, backgroundColor: day.isOpen ? Colors.amber : '#FFFFFF' }}
        >
          <Text style={{ color: Colors.text.primary }}>{day.isOpen ? t('social.openNow') : t('social.closed')}</Text>
        </TouchableOpacity>
      </View>
      {day.isOpen && (
        <View style={{ gap: 8 }}>
          {day.slots.map((slot, idx) => (
            <View key={idx} style={{ flexDirection: 'row', gap: 8 }}>
              <RNTextInput
                style={styles.slotInput}
                value={slot.from}
                onChangeText={(v) => setWeekly(prev => {
                  if (!prev) return prev;
                  const copy = { ...prev } as WeeklySchedule;
                  const slots = [...copy[name].slots];
                  slots[idx] = { ...slots[idx], from: v };
                  copy[name] = { ...copy[name], slots };
                  return copy;
                })}
                placeholder={t('social.from')}
              />
              <RNTextInput
                style={styles.slotInput}
                value={slot.to}
                onChangeText={(v) => setWeekly(prev => {
                  if (!prev) return prev;
                  const copy = { ...prev } as WeeklySchedule;
                  const slots = [...copy[name].slots];
                  slots[idx] = { ...slots[idx], to: v };
                  copy[name] = { ...copy[name], slots };
                  return copy;
                })}
                placeholder={t('social.to')}
              />
            </View>
          ))}
          <Button
            title={t('social.addTimeSlot')}
            variant="secondary"
            onPress={() => setWeekly(prev => prev ? ({ ...prev, [name]: { ...prev[name], slots: [...prev[name].slots, { from: '09:00', to: '12:00' }] } }) : prev)}
          />
        </View>
      )}
    </Card>
  );

  if (!weekly) return <Text>{t('common.loading')}</Text>;

  return (
    <ScrollView>
      {(['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] as (keyof WeeklySchedule)[]).map(k => (
        <DayRow key={String(k)} name={k} day={weekly[k]} />
      ))}

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
        <TouchableOpacity onPress={() => setIsRecurring(true)} style={[styles.toggle, isRecurring && styles.toggleActive]}>
          <Text style={[styles.toggleText, isRecurring && styles.toggleTextActive]}>{t('social.recurringSchedule')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsRecurring(false)} style={[styles.toggle, !isRecurring && styles.toggleActive]}>
          <Text style={[styles.toggleText, !isRecurring && styles.toggleTextActive]}>{t('social.manualSchedule')}</Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginTop: 16 }}>
        <Text style={styles.cardTitle}>{t('social.addClosurePeriod')}</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <RNTextInput style={styles.slotInput} placeholder={t('social.startDate')} value={startDate} onChangeText={setStartDate} />
          <RNTextInput style={styles.slotInput} placeholder={t('social.endDate')} value={endDate} onChangeText={setEndDate} />
        </View>
        <RNTextInput style={[styles.slotInput, { marginTop: 8 }]} placeholder={t('social.reason')} value={reason} onChangeText={setReason} />
        <Button title={t('common.save')} onPress={addClosure} variant="outline" style={{ marginTop: 8 }} />
      </View>

      <Button title={t('common.save')} onPress={save} loading={loading} style={{ marginTop: 16 }} />
    </ScrollView>
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
  previewGrid: {
    marginTop: 8,
    marginBottom: 8,
  },
  previewRow: {
    flexDirection: 'row',
    flexWrap: 'wrap' as const,
    gap: 8,
  },
  previewImage: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: Colors.cream,
  },
  videoPreview: {
    height: 120,
    borderRadius: 12,
    backgroundColor: '#00000020',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoBadge: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.orange,
    marginBottom: 6,
  },
  videoHint: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  arrowButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowButtonDisabled: {
    backgroundColor: Colors.text.light,
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  slotInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    color: Colors.text.primary,
  },
  toggle: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 10,
  },
  toggleActive: {
    backgroundColor: Colors.amber,
    borderColor: Colors.orange,
  },
  toggleText: {
    textAlign: 'center',
    color: Colors.text.primary,
    fontSize: 12,
  },
  toggleTextActive: {
    color: Colors.orange,
    fontWeight: '700' as const,
  },
});
