/**
 * HTTP API Client
 * 
 * Implementazione delle chiamate HTTP reali al backend
 * Usato quando USE_MOCK_API = false
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  API_BASE_URL, 
  API_TIMEOUT, 
  DEFAULT_HEADERS, 
  ENDPOINTS,
  buildUrl,
  buildUrlWithParams 
} from './api-config';
import type {
  User,
  AuthResponse,
  Establishment,
  UserProgress,
  QRCodeData,
  MerchantRequest,
  DrinkValidation,
  Promo,
  LeaderboardEntry,
  Post,
  Story,
  Comment,
  ChatMessage,
  Review,
  SocialStats,
  WeeklySchedule,
  ClosurePeriod,
  BugReport,
  Article,
  StockEntry,
  StockPhoto,
  ArticleRecognition,
  ArticleCategory,
} from '@/types';

// ============================================
// HTTP CLIENT HELPERS
// ============================================

class APIError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message);
    this.name = 'APIError';
  }
}

async function getAuthToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem('@stappa/auth_token');
  } catch {
    return null;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();
  
  const headers: HeadersInit = {
    ...DEFAULT_HEADERS,
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch(buildUrl(endpoint), {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) {
      throw new APIError(
        response.status,
        data.message || data.error || 'Request failed',
        data
      );
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof APIError) {
      throw error;
    }
    
    if ((error as Error).name === 'AbortError') {
      throw new Error('Request timeout');
    }
    
    throw new Error('Network error');
  }
}

// ============================================
// HTTP API IMPLEMENTATION
// ============================================

export const httpApi = {
  auth: {
    login: async (username: string, password: string): Promise<AuthResponse> => {
      const data = await request<AuthResponse>(ENDPOINTS.LOGIN, {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      
      // Save token
      if (data.token) {
        await AsyncStorage.setItem('@stappa/auth_token', data.token);
      }
      
      return data;
    },

    register: async (
      firstName: string,
      lastName: string,
      username: string,
      phone: string,
      email: string,
      password: string
    ): Promise<AuthResponse> => {
      const data = await request<AuthResponse>(ENDPOINTS.REGISTER, {
        method: 'POST',
        body: JSON.stringify({ firstName, lastName, username, phone, email, password }),
      });
      
      // Save token
      if (data.token) {
        await AsyncStorage.setItem('@stappa/auth_token', data.token);
      }
      
      return data;
    },

    sendVerificationCode: async (
      userId: string,
      type: 'email' | 'phone'
    ): Promise<{ success: boolean; code?: string }> => {
      return request(ENDPOINTS.SEND_VERIFICATION, {
        method: 'POST',
        body: JSON.stringify({ userId, type }),
      });
    },

    verifyCode: async (
      userId: string,
      code: string,
      type: 'email' | 'phone'
    ): Promise<{ success: boolean; user?: User }> => {
      return request(type === 'email' ? ENDPOINTS.VERIFY_EMAIL : ENDPOINTS.VERIFY_PHONE, {
        method: 'POST',
        body: JSON.stringify({ userId, code }),
      });
    },

    sendPasswordRecoveryCode: async (
      emailOrPhone: string
    ): Promise<{ success: boolean; userId?: string; code?: string; type?: 'email' | 'phone' }> => {
      return request(ENDPOINTS.FORGOT_PASSWORD, {
        method: 'POST',
        body: JSON.stringify({ emailOrPhone }),
      });
    },

    resetPassword: async (
      userId: string,
      code: string,
      newPassword: string
    ): Promise<{ success: boolean }> => {
      return request(ENDPOINTS.RESET_PASSWORD, {
        method: 'POST',
        body: JSON.stringify({ userId, code, newPassword }),
      });
    },
  },

  establishments: {
    create: async (
      name: string,
      address: string,
      token: string,
      assignedUserId?: string
    ): Promise<Establishment> => {
      return request(ENDPOINTS.ESTABLISHMENTS, {
        method: 'POST',
        body: JSON.stringify({ name, address, assignedUserId }),
      });
    },

    list: async (token: string): Promise<Establishment[]> => {
      return request(ENDPOINTS.ESTABLISHMENTS);
    },

    assignMerchant: async (
      establishmentId: string,
      userId: string,
      token: string
    ): Promise<void> => {
      return request(ENDPOINTS.ESTABLISHMENT_ASSIGN(establishmentId), {
        method: 'POST',
        body: JSON.stringify({ userId }),
      });
    },

    getTeam: async (token: string, establishmentId: string): Promise<User[]> => {
      return request(ENDPOINTS.ESTABLISHMENT_TEAM(establishmentId));
    },

    removeMerchant: async (
      token: string,
      establishmentId: string,
      userId: string
    ): Promise<void> => {
      return request(ENDPOINTS.ESTABLISHMENT_REMOVE_MERCHANT(establishmentId, userId), {
        method: 'DELETE',
      });
    },

    transferSenior: async (
      token: string,
      establishmentId: string,
      newSeniorId: string
    ): Promise<void> => {
      return request(ENDPOINTS.ESTABLISHMENT_TRANSFER_SENIOR(establishmentId), {
        method: 'POST',
        body: JSON.stringify({ newSeniorId }),
      });
    },
  },

  progress: {
    get: async (
      token: string,
      userId: string,
      establishmentId: string
    ): Promise<UserProgress | null> => {
      return request(ENDPOINTS.PROGRESS_BY_USER(userId, establishmentId));
    },

    increment: async (
      token: string,
      userId: string,
      establishmentId: string
    ): Promise<UserProgress> => {
      return request(ENDPOINTS.PROGRESS_INCREMENT, {
        method: 'POST',
        body: JSON.stringify({ userId, establishmentId }),
      });
    },

    reset: async (
      token: string,
      userId: string,
      establishmentId: string
    ): Promise<UserProgress> => {
      return request(ENDPOINTS.PROGRESS_RESET, {
        method: 'POST',
        body: JSON.stringify({ userId, establishmentId }),
      });
    },
  },

  qr: {
    generate: async (
      token: string,
      userId: string,
      type: 'VALIDATION' | 'BONUS',
      establishmentId?: string
    ): Promise<QRCodeData> => {
      return request(ENDPOINTS.QR_GENERATE, {
        method: 'POST',
        body: JSON.stringify({ userId, type, establishmentId }),
      });
    },

    validate: async (
      token: string,
      qrToken: string
    ): Promise<{ success: boolean; message: string; progress?: UserProgress }> => {
      return request(ENDPOINTS.QR_VALIDATE, {
        method: 'POST',
        body: JSON.stringify({ qrToken }),
      });
    },
  },

  merchantRequests: {
    create: async (
      token: string,
      userId: string,
      data: {
        businessName: string;
        businessAddress: string;
        phone: string;
        description?: string;
      }
    ): Promise<MerchantRequest> => {
      return request(ENDPOINTS.MERCHANT_REQUESTS, {
        method: 'POST',
        body: JSON.stringify({ userId, ...data }),
      });
    },

    list: async (token: string, status?: string): Promise<MerchantRequest[]> => {
      const url = status 
        ? buildUrlWithParams(ENDPOINTS.MERCHANT_REQUESTS, { status })
        : ENDPOINTS.MERCHANT_REQUESTS;
      return request(url);
    },

    approve: async (
      token: string,
      requestId: string,
      adminId: string
    ): Promise<{ request: MerchantRequest; establishment?: Establishment }> => {
      return request(ENDPOINTS.MERCHANT_REQUEST_APPROVE(requestId), {
        method: 'POST',
        body: JSON.stringify({ adminId }),
      });
    },

    reject: async (
      token: string,
      requestId: string,
      adminId: string,
      reason?: string
    ): Promise<MerchantRequest> => {
      return request(ENDPOINTS.MERCHANT_REQUEST_REJECT(requestId), {
        method: 'POST',
        body: JSON.stringify({ adminId, reason }),
      });
    },
  },

  promos: {
    getActive: async (token: string, establishmentId: string): Promise<Promo | null> => {
      return request(ENDPOINTS.PROMO_ACTIVE(establishmentId));
    },

    create: async (
      token: string,
      establishmentId: string,
      data: { ticketCost: number; ticketsRequired: number; rewardValue: number }
    ): Promise<Promo> => {
      return request(ENDPOINTS.PROMOS, {
        method: 'POST',
        body: JSON.stringify({ establishmentId, ...data }),
      });
    },

    list: async (token: string, establishmentId: string): Promise<Promo[]> => {
      return request(ENDPOINTS.PROMO_BY_ESTABLISHMENT(establishmentId));
    },
  },

  validations: {
    listUser: async (
      token: string,
      userId: string,
      establishmentId?: string
    ): Promise<DrinkValidation[]> => {
      const url = establishmentId
        ? buildUrlWithParams(ENDPOINTS.VALIDATIONS_USER(userId), { establishmentId })
        : ENDPOINTS.VALIDATIONS_USER(userId);
      return request(url);
    },

    listEstablishment: async (
      token: string,
      establishmentId: string
    ): Promise<DrinkValidation[]> => {
      return request(ENDPOINTS.VALIDATIONS_ESTABLISHMENT(establishmentId));
    },
  },

  users: {
    list: async (token: string, role?: string): Promise<User[]> => {
      const url = role
        ? buildUrlWithParams(ENDPOINTS.USERS, { role })
        : ENDPOINTS.USERS;
      return request(url);
    },

    search: async (token: string, query: string): Promise<User[]> => {
      return request(buildUrlWithParams(ENDPOINTS.USERS, { q: query }));
    },

    create: async (
      token: string,
      data: {
        firstName: string;
        lastName: string;
        username: string;
        phone?: string;
        email?: string;
        password: string;
      }
    ): Promise<User> => {
      return request(ENDPOINTS.USERS, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    sendPasswordReset: async (
      token: string,
      userId: string
    ): Promise<{ method: 'email' | 'phone' | 'sms' }> => {
      return request(ENDPOINTS.USER_PASSWORD_RESET(userId), {
        method: 'POST',
      });
    },

    toggleFavorite: async (
      token: string,
      userId: string,
      establishmentId: string
    ): Promise<{ isFavorite: boolean; favorites: string[] }> => {
      return request(ENDPOINTS.USER_FAVORITES(userId), {
        method: 'POST',
        body: JSON.stringify({ establishmentId }),
      });
    },

    getFavorites: async (token: string, userId: string): Promise<string[]> => {
      return request(ENDPOINTS.USER_FAVORITES(userId));
    },
  },

  leaderboard: {
    getMonthly: async (
      token: string,
      establishmentId: string
    ): Promise<LeaderboardEntry[]> => {
      return request(ENDPOINTS.LEADERBOARD_MONTHLY(establishmentId));
    },
  },

  social: {
    setPosts: async (token: string, establishmentId: string): Promise<Post[]> => {
      return request(ENDPOINTS.SOCIAL_POSTS(establishmentId));
    },

    createPost: async (
      token: string,
      establishmentId: string,
      userId: string,
      content: string,
      images?: string[],
      videoUrl?: string | null,
      scheduledAt?: string
    ): Promise<Post> => {
      return request(ENDPOINTS.SOCIAL_POST_CREATE, {
        method: 'POST',
        body: JSON.stringify({
          establishmentId,
          userId,
          content,
          images,
          videoUrl,
          scheduledAt,
        }),
      });
    },

    likePost: async (token: string, postId: string, userId: string): Promise<Post> => {
      return request(ENDPOINTS.SOCIAL_POST_LIKE(postId), {
        method: 'POST',
        body: JSON.stringify({ userId }),
      });
    },

    getStories: async (token: string, establishmentId: string): Promise<Story[]> => {
      return request(ENDPOINTS.SOCIAL_STORIES(establishmentId));
    },

    createStory: async (
      token: string,
      establishmentId: string,
      userId: string,
      content: string,
      image?: string,
      videoUrl?: string | null,
      scheduledAt?: string
    ): Promise<Story> => {
      return request(ENDPOINTS.SOCIAL_STORY_CREATE, {
        method: 'POST',
        body: JSON.stringify({
          establishmentId,
          userId,
          content,
          image,
          videoUrl,
          scheduledAt,
        }),
      });
    },

    viewStory: async (token: string, storyId: string, userId: string): Promise<Story> => {
      return request(ENDPOINTS.SOCIAL_STORY_VIEW(storyId), {
        method: 'POST',
        body: JSON.stringify({ userId }),
      });
    },

    getComments: async (
      token: string,
      postId?: string,
      storyId?: string
    ): Promise<Comment[]> => {
      const params: Record<string, string> = {};
      if (postId) params.postId = postId;
      if (storyId) params.storyId = storyId;
      return request(buildUrlWithParams(ENDPOINTS.SOCIAL_COMMENTS, params));
    },

    createComment: async (
      token: string,
      userId: string,
      content: string,
      postId?: string,
      storyId?: string
    ): Promise<Comment> => {
      return request(ENDPOINTS.SOCIAL_COMMENTS, {
        method: 'POST',
        body: JSON.stringify({ userId, content, postId, storyId }),
      });
    },

    getChatMessages: async (
      token: string,
      establishmentId: string,
      userId?: string
    ): Promise<ChatMessage[]> => {
      const url = userId
        ? buildUrlWithParams(ENDPOINTS.SOCIAL_CHAT(establishmentId), { userId })
        : ENDPOINTS.SOCIAL_CHAT(establishmentId);
      return request(url);
    },

    sendChatMessage: async (
      token: string,
      establishmentId: string,
      userId: string,
      content: string
    ): Promise<ChatMessage> => {
      return request(ENDPOINTS.SOCIAL_CHAT_SEND, {
        method: 'POST',
        body: JSON.stringify({ establishmentId, userId, content }),
      });
    },

    getReviews: async (token: string, establishmentId: string): Promise<Review[]> => {
      return request(ENDPOINTS.SOCIAL_REVIEWS(establishmentId));
    },

    createReview: async (
      token: string,
      establishmentId: string,
      userId: string,
      rating: number,
      comment: string,
      photos?: string[]
    ): Promise<Review> => {
      return request(ENDPOINTS.SOCIAL_REVIEW_CREATE, {
        method: 'POST',
        body: JSON.stringify({ establishmentId, userId, rating, comment, photos }),
      });
    },

    getStats: async (token: string, establishmentId: string): Promise<SocialStats> => {
      return request(ENDPOINTS.SOCIAL_STATS(establishmentId));
    },

    setSocialManager: async (
      token: string,
      establishmentId: string,
      userId: string,
      isSocialManager: boolean
    ): Promise<void> => {
      return request(ENDPOINTS.SOCIAL_SET_MANAGER, {
        method: 'POST',
        body: JSON.stringify({ establishmentId, userId, isSocialManager }),
      });
    },

    toggleSocialPostPermission: async (
      token: string,
      establishmentId: string,
      merchantId: string,
      callerId: string
    ): Promise<{ canPostSocial: boolean }> => {
      return request(ENDPOINTS.SOCIAL_TOGGLE_POST_PERMISSION, {
        method: 'POST',
        body: JSON.stringify({ establishmentId, merchantId, callerId }),
      });
    },
  },

  schedule: {
    get: async (token: string, establishmentId: string): Promise<WeeklySchedule | null> => {
      return request(ENDPOINTS.SCHEDULE(establishmentId));
    },

    update: async (
      token: string,
      establishmentId: string,
      schedule: WeeklySchedule,
      isRecurring: boolean
    ): Promise<void> => {
      return request(ENDPOINTS.SCHEDULE_UPDATE(establishmentId), {
        method: 'PUT',
        body: JSON.stringify({ schedule, isRecurring }),
      });
    },

    setOpenStatus: async (
      token: string,
      establishmentId: string,
      isOpen: boolean
    ): Promise<void> => {
      return request(ENDPOINTS.SCHEDULE_OPEN_STATUS(establishmentId), {
        method: 'POST',
        body: JSON.stringify({ isOpen }),
      });
    },

    addClosurePeriod: async (
      token: string,
      establishmentId: string,
      startDate: string,
      endDate: string,
      reason?: string
    ): Promise<ClosurePeriod> => {
      return request(ENDPOINTS.SCHEDULE_CLOSURE(establishmentId), {
        method: 'POST',
        body: JSON.stringify({ startDate, endDate, reason }),
      });
    },

    removeClosurePeriod: async (
      token: string,
      establishmentId: string,
      closureId: string
    ): Promise<void> => {
      return request(ENDPOINTS.SCHEDULE_CLOSURE_REMOVE(establishmentId, closureId), {
        method: 'DELETE',
      });
    },
  },

  bugReports: {
    create: async (
      token: string,
      data: {
        userId: string;
        title: string;
        description: string;
        category: BugReport['category'];
        severity: BugReport['severity'];
        deviceInfo?: string;
        appVersion?: string;
        screenshots?: string[];
      }
    ): Promise<BugReport> => {
      return request(ENDPOINTS.BUG_REPORTS, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    list: async (
      token: string,
      filters?: { status?: BugReport['status']; userId?: string }
    ): Promise<BugReport[]> => {
      const url = filters
        ? buildUrlWithParams(ENDPOINTS.BUG_REPORTS, filters as Record<string, string>)
        : ENDPOINTS.BUG_REPORTS;
      return request(url);
    },

    updateStatus: async (
      token: string,
      reportId: string,
      status: BugReport['status'],
      adminNotes?: string
    ): Promise<BugReport> => {
      return request(ENDPOINTS.BUG_REPORT_BY_ID(reportId), {
        method: 'PATCH',
        body: JSON.stringify({ status, adminNotes }),
      });
    },

    delete: async (token: string, reportId: string): Promise<void> => {
      return request(ENDPOINTS.BUG_REPORT_BY_ID(reportId), {
        method: 'DELETE',
      });
    },
  },

  articles: {
    getList: async (
      token: string,
      establishmentId: string,
      filters?: {
        category?: ArticleCategory;
        search?: string;
        lowStock?: boolean;
      }
    ): Promise<Article[]> => {
      const params: Record<string, string> = { establishmentId };
      if (filters?.category) params.category = filters.category;
      if (filters?.search) params.search = filters.search;
      if (filters?.lowStock) params.lowStock = 'true';
      
      return request(buildUrlWithParams(ENDPOINTS.ARTICLES, params));
    },

    getById: async (token: string, articleId: string): Promise<Article> => {
      return request(ENDPOINTS.ARTICLE_BY_ID(articleId));
    },

    create: async (
      token: string,
      data: {
        establishmentId: string;
        name: string;
        category: ArticleCategory;
        brand?: string;
        size?: string;
        description?: string;
        barcode?: string;
        imageUrl?: string;
        minStock: number;
      }
    ): Promise<Article> => {
      return request(ENDPOINTS.ARTICLES, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (
      token: string,
      articleId: string,
      data: Partial<Omit<Article, 'id' | 'establishmentId' | 'createdAt' | 'updatedAt'>>
    ): Promise<Article> => {
      return request(ENDPOINTS.ARTICLE_BY_ID(articleId), {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },

    delete: async (token: string, articleId: string): Promise<void> => {
      return request(ENDPOINTS.ARTICLE_BY_ID(articleId), {
        method: 'DELETE',
      });
    },
  },

  stock: {
    getStock: async (
      token: string,
      establishmentId: string,
      articleId?: string
    ): Promise<StockEntry[]> => {
      const params: Record<string, string> = { establishmentId };
      if (articleId) params.articleId = articleId;
      return request(buildUrlWithParams(ENDPOINTS.STOCK, params));
    },

    updateStock: async (
      token: string,
      articleId: string,
      quantity: number,
      type: 'LOAD' | 'UNLOAD',
      userId: string
    ): Promise<StockEntry> => {
      return request(ENDPOINTS.STOCK_UPDATE, {
        method: 'POST',
        body: JSON.stringify({ articleId, quantity, type, userId }),
      });
    },

    setStock: async (
      token: string,
      articleId: string,
      quantity: number,
      userId: string
    ): Promise<StockEntry> => {
      return request(ENDPOINTS.STOCK_SET, {
        method: 'POST',
        body: JSON.stringify({ articleId, quantity, userId }),
      });
    },

    getHistory: async (
      token: string,
      establishmentId: string,
      filters?: {
        articleId?: string;
        startDate?: string;
        endDate?: string;
      }
    ): Promise<StockEntry[]> => {
      const params: Record<string, string> = { establishmentId };
      if (filters?.articleId) params.articleId = filters.articleId;
      if (filters?.startDate) params.startDate = filters.startDate;
      if (filters?.endDate) params.endDate = filters.endDate;
      
      return request(buildUrlWithParams(ENDPOINTS.STOCK_HISTORY, params));
    },
  },

  stockPhotos: {
    upload: async (
      token: string,
      establishmentId: string,
      userId: string,
      photoUri: string
    ): Promise<StockPhoto> => {
      // TODO: Implement multipart/form-data upload
      return request(ENDPOINTS.STOCK_PHOTO_UPLOAD, {
        method: 'POST',
        body: JSON.stringify({ establishmentId, userId, photoUri }),
      });
    },

    analyze: async (token: string, photoId: string): Promise<StockPhoto> => {
      return request(ENDPOINTS.STOCK_PHOTO_ANALYZE(photoId), {
        method: 'POST',
      });
    },

    getById: async (token: string, photoId: string): Promise<StockPhoto> => {
      return request(ENDPOINTS.STOCK_PHOTO_BY_ID(photoId));
    },

    confirmRecognition: async (
      token: string,
      recognitionId: string,
      data: {
        articleId: string;
        quantity: number;
      }
    ): Promise<ArticleRecognition> => {
      return request(ENDPOINTS.STOCK_PHOTO_CONFIRM, {
        method: 'POST',
        body: JSON.stringify({ recognitionId, ...data }),
      });
    },

    confirmAllAndUpdate: async (
      token: string,
      photoId: string,
      userId: string
    ): Promise<StockEntry[]> => {
      return request(ENDPOINTS.STOCK_PHOTO_CONFIRM_ALL(photoId), {
        method: 'POST',
        body: JSON.stringify({ userId }),
      });
    },
  },
};
