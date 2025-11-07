import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  TextInput as RNTextInput,
  Image,
  Alert,
  Modal as RNModal,
  Pressable,
  Platform,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import {
  MessageCircle,
  Heart,
  Send,
  Plus,
  Clock,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
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
import { CameraView } from 'expo-camera';
import { Post, Story, ChatMessage, Establishment } from '@/types';

export default function SocialPageScreen() {
  const { establishmentId } = useLocalSearchParams<{ establishmentId: string }>();
  const { user, token } = useAuth();
  const { t } = useLanguage();

  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState<null | 'post' | 'story'>(null);
  const [postFullscreen, setPostFullscreen] = useState(false);
  const [storyCaptureVisible, setStoryCaptureVisible] = useState(false);

  const [newPostContent, setNewPostContent] = useState('');
  const [newStoryContent, setNewStoryContent] = useState('');
  const [postImages, setPostImages] = useState<string[]>([]);
  const [postVideo, setPostVideo] = useState<string | null>(null);
  const [storyVideo, setStoryVideo] = useState<string | null>(null);
  const [postStep, setPostStep] = useState<0 | 1>(0);

  const [successModal, setSuccessModal] = useState({ visible: false, message: '' });
  const [errorModal, setErrorModal] = useState({ visible: false, message: '' });

  const [commentsVisible, setCommentsVisible] = useState(false);
  const [commentsTarget, setCommentsTarget] = useState<{ type: 'post' | 'story'; id: string } | null>(null);
  const [comments, setComments] = useState<import('@/types').Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  const [chatsVisible, setChatsVisible] = useState(false);
  const [threadVisible, setThreadVisible] = useState(false);
  const [activeThreadUserId, setActiveThreadUserId] = useState<string | null>(null);
  const [emojiVisible, setEmojiVisible] = useState(false);
  const [storyViewerVisible, setStoryViewerVisible] = useState(false);
  const [newMessageContent, setNewMessageContent] = useState('');

  const isSocialManager = user?.role === 'SENIOR_MERCHANT' || user?.isSocialManager;
  const canEdit = isSocialManager && user?.establishmentId === establishmentId;

  const loadData = useCallback(async () => {
    if (!token || !establishmentId) return;

    try {
      const [estabList, postsData, storiesData, chatData] = await Promise.all([
        api.establishments.list(token),
        api.social.setPosts(token, establishmentId),
        api.social.getStories(token, establishmentId),
        api.social.getChatMessages(token, establishmentId, user?.id),
      ]);

      const estab = estabList.find(e => e.id === establishmentId);
      if (estab) setEstablishment(estab);

      setPosts(postsData);
      setStories(storiesData);
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
    if (!token || !user) return;
    if (!newPostContent.trim() && postImages.length === 0 && !postVideo) return;

    const { isClean, filteredText } = moderateContent(newPostContent);
    if (!isClean) {
      setErrorModal({ visible: true, message: t('social.inappropriateContent') });
      return;
    }

    for (const uri of postImages) {
      const ok = await isImageAppropriate(uri);
      if (!ok) {
        setErrorModal({ visible: true, message: t('social.inappropriateContent') });
        return;
      }
    }

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

  const headerRight = useMemo(() => null, []);

  const timeAgo = (iso: string) => {
    const diff = Math.max(0, Date.now() - new Date(iso).getTime());
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    return `${h}h`;
  };

  const renderPostItem = ({ item }: { item: Post }) => (
    <Card style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Image source={{ uri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=64&auto=format&fit=crop&q=60' }} style={{ width: 28, height: 28, borderRadius: 14 }} />
          <Text style={styles.postAuthor}>{timeAgo(item.createdAt)}</Text>
        </View>
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

  const conversationSummaries = useMemo(() => {
    const map = new Map<string, { userId: string; username: string; lastMessage: string; lastAt: number }>();
    chatMessages.forEach((m) => {
      const otherUserId = m.senderRole === 'USER' ? m.senderId : 'venue';
      if (otherUserId === 'venue') return;
      const userObj = { userId: otherUserId, username: m.senderName };
      const existing = map.get(otherUserId);
      const lastAt = new Date(m.createdAt).getTime();
      if (!existing || lastAt > existing.lastAt) {
        map.set(otherUserId, { ...userObj, lastMessage: m.content, lastAt });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.lastAt - a.lastAt);
  }, [chatMessages]);

  const threadMessages = useMemo(() => {
    if (!activeThreadUserId) return [] as ChatMessage[];
    return chatMessages.filter((m) => m.senderId === activeThreadUserId || m.senderId === user?.id);
  }, [chatMessages, activeThreadUserId, user?.id]);

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
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: '',
          headerStyle: { backgroundColor: '#FFFFFF' },
        }}
      />

      {/* Stories avatar row */}
      <View style={styles.storyStrip}>
        <TouchableOpacity
          style={[styles.storyAvatarWrap, { borderWidth: stories.length > 0 ? 2 : 0 }]}
          onPress={() => {
            if (canEdit) {
              setStoryCaptureVisible(true);
            } else {
              setStoryViewerVisible(true);
            }
          }}
        >
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&auto=format&fit=crop&q=60' }}
            style={styles.storyAvatar}
          />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={() => setChatsVisible(true)} accessibilityLabel="open-chat" testID="open-chats">
          <Send size={22} color={Colors.orange} />
        </TouchableOpacity>
      </View>

      {/* Feed */}
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

      {/* FAB for creating posts */}
      {canEdit && (
        <TouchableOpacity
          style={styles.fab}
          onPress={async () => {
            setCreateType('post');
            setShowCreateModal(true);
            setPostFullscreen(true);
            try {
              const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (!perm.granted) {
                Alert.alert(t('common.error'), t('settings.galleryPermissionRequired'));
                return;
              }
              const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.All, allowsMultipleSelection: true, quality: 0.8, selectionLimit: 10 });
              if (!res.canceled && res.assets) {
                if (res.assets.length > 10) {
                  setPostImages([]);
                  setPostVideo(null);
                  Alert.alert(t('common.error'), t('social.tooManyMedia'));
                  return;
                }
                const videos = res.assets.filter(a => (a.type || '').includes('video'));
                if (videos.length > 0) {
                  setPostImages([]);
                  setPostVideo(videos[0].uri);
                } else {
                  setPostVideo(null);
                  setPostImages(res.assets.map(a => a.uri));
                }
                setPostStep(1);
              }
            } catch (e) {
              console.log('picker error', e);
            }
          }}
        >
          <Plus size={28} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {/* Post creation full-screen (no bottom slide) */}
      <RNModal visible={showCreateModal && postFullscreen && createType==='post'} transparent animationType="fade" onRequestClose={() => { setShowCreateModal(false); setCreateType(null); }}>
        <View style={styles.fullOverlay}>
          <View style={styles.fullHeader}>
            <TouchableOpacity onPress={() => { if (postStep===1){ setPostStep(0);} else { setShowCreateModal(false); setCreateType(null);} }}>
              {postStep === 1 ? <ArrowLeft size={24} color={Colors.text.primary} /> : <X size={24} color={Colors.text.primary} />}
            </TouchableOpacity>
            <Text style={styles.fullTitle}>{t('social.createPost')}</Text>
            {postStep === 1 ? (
              <TouchableOpacity onPress={handleCreatePost} disabled={loading}>
                <Check size={24} color={Colors.orange} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity disabled={(postImages.length===0 && !postVideo)} onPress={() => setPostStep(1)}>
                <ArrowRight size={24} color={(postImages.length===0 && !postVideo) ? Colors.text.light : Colors.orange} />
              </TouchableOpacity>
            )}
          </View>
          <View style={{ flex: 1, padding: 16 }}>
            {postStep === 0 ? (
              <View style={{ flex: 1 }}>
                {(postImages.length > 0 || postVideo) ? (
                  postVideo ? (
                    <View style={[styles.videoPreview, { flex: 1 }]}>
                      <Text style={styles.videoBadge}>VIDEO</Text>
                      <Text style={styles.videoHint}>{t('social.videoLimitPost')}</Text>
                    </View>
                  ) : (
                    <FlatList data={postImages} numColumns={3} keyExtractor={(u)=>u} renderItem={({item})=> (
                      <Image source={{ uri: item }} style={[styles.previewImage, { width: '31%', aspectRatio: 1 }]} />
                    )} columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 10 }} />
                  )
                ) : (
                  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={styles.emptyText}>{t('social.addMedia')}</Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={{ flex: 1 }}>
                <FormInput
                  label={t('social.description')}
                  value={newPostContent}
                  onChangeText={setNewPostContent}
                  placeholder={t('social.writePost')}
                  multiline
                  numberOfLines={8}
                />
              </View>
            )}
          </View>
        </View>
      </RNModal>

      {/* Stories list viewer (read-only) */}
      <RNModal visible={storyViewerVisible} transparent animationType="fade" onRequestClose={() => setStoryViewerVisible(false)}>
        <View style={styles.fullOverlay}>
          <View style={styles.fullHeader}>
            <TouchableOpacity onPress={() => setStoryViewerVisible(false)}>
              <ArrowLeft size={24} color={Colors.text.primary} />
            </TouchableOpacity>
            <View style={{ flex: 1 }} />
            <View style={{ width: 24 }} />
          </View>
          <FlatList data={stories} keyExtractor={(s)=>s.id} renderItem={renderStoryItem} contentContainerStyle={[styles.listContainer, { paddingBottom: 40 }]} />
        </View>
      </RNModal>

      {/* Stories capture full-screen */}
      <RNModal visible={storyCaptureVisible} transparent animationType="fade" onRequestClose={() => setStoryCaptureVisible(false)}>
        <View style={styles.cameraOverlay}>
          <View style={styles.cameraHeader}>
            <TouchableOpacity onPress={() => setStoryCaptureVisible(false)}>
              <ArrowLeft size={24} color="#fff" />
            </TouchableOpacity>
            <View style={{ flex: 1 }} />
            <TouchableOpacity onPress={async () => {
              const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (!perm.granted) { Alert.alert(t('common.error'), t('settings.galleryPermissionRequired')); return; }
              const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Videos, allowsMultipleSelection: false, quality: 0.8 });
              if (!res.canceled && res.assets && res.assets[0]) { setStoryVideo(res.assets[0].uri); setCreateType('story'); setShowCreateModal(true); }
            }}>
              <Plus size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1 }}>
            {Platform.OS !== 'web' ? (
              <CameraView style={{ flex: 1 }} facing={'back'} />
            ) : (
              <View style={{ flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#fff' }}>{t('social.recordVideo')}</Text>
              </View>
            )}
          </View>
          <View style={styles.cameraFooter}>
            <TouchableOpacity style={styles.recordButton} onPress={async () => {
              const res = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Videos, videoMaxDuration: 6, quality: 0.8 });
              if (!res.canceled && res.assets && res.assets[0]) { setStoryVideo(res.assets[0].uri); setCreateType('story'); setShowCreateModal(true);}            }} />
          </View>
        </View>
      </RNModal>

      {/* Chats list */}
      <BottomSheet
        visible={chatsVisible}
        onClose={() => setChatsVisible(false)}
        title={t('social.chat')}
      >
        <View style={{ gap: 12 }}>
          {conversationSummaries.length === 0 ? (
            <Text style={styles.emptyText}>{t('social.noConversations') || t('social.noMessages')}</Text>
          ) : (
            conversationSummaries.map((c) => (
              <TouchableOpacity key={c.userId} style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border }} onPress={() => { setActiveThreadUserId(c.userId); setThreadVisible(true); }}>
                <Text style={{ color: Colors.text.primary, fontWeight: '600' }}>{c.username}</Text>
                <Text style={{ color: Colors.text.secondary, marginTop: 2 }} numberOfLines={1}>{c.lastMessage}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </BottomSheet>

      {/* Thread view */}
      <BottomSheet
        visible={threadVisible}
        onClose={() => setThreadVisible(false)}
        title={t('social.chat')}
      >
        <View style={styles.chatContainer}>
          <FlatList
            data={threadMessages}
            renderItem={renderChatMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.chatList}
            ListEmptyComponent={
              <Text style={styles.emptyText}>{t('social.noMessages')}</Text>
            }
          />
          <View style={styles.chatInput}>
            <TouchableOpacity style={[styles.sendButton, { backgroundColor: Colors.yellow }]} onPress={() => setEmojiVisible((v) => !v)}>
              <Text>😊</Text>
            </TouchableOpacity>
            <RNTextInput
              style={styles.chatTextInput}
              placeholder={t('social.writeMessage')}
              value={newMessageContent}
              onChangeText={setNewMessageContent}
              multiline
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={async () => {
                if (!token || !user || !newMessageContent.trim()) return;
                await api.social.sendChatMessage(token, establishmentId, user.id, newMessageContent);
                setNewMessageContent('');
                await loadData();
              }}
            >
              <Send size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          {emojiVisible && (
            <View style={{ padding: 8, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: Colors.border, flexDirection: 'row', gap: 8 }}>
              {['😀','😍','👍','🎉','🔥','🙏','😎','💡'].map((e) => (
                <Text key={e} onPress={() => setNewMessageContent((s) => s + e)} style={{ fontSize: 24 }}>{e}</Text>
              ))}
            </View>
          )}
        </View>
      </BottomSheet>

      {/* Comments */}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  storyStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  storyAvatarWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderColor: Colors.orange,
    overflow: 'hidden',
  },
  storyAvatar: {
    width: '100%',
    height: '100%',
  },
  storyHint: {
    fontSize: 14,
    color: Colors.text.secondary,
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
  fullOverlay: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  fullHeader: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: '#FFF',
  },
  fullTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraHeader: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cameraFooter: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
    zIndex: 2,
  },
  recordButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.orange,
  },
});
