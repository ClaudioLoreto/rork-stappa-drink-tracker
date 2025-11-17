import { User, AuthResponse, Establishment, UserProgress, QRCodeData, MerchantRequest, DrinkValidation, Promo, LeaderboardEntry, Post, Story, Comment, ChatMessage, Review, SocialStats, WeeklySchedule, ClosurePeriod, BugReport, Article, StockEntry, StockPhoto, ArticleRecognition, ArticleCategory, RecognitionStatus } from '@/types';
import { moderateContent } from '@/utils/moderation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { USE_MOCK_API } from './api-config';
import { httpApi } from './api-http';

const MOCK_DELAY = 800;

const STORAGE_KEYS = {
  USERS: '@stappa/users',
  ESTABLISHMENTS: '@stappa/establishments',
  PROGRESS: '@stappa/progress',
  QR_CODES: '@stappa/qr_codes',
  MERCHANT_REQUESTS: '@stappa/merchant_requests',
  DRINK_VALIDATIONS: '@stappa/drink_validations',
  PROMOS: '@stappa/promos',
  POSTS: '@stappa/posts',
  STORIES: '@stappa/stories',
  COMMENTS: '@stappa/comments',
  CHAT_MESSAGES: '@stappa/chat_messages',
  REVIEWS: '@stappa/reviews',
  BUG_REPORTS: '@stappa/bug_reports',
  ARTICLES: '@stappa/articles',
  STOCK_ENTRIES: '@stappa/stock_entries',
  STOCK_PHOTOS: '@stappa/stock_photos',
};

async function loadFromStorage<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const stored = await AsyncStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
    return defaultValue;
  } catch (error) {
    console.error(`Failed to load ${key}:`, error);
    return defaultValue;
  }
}

async function saveToStorage<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to save ${key}:`, error);
  }
}

let mockUsers: User[] = [];
let mockEstablishments: Establishment[] = [];
let mockProgress: UserProgress[] = [];
let mockQRCodes: Map<string, QRCodeData> = new Map();
let mockMerchantRequests: MerchantRequest[] = [];
let mockDrinkValidations: DrinkValidation[] = [];
let mockPromos: Promo[] = [];
let mockPosts: Post[] = [];
let mockStories: Story[] = [];
let mockComments: Comment[] = [];
let mockChatMessages: ChatMessage[] = [];
let mockReviews: Review[] = [];
let mockBugReports: BugReport[] = [];
let mockArticles: Article[] = [];
let mockStockEntries: StockEntry[] = [];
let mockStockPhotos: StockPhoto[] = [];
let mockPasswords: Map<string, string> = new Map();

let initialized = false;

async function initializeStorage() {
  if (initialized) return;
  
  const defaultUsers = [
    {
      id: 'user_1',
      username: 'root',
      email: 'root@stappa.com',
      role: 'ROOT' as const,
      status: 'ACTIVE' as const,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'user_2',
      firstName: 'Filippo',
      lastName: 'Rossi',
      username: 'filippo',
      email: 'filippo@saltatappo.com',
      phone: '+39 340 1234567',
      role: 'SENIOR_MERCHANT' as const,
      status: 'ACTIVE' as const,
      establishmentId: '1',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'user_3',
      firstName: 'Claudio',
      lastName: 'Bianchi',
      username: 'claudio',
      email: 'claudio@example.com',
      phone: '+39 340 9876543',
      role: 'USER' as const,
      status: 'ACTIVE' as const,
      createdAt: new Date().toISOString(),
    },
  ];
  
  const storedUsers = await loadFromStorage(STORAGE_KEYS.USERS, []);
  
  if (storedUsers.length === 0) {
    mockUsers = defaultUsers;
    await saveToStorage(STORAGE_KEYS.USERS, mockUsers);
  } else {
    mockUsers = storedUsers;
  }
  
  const storedPasswordsObj = await loadFromStorage<Record<string, string>>(STORAGE_KEYS.USERS + '_passwords', {});
  mockPasswords = new Map(Object.entries(storedPasswordsObj));
  
  mockPasswords.set('user_1', 'Root4321@');
  mockPasswords.set('user_2', 'Root4321@f');
  mockPasswords.set('user_3', 'Root4321@c');
  await saveToStorage(STORAGE_KEYS.USERS + '_passwords', Object.fromEntries(mockPasswords));
  
  mockEstablishments = await loadFromStorage(STORAGE_KEYS.ESTABLISHMENTS, [
    {
      id: '1',
      name: 'Salta Tappo',
      address: 'Via Roma 123, Milano, Italy',
      status: 'ACTIVE' as const,
      createdAt: new Date().toISOString(),
    },
  ]);
  mockProgress = await loadFromStorage(STORAGE_KEYS.PROGRESS, []);
  mockMerchantRequests = await loadFromStorage(STORAGE_KEYS.MERCHANT_REQUESTS, []);
  mockDrinkValidations = await loadFromStorage(STORAGE_KEYS.DRINK_VALIDATIONS, []);
  mockPromos = await loadFromStorage(STORAGE_KEYS.PROMOS, []);
  mockPosts = await loadFromStorage(STORAGE_KEYS.POSTS, []);
  mockStories = await loadFromStorage(STORAGE_KEYS.STORIES, []);
  mockComments = await loadFromStorage(STORAGE_KEYS.COMMENTS, []);
  mockChatMessages = await loadFromStorage(STORAGE_KEYS.CHAT_MESSAGES, []);
  mockReviews = await loadFromStorage(STORAGE_KEYS.REVIEWS, []);
  
  initialized = true;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function getEstKey(establishmentId: string): number {
  let h = 0;
  for (let i = 0; i < establishmentId.length; i++) {
    h = (h << 5) - h + establishmentId.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h % 251) + 5;
}

function enc(text: string, key: number): string {
  const codes: number[] = [];
  for (let i = 0; i < text.length; i++) {
    codes.push(text.charCodeAt(i) ^ (key + (i % 13)));
  }
  // @ts-ignore
  const base64 = typeof btoa !== 'undefined' ? btoa(String.fromCharCode(...codes)) : Buffer.from(String.fromCharCode(...codes), 'binary').toString('base64');
  return base64;
}

function dec(data: string, key: number): string {
  try {
    // @ts-ignore
    const bin = typeof atob !== 'undefined' ? atob(data) : Buffer.from(data, 'base64').toString('binary');
    const out: number[] = [];
    for (let i = 0; i < bin.length; i++) {
      out.push(bin.charCodeAt(i) ^ (key + (i % 13)));
    }
    return String.fromCharCode(...out);
  } catch {
    return data;
  }
}

const mockApi = {
  auth: {
    login: async (username: string, password: string): Promise<AuthResponse> => {
      await initializeStorage();
      await delay(MOCK_DELAY);
      
      const normalizedUsername = (username || '').trim().toLowerCase();
const providedPassword = (password || '').trim();
console.log('Login attempt for username:', normalizedUsername);
      console.log('Total users in system:', mockUsers.length);
      console.log('Password map size:', mockPasswords.size);
      
      const user = mockUsers.find((u) => u.username.toLowerCase() === normalizedUsername);
      
      if (!user) {
        console.log('User not found');
        throw new Error('Invalid username or password');
      }
      
      console.log('User found:', user.username, 'with ID:', user.id, 'Role:', user.role);
      const storedPassword = mockPasswords.get(user.id);
      console.log('Stored password exists:', !!storedPassword);
      console.log('Provided password:', providedPassword);
      console.log('Stored password:', storedPassword);
      console.log('Password match:', storedPassword === providedPassword);
      
      if (user.role === 'ROOT' && normalizedUsername === 'root') {
        console.log('ROOT user login - bypassing strict password check');
        if (providedPassword === 'Root4321@' || storedPassword === providedPassword) {
          console.log('ROOT login successful');
          const token = `mock_token_${Date.now()}`;
          return { token, user };
        }
      }
      
      if (!storedPassword || storedPassword !== providedPassword) {
        console.log('Password validation failed');
        throw new Error('Invalid username or password');
      }
      
      console.log('Login successful');
      const token = `mock_token_${Date.now()}`;
      return { token, user };
    },

    register: async (
      firstName: string,
      lastName: string,
      username: string,
      phone: string,
      email: string,
      password: string
    ): Promise<AuthResponse> => {
      await initializeStorage();
      await delay(MOCK_DELAY);
      
      if (mockUsers.some((u) => u.username === username || (u.email && u.email === email))) {
        throw new Error('User already exists');
      }

      const newUser: User = {
        id: `${mockUsers.length + 1}`,
        firstName,
        lastName,
        username,
        phone,
        email,
        role: 'USER',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };

      mockUsers.push(newUser);
      mockPasswords.set(newUser.id, password);
      
      console.log('Registering user:', newUser.username, 'with ID:', newUser.id, 'Password length:', password.length);
      console.log('Password map size after registration:', mockPasswords.size);
      
      await saveToStorage(STORAGE_KEYS.USERS, mockUsers);
      await saveToStorage(STORAGE_KEYS.USERS + '_passwords', Object.fromEntries(mockPasswords));
      
      console.log('Password saved to storage for user ID:', newUser.id);
      
      const token = `mock_token_${Date.now()}`;
      return { token, user: newUser };
    },

    sendVerificationCode: async (userId: string, type: 'email' | 'phone'): Promise<{ success: boolean; code?: string }> => {
      await initializeStorage();
      await delay(MOCK_DELAY);
      
      const user = mockUsers.find(u => u.id === userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (type === 'email' && !user.email) {
        throw new Error('No email address associated with this account');
      }
      if (type === 'phone' && !user.phone) {
        throw new Error('No phone number associated with this account');
      }

      // Generate 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiry = new Date();
      expiry.setMinutes(expiry.getMinutes() + 10); // Code valid for 10 minutes

      // Update user with verification code
      user.verificationCode = code;
      user.verificationCodeExpiry = expiry.toISOString();
      
      await saveToStorage(STORAGE_KEYS.USERS, mockUsers);

      console.log(`Verification code for ${type}: ${code} (expires at ${expiry.toISOString()})`);
      
      // In production, send email/SMS here
      // For mock, return code so we can test
      return { success: true, code };
    },

    verifyCode: async (userId: string, code: string, type: 'email' | 'phone'): Promise<{ success: boolean; user?: User }> => {
      await initializeStorage();
      await delay(MOCK_DELAY);
      
      const user = mockUsers.find(u => u.id === userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (!user.verificationCode || !user.verificationCodeExpiry) {
        throw new Error('No verification code found. Please request a new one.');
      }

      const now = new Date();
      const expiry = new Date(user.verificationCodeExpiry);
      
      if (now > expiry) {
        throw new Error('Verification code has expired. Please request a new one.');
      }

      if (user.verificationCode !== code) {
        throw new Error('Invalid verification code');
      }

      // Mark as verified
      if (type === 'email') {
        user.emailVerified = true;
      } else {
        user.phoneVerified = true;
      }

      // Clear verification code
      user.verificationCode = undefined;
      user.verificationCodeExpiry = undefined;

      await saveToStorage(STORAGE_KEYS.USERS, mockUsers);

      return { success: true, user };
    },

    sendPasswordRecoveryCode: async (emailOrPhone: string): Promise<{ success: boolean; userId?: string; code?: string; type?: 'email' | 'phone' }> => {
      await initializeStorage();
      await delay(MOCK_DELAY);
      
      const normalizedInput = emailOrPhone.trim().toLowerCase();
      
      // Check if it's email or phone
      const isEmail = normalizedInput.includes('@');
      const user = mockUsers.find(u => 
        isEmail 
          ? u.email?.toLowerCase() === normalizedInput 
          : u.phone === emailOrPhone
      );

      if (!user) {
        throw new Error('No account found with this email or phone number');
      }

      // Generate 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiry = new Date();
      expiry.setMinutes(expiry.getMinutes() + 15); // Recovery code valid for 15 minutes

      user.verificationCode = code;
      user.verificationCodeExpiry = expiry.toISOString();
      
      await saveToStorage(STORAGE_KEYS.USERS, mockUsers);

      console.log(`Password recovery code: ${code} (expires at ${expiry.toISOString()})`);
      
      return { success: true, userId: user.id, code, type: isEmail ? 'email' : 'phone' };
    },

    resetPassword: async (userId: string, code: string, newPassword: string): Promise<{ success: boolean }> => {
      await initializeStorage();
      await delay(MOCK_DELAY);
      
      const user = mockUsers.find(u => u.id === userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (!user.verificationCode || !user.verificationCodeExpiry) {
        throw new Error('No recovery code found. Please request a new one.');
      }

      const now = new Date();
      const expiry = new Date(user.verificationCodeExpiry);
      
      if (now > expiry) {
        throw new Error('Recovery code has expired. Please request a new one.');
      }

      if (user.verificationCode !== code) {
        throw new Error('Invalid recovery code');
      }

      // Update password
      mockPasswords.set(user.id, newPassword);
      
      // Clear verification code
      user.verificationCode = undefined;
      user.verificationCodeExpiry = undefined;

      await saveToStorage(STORAGE_KEYS.USERS, mockUsers);
      await saveToStorage(STORAGE_KEYS.USERS + '_passwords', Object.fromEntries(mockPasswords));

      return { success: true };
    },
  },

  establishments: {
    create: async (
      name: string,
      address: string,
      token: string,
      assignedUserId?: string
    ): Promise<Establishment> => {
      await initializeStorage();
      await delay(MOCK_DELAY);
      
      const newEstablishment: Establishment = {
        id: `${mockEstablishments.length + 1}`,
        name,
        address,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };

      mockEstablishments.push(newEstablishment);

      if (assignedUserId) {
        const user = mockUsers.find((u) => u.id === assignedUserId);
        if (user) {
          const existingSenior = mockUsers.find((u) => u.establishmentId === newEstablishment.id && u.role === 'SENIOR_MERCHANT');
          user.role = existingSenior ? 'MERCHANT' : 'SENIOR_MERCHANT';
          user.establishmentId = newEstablishment.id;
        }
      }

      await saveToStorage(STORAGE_KEYS.ESTABLISHMENTS, mockEstablishments);
      await saveToStorage(STORAGE_KEYS.USERS, mockUsers);

      return newEstablishment;
    },

    list: async (token: string): Promise<Establishment[]> => {
      await initializeStorage();
      await delay(MOCK_DELAY);
      return [...mockEstablishments];
    },

    assignMerchant: async (
      establishmentId: string,
      userId: string,
      token: string
    ): Promise<void> => {
      await initializeStorage();
      await delay(MOCK_DELAY);
      
      const user = mockUsers.find((u) => u.id === userId);
      if (user) {
        const existingSenior = mockUsers.find((u) => u.establishmentId === establishmentId && u.role === 'SENIOR_MERCHANT');
        user.role = existingSenior ? 'MERCHANT' : 'SENIOR_MERCHANT';
        user.establishmentId = establishmentId;
        await saveToStorage(STORAGE_KEYS.USERS, mockUsers);
      }
    },

    getTeam: async (token: string, establishmentId: string): Promise<User[]> => {
      await initializeStorage();
      await delay(MOCK_DELAY);
      return mockUsers.filter((u) => u.establishmentId === establishmentId && (u.role === 'MERCHANT' || u.role === 'SENIOR_MERCHANT'));
    },

    removeMerchant: async (token: string, establishmentId: string, userId: string): Promise<void> => {
      await initializeStorage();
      await delay(MOCK_DELAY);
      const user = mockUsers.find((u) => u.id === userId);
      if (user) {
        user.role = 'USER';
        user.establishmentId = undefined;
        await saveToStorage(STORAGE_KEYS.USERS, mockUsers);
      }
    },

    transferSenior: async (token: string, establishmentId: string, newSeniorId: string): Promise<void> => {
      await initializeStorage();
      await delay(MOCK_DELAY);
      
      const currentSenior = mockUsers.find((u) => u.establishmentId === establishmentId && u.role === 'SENIOR_MERCHANT');
      if (currentSenior) {
        currentSenior.role = 'MERCHANT';
      }

      const newSenior = mockUsers.find((u) => u.id === newSeniorId);
      if (newSenior) {
        newSenior.role = 'SENIOR_MERCHANT';
        newSenior.establishmentId = establishmentId;
      }
      
      await saveToStorage(STORAGE_KEYS.USERS, mockUsers);
    },
  },



  progress: {
    get: async (token: string, userId: string, establishmentId: string): Promise<UserProgress | null> => {
      await initializeStorage();
      await delay(MOCK_DELAY);
      
      const progress = mockProgress.find(
        (p) => p.userId === userId && p.establishmentId === establishmentId
      );
      return progress || null;
    },

    increment: async (
      token: string,
      userId: string,
      establishmentId: string
    ): Promise<UserProgress> => {
      await initializeStorage();
      await delay(MOCK_DELAY);
      
      let progress = mockProgress.find(
        (p) => p.userId === userId && p.establishmentId === establishmentId
      );

      if (!progress) {
        progress = {
          id: `${mockProgress.length + 1}`,
          userId,
          establishmentId,
          drinksCount: 0,
          updatedAt: new Date().toISOString(),
        };
        mockProgress.push(progress);
      }

      if (progress.drinksCount < 10) {
        progress.drinksCount += 1;
        progress.updatedAt = new Date().toISOString();
      }

      await saveToStorage(STORAGE_KEYS.PROGRESS, mockProgress);
      return progress;
    },

    reset: async (
      token: string,
      userId: string,
      establishmentId: string
    ): Promise<UserProgress> => {
      await initializeStorage();
      await delay(MOCK_DELAY);
      
      const progress = mockProgress.find(
        (p) => p.userId === userId && p.establishmentId === establishmentId
      );

      if (progress) {
        progress.drinksCount = 0;
        progress.updatedAt = new Date().toISOString();
        await saveToStorage(STORAGE_KEYS.PROGRESS, mockProgress);
      }

      return progress!;
    },
  },

  qr: {
    generate: async (
      token: string,
      userId: string,
      type: 'VALIDATION' | 'BONUS',
      establishmentId?: string
    ): Promise<QRCodeData> => {
      await initializeStorage();
      await delay(MOCK_DELAY);
      
      const qrToken = `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

      const qrData: QRCodeData = {
        token: qrToken,
        userId,
        establishmentId: establishmentId || '1',
        type,
        expiresAt,
      };

      mockQRCodes.set(qrToken, qrData);

      setTimeout(() => {
        mockQRCodes.delete(qrToken);
      }, 5 * 60 * 1000);

      return qrData;
    },

    validate: async (
      token: string,
      qrToken: string
    ): Promise<{ success: boolean; message: string; progress?: UserProgress }> => {
      await initializeStorage();
      await delay(MOCK_DELAY);
      
      const qrData = mockQRCodes.get(qrToken);

      if (!qrData) {
        const validation: DrinkValidation = {
          id: `${mockDrinkValidations.length + 1}`,
          userId: 'unknown',
          establishmentId: 'unknown',
          type: 'VALIDATION',
          status: 'FAILED',
          timestamp: new Date().toISOString(),
          establishmentName: 'Unknown',
        };
        mockDrinkValidations.push(validation);
        await saveToStorage(STORAGE_KEYS.DRINK_VALIDATIONS, mockDrinkValidations);
        return { success: false, message: 'Invalid or expired QR code' };
      }

      if (new Date(qrData.expiresAt) < new Date()) {
        mockQRCodes.delete(qrToken);
        const establishment = mockEstablishments.find(e => e.id === qrData.establishmentId);
        const validation: DrinkValidation = {
          id: `${mockDrinkValidations.length + 1}`,
          userId: qrData.userId,
          establishmentId: qrData.establishmentId,
          type: qrData.type,
          status: 'FAILED',
          timestamp: new Date().toISOString(),
          establishmentName: establishment?.name || 'Unknown',
        };
        mockDrinkValidations.push(validation);
        await saveToStorage(STORAGE_KEYS.DRINK_VALIDATIONS, mockDrinkValidations);
        return { success: false, message: 'QR code has expired' };
      }

      mockQRCodes.delete(qrToken);
      const establishment = mockEstablishments.find(e => e.id === qrData.establishmentId);

      if (qrData.type === 'VALIDATION') {
        const progress = await api.progress.increment(
          token,
          qrData.userId,
          qrData.establishmentId
        );
        
        const validation: DrinkValidation = {
          id: `${mockDrinkValidations.length + 1}`,
          userId: qrData.userId,
          establishmentId: qrData.establishmentId,
          type: qrData.type,
          status: 'SUCCESS',
          timestamp: new Date().toISOString(),
          establishmentName: establishment?.name || 'Unknown',
        };
        mockDrinkValidations.push(validation);
        await saveToStorage(STORAGE_KEYS.DRINK_VALIDATIONS, mockDrinkValidations);
        
        return {
          success: true,
          message: 'Drink validated successfully',
          progress,
        };
      } else {
        const progress = await api.progress.reset(
          token,
          qrData.userId,
          qrData.establishmentId
        );
        
        const validation: DrinkValidation = {
          id: `${mockDrinkValidations.length + 1}`,
          userId: qrData.userId,
          establishmentId: qrData.establishmentId,
          type: qrData.type,
          status: 'SUCCESS',
          timestamp: new Date().toISOString(),
          establishmentName: establishment?.name || 'Unknown',
        };
        mockDrinkValidations.push(validation);
        await saveToStorage(STORAGE_KEYS.DRINK_VALIDATIONS, mockDrinkValidations);
        
        return {
          success: true,
          message: 'Bonus drink redeemed successfully',
          progress,
        };
      }
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
      await initializeStorage();
      await delay(MOCK_DELAY);

      const newRequest: MerchantRequest = {
        id: `${mockMerchantRequests.length + 1}`,
        userId,
        ...data,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      };

      mockMerchantRequests.push(newRequest);
      await saveToStorage(STORAGE_KEYS.MERCHANT_REQUESTS, mockMerchantRequests);
      return newRequest;
    },

    list: async (token: string, status?: string): Promise<MerchantRequest[]> => {
      await initializeStorage();
      await delay(MOCK_DELAY);

      if (status) {
        return mockMerchantRequests.filter((r) => r.status === status);
      }
      return [...mockMerchantRequests];
    },

    approve: async (
      token: string,
      requestId: string,
      adminId: string
    ): Promise<{ request: MerchantRequest; establishment?: Establishment }> => {
      await initializeStorage();
      await delay(MOCK_DELAY);

      const request = mockMerchantRequests.find((r) => r.id === requestId);
      if (!request) {
        throw new Error('Request not found');
      }

      request.status = 'APPROVED';
      request.reviewedAt = new Date().toISOString();
      request.reviewedBy = adminId;

      let establishment = mockEstablishments.find(
        (e) => e.name === request.businessName
      );

      if (!establishment) {
        establishment = {
          id: `${mockEstablishments.length + 1}`,
          name: request.businessName,
          address: request.businessAddress,
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
        };
        mockEstablishments.push(establishment);
      }

      const user = mockUsers.find((u) => u.id === request.userId);
      if (user && establishment) {
        const existingSenior = mockUsers.find((u) => u.establishmentId === establishment.id && u.role === 'SENIOR_MERCHANT');
        user.establishmentId = establishment.id;
        user.role = existingSenior ? 'MERCHANT' : 'SENIOR_MERCHANT';
      }

      await saveToStorage(STORAGE_KEYS.MERCHANT_REQUESTS, mockMerchantRequests);
      await saveToStorage(STORAGE_KEYS.ESTABLISHMENTS, mockEstablishments);
      await saveToStorage(STORAGE_KEYS.USERS, mockUsers);

      return { request, establishment };
    },

    reject: async (
      token: string,
      requestId: string,
      adminId: string,
      reason?: string
    ): Promise<MerchantRequest> => {
      await initializeStorage();
      await delay(MOCK_DELAY);

      const request = mockMerchantRequests.find((r) => r.id === requestId);
      if (!request) {
        throw new Error('Request not found');
      }

      request.status = 'REJECTED';
      request.reviewedAt = new Date().toISOString();
      request.reviewedBy = adminId;
      request.rejectionReason = reason;

      await saveToStorage(STORAGE_KEYS.MERCHANT_REQUESTS, mockMerchantRequests);
      return request;
    },
  },

  promos: {
    getActive: async (token: string, establishmentId: string): Promise<Promo | null> => {
      await initializeStorage();
      await delay(MOCK_DELAY);
      
      const promo = mockPromos.find(
        (p) => p.establishmentId === establishmentId && p.isActive && new Date(p.expiresAt) > new Date()
      );
      return promo || null;
    },

    create: async (
      token: string,
      establishmentId: string,
      data: { ticketCost: number; ticketsRequired: number; rewardValue: number }
    ): Promise<Promo> => {
      await initializeStorage();
      await delay(MOCK_DELAY);

      mockPromos.forEach((p) => {
        if (p.establishmentId === establishmentId) {
          p.isActive = false;
        }
      });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 15);

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 15);

      const newPromo: Promo = {
        id: `${mockPromos.length + 1}`,
        establishmentId,
        ...data,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        expiresAt: expiresAt.toISOString(),
        createdAt: new Date().toISOString(),
        isActive: true,
      };

      mockPromos.push(newPromo);
      await saveToStorage(STORAGE_KEYS.PROMOS, mockPromos);
      return newPromo;
    },

    list: async (token: string, establishmentId: string): Promise<Promo[]> => {
      await initializeStorage();
      await delay(MOCK_DELAY);
      return mockPromos.filter((p) => p.establishmentId === establishmentId);
    },
  },

  validations: {
    listUser: async (
      token: string,
      userId: string,
      establishmentId?: string
    ): Promise<DrinkValidation[]> => {
      await initializeStorage();
      await delay(MOCK_DELAY);
      
      let validations = mockDrinkValidations.filter((v) => v.userId === userId);
      if (establishmentId) {
        validations = validations.filter((v) => v.establishmentId === establishmentId);
      }
      return validations.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    },

    listEstablishment: async (
      token: string,
      establishmentId: string
    ): Promise<DrinkValidation[]> => {
      await initializeStorage();
      await delay(MOCK_DELAY);
      
      const validations = mockDrinkValidations
        .filter((v) => v.establishmentId === establishmentId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      return validations.map((v) => {
        const user = mockUsers.find((u) => u.id === v.userId);
        return {
          ...v,
          username: user?.username || 'Unknown',
        };
      });
    },
  },

  users: {
    list: async (token: string, role?: string): Promise<User[]> => {
      await initializeStorage();
      await delay(MOCK_DELAY);
      
      if (role) {
        return mockUsers.filter((u) => u.role === role);
      }
      return [...mockUsers];
    },

    search: async (token: string, query: string): Promise<User[]> => {
      await initializeStorage();
      await delay(MOCK_DELAY);
      
      const lowerQuery = query.toLowerCase();
      return mockUsers.filter(
        (u) =>
          u.username.toLowerCase().includes(lowerQuery) ||
          (u.email && u.email.toLowerCase().includes(lowerQuery))
      );
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
      await initializeStorage();
      await delay(MOCK_DELAY);

      if (mockUsers.some((u) => u.username === data.username || (data.email && u.email === data.email))) {
        throw new Error('User already exists');
      }

      const newUser: User = {
        id: `${mockUsers.length + 1}`,
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        phone: data.phone,
        email: data.email,
        role: 'USER',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };

      mockUsers.push(newUser);
      mockPasswords.set(newUser.id, data.password);

      await saveToStorage(STORAGE_KEYS.USERS, mockUsers);
      await saveToStorage(STORAGE_KEYS.USERS + '_passwords', Object.fromEntries(mockPasswords));

      return newUser;
    },

    sendPasswordReset: async (token: string, userId: string): Promise<{ method: 'email' | 'phone' | 'sms' }> => {
      await initializeStorage();
      await delay(MOCK_DELAY);
      
      const user = mockUsers.find((u) => u.id === userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.email && user.phone) {
        return { method: 'email' };
      } else if (user.email) {
        return { method: 'email' };
      } else if (user.phone) {
        return { method: 'sms' };
      }

      throw new Error('User has no contact information');
    },

    // NUOVO: Gestione preferiti
    toggleFavorite: async (token: string, userId: string, establishmentId: string): Promise<{ isFavorite: boolean; favorites: string[] }> => {
      await initializeStorage();
      await delay(MOCK_DELAY);
      
      const user = mockUsers.find(u => u.id === userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (!user.favoriteEstablishments) {
        user.favoriteEstablishments = [];
      }

      const index = user.favoriteEstablishments.indexOf(establishmentId);
      let isFavorite: boolean;

      if (index > -1) {
        // Rimuovi dai preferiti
        user.favoriteEstablishments.splice(index, 1);
        isFavorite = false;
      } else {
        // Aggiungi ai preferiti
        user.favoriteEstablishments.push(establishmentId);
        isFavorite = true;
      }

      await saveToStorage(STORAGE_KEYS.USERS, mockUsers);

      return { 
        isFavorite, 
        favorites: user.favoriteEstablishments 
      };
    },

    getFavorites: async (token: string, userId: string): Promise<string[]> => {
      await initializeStorage();
      await delay(MOCK_DELAY);
      
      const user = mockUsers.find(u => u.id === userId);
      if (!user) {
        throw new Error('User not found');
      }

      return user.favoriteEstablishments || [];
    },
  },

  leaderboard: {
    getMonthly: async (
      token: string,
      establishmentId: string
    ): Promise<LeaderboardEntry[]> => {
      await initializeStorage();
      await delay(MOCK_DELAY);
      
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const monthValidations = mockDrinkValidations.filter(
        (v) =>
          v.establishmentId === establishmentId &&
          v.status === 'SUCCESS' &&
          new Date(v.timestamp) >= monthStart
      );

      const userCounts = new Map<string, { username: string; count: number }>();
      
      monthValidations.forEach((v) => {
        const user = mockUsers.find((u) => u.id === v.userId);
        if (user) {
          const current = userCounts.get(v.userId) || { username: user.username, count: 0 };
          current.count += 1;
          userCounts.set(v.userId, current);
        }
      });

      const entries: LeaderboardEntry[] = Array.from(userCounts.entries())
        .map(([userId, data]) => {
          const user = mockUsers.find((u) => u.id === userId);
          return {
            userId,
            username: data.username,
            profilePicture: user?.profilePicture,
            drinksCount: data.count,
            rank: 0,
          };
        })
        .sort((a, b) => b.drinksCount - a.drinksCount)
        .slice(0, 3);

      entries.forEach((entry, index) => {
        entry.rank = index + 1;
      });

      return entries;
    },
  },

  social: {
    setPosts: async (token: string, establishmentId: string): Promise<Post[]> => {
      await initializeStorage();
      await delay(MOCK_DELAY);
      
      const now = new Date();
      mockPosts.forEach(p => {
        if (p.scheduledAt && !p.published && new Date(p.scheduledAt) <= now) {
          p.published = true;
          p.createdAt = p.scheduledAt;
        }
      });
      await saveToStorage(STORAGE_KEYS.POSTS, mockPosts);
      const posts = mockPosts
        .filter(p => p.establishmentId === establishmentId && (p.published !== false))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return posts;
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
      await initializeStorage();
      await delay(MOCK_DELAY);

      const moderated = moderateContent(content);
      if (!moderated.isClean) {
        throw new Error('Content contains inappropriate language');
      }

      const nowIso = new Date().toISOString();
      const newPost: Post = {
        id: `post_${Date.now()}`,
        establishmentId,
        authorId: userId,
        content: moderated.filteredText,
        images: images || [],
        videoUrl: videoUrl ?? null,
        likes: [],
        commentCount: 0,
        createdAt: nowIso,
        scheduledAt,
        published: scheduledAt ? new Date(scheduledAt) <= new Date() : true,
      };

      mockPosts.push(newPost);
      await saveToStorage(STORAGE_KEYS.POSTS, mockPosts);
      return newPost;
    },

    likePost: async (token: string, postId: string, userId: string): Promise<Post> => {
      await initializeStorage();
      await delay(MOCK_DELAY);

      const post = mockPosts.find(p => p.id === postId);
      if (!post) throw new Error('Post not found');

      const likeIndex = post.likes.indexOf(userId);
      if (likeIndex > -1) {
        post.likes.splice(likeIndex, 1);
      } else {
        post.likes.push(userId);
      }

      await saveToStorage(STORAGE_KEYS.POSTS, mockPosts);
      return post;
    },

    getStories: async (token: string, establishmentId: string): Promise<Story[]> => {
      await initializeStorage();
      await delay(MOCK_DELAY);
      
      const now = new Date();
      mockStories.forEach(s => {
        if (s.scheduledAt && !s.published && new Date(s.scheduledAt) <= now) {
          s.published = true;
          s.createdAt = s.scheduledAt;
        }
      });
      const validStories = mockStories.filter(
        s => s.establishmentId === establishmentId && (s.published !== false) && new Date(s.expiresAt) > now
      );
      
      mockStories = mockStories.filter(s => new Date(s.expiresAt) > now);
      await saveToStorage(STORAGE_KEYS.STORIES, mockStories);
      
      return validStories.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
      await initializeStorage();
      await delay(MOCK_DELAY);

      const moderated = moderateContent(content);
      if (!moderated.isClean) {
        throw new Error('Content contains inappropriate language');
      }

      const base = new Date();
      const publishTime = scheduledAt ? new Date(scheduledAt) : base;
      const expiresAt = new Date(publishTime);
      expiresAt.setHours(expiresAt.getHours() + 24);

      const newStory: Story = {
        id: `story_${Date.now()}`,
        establishmentId,
        authorId: userId,
        content: moderated.filteredText,
        image,
        videoUrl: videoUrl ?? null,
        expiresAt: expiresAt.toISOString(),
        views: [],
        createdAt: base.toISOString(),
        scheduledAt,
        published: scheduledAt ? new Date(scheduledAt) <= new Date() : true,
      };

      mockStories.push(newStory);
      await saveToStorage(STORAGE_KEYS.STORIES, mockStories);
      return newStory;
    },

    viewStory: async (token: string, storyId: string, userId: string): Promise<Story> => {
      await initializeStorage();
      await delay(MOCK_DELAY);

      const story = mockStories.find(s => s.id === storyId);
      if (!story) throw new Error('Story not found');

      if (!story.views.includes(userId)) {
        story.views.push(userId);
        await saveToStorage(STORAGE_KEYS.STORIES, mockStories);
      }

      return story;
    },

    getComments: async (token: string, postId?: string, storyId?: string): Promise<Comment[]> => {
      await initializeStorage();
      await delay(MOCK_DELAY);
      
      let comments = mockComments;
      if (postId) {
        comments = comments.filter(c => c.postId === postId);
      } else if (storyId) {
        comments = comments.filter(c => c.storyId === storyId);
      }
      
      return comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    },

    createComment: async (
      token: string,
      userId: string,
      content: string,
      postId?: string,
      storyId?: string
    ): Promise<Comment> => {
      await initializeStorage();
      await delay(MOCK_DELAY);

      const moderated = moderateContent(content);
      if (!moderated.isClean) {
        throw new Error('Content contains inappropriate language');
      }

      const user = mockUsers.find(u => u.id === userId);
      if (!user) throw new Error('User not found');

      const newComment: Comment = {
        id: `comment_${Date.now()}`,
        postId,
        storyId,
        authorId: userId,
        authorName: user.username,
        content: moderated.filteredText,
        createdAt: new Date().toISOString(),
      };

      mockComments.push(newComment);
      await saveToStorage(STORAGE_KEYS.COMMENTS, mockComments);

      if (postId) {
        const post = mockPosts.find(p => p.id === postId);
        if (post) {
          post.commentCount += 1;
          await saveToStorage(STORAGE_KEYS.POSTS, mockPosts);
        }
      }

      return newComment;
    },

    getChatMessages: async (token: string, establishmentId: string, userId?: string): Promise<ChatMessage[]> => {
      await initializeStorage();
      await delay(MOCK_DELAY);
      
      let messages = mockChatMessages.filter(m => m.establishmentId === establishmentId).map(m => ({...m, content: dec(m.content, getEstKey(establishmentId))}));
      if (userId) {
        messages = messages.filter(m => m.senderId === userId || mockUsers.find(u => u.id === m.senderId)?.establishmentId === establishmentId);
      }
      
      return messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    },

    sendChatMessage: async (
      token: string,
      establishmentId: string,
      userId: string,
      content: string
    ): Promise<ChatMessage> => {
      await initializeStorage();
      await delay(MOCK_DELAY);

      const moderated = moderateContent(content);
      if (!moderated.isClean) {
        throw new Error('Content contains inappropriate language');
      }

      const user = mockUsers.find(u => u.id === userId);
      if (!user) throw new Error('User not found');

      const newMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        establishmentId,
        senderId: userId,
        senderName: user.username,
        senderRole: user.role,
        content: enc(moderated.filteredText, getEstKey(establishmentId)),
        createdAt: new Date().toISOString(),
      };

      mockChatMessages.push(newMessage);
      await saveToStorage(STORAGE_KEYS.CHAT_MESSAGES, mockChatMessages);
      return newMessage;
    },

    getReviews: async (token: string, establishmentId: string): Promise<Review[]> => {
      await initializeStorage();
      await delay(MOCK_DELAY);
      
      return mockReviews
        .filter(r => r.establishmentId === establishmentId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },

    createReview: async (
      token: string,
      establishmentId: string,
      userId: string,
      rating: number,
      comment: string,
      photos?: string[]
    ): Promise<Review> => {
      await initializeStorage();
      await delay(MOCK_DELAY);

      const moderated = moderateContent(comment);
      if (!moderated.isClean) {
        throw new Error('Content contains inappropriate language');
      }

      const user = mockUsers.find(u => u.id === userId);
      if (!user) throw new Error('User not found');

      const newReview: Review = {
        id: `review_${Date.now()}`,
        establishmentId,
        userId,
        username: user.username,
        rating,
        comment: moderated.filteredText,
        photos: photos || [],
        createdAt: new Date().toISOString(),
      };

      mockReviews.push(newReview);
      await saveToStorage(STORAGE_KEYS.REVIEWS, mockReviews);
      return newReview;
    },

    getStats: async (token: string, establishmentId: string): Promise<SocialStats> => {
      await initializeStorage();
      await delay(MOCK_DELAY);
      
      const posts = mockPosts.filter(p => p.establishmentId === establishmentId);
      const now = new Date();
      const stories = mockStories.filter(s => s.establishmentId === establishmentId && new Date(s.expiresAt) > now);
      const reviews = mockReviews.filter(r => r.establishmentId === establishmentId);
      
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
      
      return {
        postsCount: posts.length,
        storiesCount: stories.length,
        followersCount: 0,
        averageRating: Math.round(averageRating * 10) / 10,
        reviewCount: reviews.length,
      };
    },

    setSocialManager: async (
      token: string,
      establishmentId: string,
      userId: string,
      isSocialManager: boolean
    ): Promise<void> => {
      await initializeStorage();
      await delay(MOCK_DELAY);
      
      const user = mockUsers.find(u => u.id === userId);
      if (!user || user.establishmentId !== establishmentId) {
        throw new Error('User not found or not in establishment');
      }
      
      user.isSocialManager = isSocialManager;
      await saveToStorage(STORAGE_KEYS.USERS, mockUsers);
    },

    toggleSocialPostPermission: async (
      token: string,
      establishmentId: string,
      merchantId: string,
      callerId: string // ID del SENIOR_MERCHANT che chiama
    ): Promise<{ canPostSocial: boolean }> => {
      await initializeStorage();
      await delay(MOCK_DELAY);
      
      // Solo SENIOR_MERCHANT può chiamare questa API
      const caller = mockUsers.find(u => u.id === callerId);
      if (caller?.role !== 'SENIOR_MERCHANT') {
        throw new Error('Only SENIOR_MERCHANT can manage social permissions');
      }
      
      const merchant = mockUsers.find(u => u.id === merchantId);
      if (!merchant || merchant.establishmentId !== establishmentId) {
        throw new Error('Merchant not found or not in establishment');
      }
      
      if (merchant.role !== 'MERCHANT') {
        throw new Error('Can only toggle permission for MERCHANT role');
      }
      
      merchant.canPostSocial = !merchant.canPostSocial;
      await saveToStorage(STORAGE_KEYS.USERS, mockUsers);
      
      return { canPostSocial: merchant.canPostSocial || false };
    },
  },

  schedule: {
    get: async (token: string, establishmentId: string): Promise<WeeklySchedule | null> => {
      await initializeStorage();
      await delay(MOCK_DELAY);
      
      const establishment = mockEstablishments.find(e => e.id === establishmentId);
      return establishment?.schedule || null;
    },

    update: async (
      token: string,
      establishmentId: string,
      schedule: WeeklySchedule,
      isRecurring: boolean
    ): Promise<void> => {
      await initializeStorage();
      await delay(MOCK_DELAY);
      
      const establishment = mockEstablishments.find(e => e.id === establishmentId);
      if (!establishment) throw new Error('Establishment not found');
      
      establishment.schedule = schedule;
      establishment.isRecurring = isRecurring;
      await saveToStorage(STORAGE_KEYS.ESTABLISHMENTS, mockEstablishments);
    },

    setOpenStatus: async (
      token: string,
      establishmentId: string,
      isOpen: boolean
    ): Promise<void> => {
      await initializeStorage();
      await delay(MOCK_DELAY);
      
      const establishment = mockEstablishments.find(e => e.id === establishmentId);
      if (!establishment) throw new Error('Establishment not found');
      
      establishment.isOpen = isOpen;
      await saveToStorage(STORAGE_KEYS.ESTABLISHMENTS, mockEstablishments);
    },

    addClosurePeriod: async (
      token: string,
      establishmentId: string,
      startDate: string,
      endDate: string,
      reason?: string
    ): Promise<ClosurePeriod> => {
      await initializeStorage();
      await delay(MOCK_DELAY);
      
      const establishment = mockEstablishments.find(e => e.id === establishmentId);
      if (!establishment) throw new Error('Establishment not found');
      
      const newPeriod: ClosurePeriod = {
        id: `closure_${Date.now()}`,
        startDate,
        endDate,
        reason,
      };
      
      if (!establishment.closurePeriods) {
        establishment.closurePeriods = [];
      }
      establishment.closurePeriods.push(newPeriod);
      await saveToStorage(STORAGE_KEYS.ESTABLISHMENTS, mockEstablishments);
      return newPeriod;
    },

    removeClosurePeriod: async (
      token: string,
      establishmentId: string,
      closureId: string
    ): Promise<void> => {
      await initializeStorage();
      await delay(MOCK_DELAY);
      
      const establishment = mockEstablishments.find(e => e.id === establishmentId);
      if (!establishment) throw new Error('Establishment not found');
      
      if (establishment.closurePeriods) {
        establishment.closurePeriods = establishment.closurePeriods.filter(p => p.id !== closureId);
        await saveToStorage(STORAGE_KEYS.ESTABLISHMENTS, mockEstablishments);
      }
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
      await initializeStorage();
      await delay(MOCK_DELAY);

      const user = mockUsers.find(u => u.id === data.userId);
      if (!user) throw new Error('User not found');

      const newReport: BugReport = {
        id: `bug_${Date.now()}`,
        userId: data.userId,
        username: user.username,
        userRole: user.role,
        title: data.title,
        description: data.description,
        category: data.category,
        severity: data.severity,
        status: 'OPEN',
        deviceInfo: data.deviceInfo,
        appVersion: data.appVersion || '1.0.0',
        screenshots: data.screenshots || [],
        createdAt: new Date().toISOString(),
      };

      mockBugReports.push(newReport);
      await saveToStorage(STORAGE_KEYS.BUG_REPORTS, mockBugReports);
      return newReport;
    },

    list: async (token: string, filters?: { status?: BugReport['status']; userId?: string }): Promise<BugReport[]> => {
      await initializeStorage();
      await delay(MOCK_DELAY);

      let reports = [...mockBugReports];

      if (filters?.status) {
        reports = reports.filter(r => r.status === filters.status);
      }

      if (filters?.userId) {
        reports = reports.filter(r => r.userId === filters.userId);
      }

      return reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },

    updateStatus: async (
      token: string,
      reportId: string,
      status: BugReport['status'],
      adminNotes?: string
    ): Promise<BugReport> => {
      await initializeStorage();
      await delay(MOCK_DELAY);

      const report = mockBugReports.find(r => r.id === reportId);
      if (!report) throw new Error('Bug report not found');

      report.status = status;
      if (adminNotes) {
        report.adminNotes = adminNotes;
      }
      if (status === 'RESOLVED' || status === 'CLOSED') {
        report.resolvedAt = new Date().toISOString();
        // In produzione, qui ci sarebbe l'ID dell'admin che ha risolto
        report.resolvedBy = 'admin';
      }

      await saveToStorage(STORAGE_KEYS.BUG_REPORTS, mockBugReports);
      return report;
    },

    delete: async (token: string, reportId: string): Promise<void> => {
      await initializeStorage();
      await delay(MOCK_DELAY);

      const index = mockBugReports.findIndex(r => r.id === reportId);
      if (index === -1) throw new Error('Bug report not found');

      mockBugReports.splice(index, 1);
      await saveToStorage(STORAGE_KEYS.BUG_REPORTS, mockBugReports);
    },
  },

  // ===========================
  // INVENTORY MANAGEMENT (AI)
  // ===========================

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
      await initializeStorage();
      await delay(MOCK_DELAY);

      let articles = mockArticles.filter((a: Article) => a.establishmentId === establishmentId);

      if (filters?.category) {
        articles = articles.filter((a: Article) => a.category === filters.category);
      }

      if (filters?.search) {
        const search = filters.search.toLowerCase();
        articles = articles.filter((a: Article) =>
          a.name.toLowerCase().includes(search) ||
          (a.brand?.toLowerCase().includes(search)) ||
          (a.barcode?.includes(search))
        );
      }

      if (filters?.lowStock) {
        articles = articles.filter((a: Article) => a.currentStock <= a.minStock);
      }

      return articles;
    },

    getById: async (token: string, articleId: string): Promise<Article> => {
      await initializeStorage();
      await delay(MOCK_DELAY);

      const article = mockArticles.find((a: Article) => a.id === articleId);
      if (!article) throw new Error('Article not found');

      return article;
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
      await initializeStorage();
      await delay(MOCK_DELAY);

      const newArticle: Article = {
        id: `article_${Date.now()}`,
        ...data,
        currentStock: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockArticles.push(newArticle);
      await saveToStorage(STORAGE_KEYS.ARTICLES, mockArticles);

      return newArticle;
    },

    update: async (
      token: string,
      articleId: string,
      data: Partial<Omit<Article, 'id' | 'establishmentId' | 'createdAt' | 'updatedAt'>>
    ): Promise<Article> => {
      await initializeStorage();
      await delay(MOCK_DELAY);

      const article = mockArticles.find((a: Article) => a.id === articleId);
      if (!article) throw new Error('Article not found');

      Object.assign(article, { ...data, updatedAt: new Date().toISOString() });
      await saveToStorage(STORAGE_KEYS.ARTICLES, mockArticles);

      return article;
    },

    delete: async (token: string, articleId: string): Promise<void> => {
      await initializeStorage();
      await delay(MOCK_DELAY);

      const index = mockArticles.findIndex((a: Article) => a.id === articleId);
      if (index === -1) throw new Error('Article not found');

      mockArticles.splice(index, 1);
      await saveToStorage(STORAGE_KEYS.ARTICLES, mockArticles);
    },
  },

  stock: {
    getStock: async (
      token: string,
      establishmentId: string,
      articleId?: string
    ): Promise<StockEntry[]> => {
      await initializeStorage();
      await delay(MOCK_DELAY);

      let entries = mockStockEntries.filter((e: StockEntry) => {
        const article = mockArticles.find((a: Article) => a.id === e.articleId);
        return article?.establishmentId === establishmentId;
      });

      if (articleId) {
        entries = entries.filter((e: StockEntry) => e.articleId === articleId);
      }

      return entries.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },

    updateStock: async (
      token: string,
      articleId: string,
      quantity: number,
      type: 'LOAD' | 'UNLOAD',
      userId: string
    ): Promise<StockEntry> => {
      await initializeStorage();
      await delay(MOCK_DELAY);

      const article = mockArticles.find((a: Article) => a.id === articleId);
      if (!article) throw new Error('Article not found');

      const newEntry: StockEntry = {
        id: `entry_${Date.now()}`,
        establishmentId: article.establishmentId,
        articleId,
        userId,
        quantity,
        type,
        stockPhotoId: undefined,
        createdAt: new Date().toISOString(),
      };

      // Update current stock
      if (type === 'LOAD') {
        article.currentStock += quantity;
      } else {
        article.currentStock -= quantity;
      }
      article.updatedAt = new Date().toISOString();

      mockStockEntries.push(newEntry);
      await saveToStorage(STORAGE_KEYS.STOCK_ENTRIES, mockStockEntries);
      await saveToStorage(STORAGE_KEYS.ARTICLES, mockArticles);

      return newEntry;
    },

    setStock: async (
      token: string,
      articleId: string,
      quantity: number,
      userId: string
    ): Promise<StockEntry> => {
      await initializeStorage();
      await delay(MOCK_DELAY);

      const article = mockArticles.find((a: Article) => a.id === articleId);
      if (!article) throw new Error('Article not found');

      const difference = quantity - article.currentStock;
      const type: 'LOAD' | 'UNLOAD' = difference >= 0 ? 'LOAD' : 'UNLOAD';

      const newEntry: StockEntry = {
        id: `entry_${Date.now()}`,
        establishmentId: article.establishmentId,
        articleId,
        userId,
        quantity: Math.abs(difference),
        type,
        stockPhotoId: undefined,
        createdAt: new Date().toISOString(),
      };

      article.currentStock = quantity;
      article.updatedAt = new Date().toISOString();

      mockStockEntries.push(newEntry);
      await saveToStorage(STORAGE_KEYS.STOCK_ENTRIES, mockStockEntries);
      await saveToStorage(STORAGE_KEYS.ARTICLES, mockArticles);

      return newEntry;
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
      await initializeStorage();
      await delay(MOCK_DELAY);

      let entries = mockStockEntries.filter((e: StockEntry) => {
        const article = mockArticles.find((a: Article) => a.id === e.articleId);
        return article?.establishmentId === establishmentId;
      });

      if (filters?.articleId) {
        entries = entries.filter((e: StockEntry) => e.articleId === filters.articleId);
      }

      if (filters?.startDate) {
        entries = entries.filter((e: StockEntry) => e.createdAt >= filters.startDate!);
      }

      if (filters?.endDate) {
        entries = entries.filter((e: StockEntry) => e.createdAt <= filters.endDate!);
      }

      return entries.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },
  },

  stockPhotos: {
    upload: async (
      token: string,
      establishmentId: string,
      userId: string,
      photoUri: string
    ): Promise<StockPhoto> => {
      await initializeStorage();
      await delay(MOCK_DELAY * 2); // Simula upload più lungo

      const newPhoto: StockPhoto = {
        id: `photo_${Date.now()}`,
        establishmentId,
        userId,
        imageUrl: photoUri, // In produzione, qui ci sarebbe l'URL dopo upload su S3/Cloudinary
        status: 'PENDING',
        totalItemsDetected: 0,
        aiAnalysisData: null,
        recognitions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockStockPhotos.push(newPhoto);
      await saveToStorage(STORAGE_KEYS.STOCK_PHOTOS, mockStockPhotos);

      return newPhoto;
    },

    analyze: async (
      token: string,
      photoId: string
    ): Promise<StockPhoto> => {
      await initializeStorage();
      await delay(MOCK_DELAY * 3); // Simula analisi AI più lunga

      const photo = mockStockPhotos.find(p => p.id === photoId);
      if (!photo) throw new Error('Stock photo not found');

      // Simula riconoscimento AI con risultati mock
      const mockRecognitions: ArticleRecognition[] = [
        {
          id: `recog_${Date.now()}_1`,
          stockPhotoId: photoId,
          detectedName: 'Heineken',
          detectedBrand: 'Heineken',
          confidence: 0.95,
          quantity: 3,
          status: 'PENDING',
          boundingBox: { x: 10, y: 20, width: 100, height: 150 },
          articleId: mockArticles.find((a: Article) => a.brand === 'Heineken')?.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: `recog_${Date.now()}_2`,
          stockPhotoId: photoId,
          detectedName: 'Corona Extra',
          detectedBrand: 'Corona',
          confidence: 0.88,
          quantity: 2,
          status: 'PENDING',
          boundingBox: { x: 120, y: 25, width: 95, height: 145 },
          articleId: mockArticles.find((a: Article) => a.brand === 'Corona')?.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      photo.status = 'CONFIRMED'; // Use valid status
      photo.totalItemsDetected = mockRecognitions.reduce((sum, r) => sum + r.quantity, 0);
      photo.aiAnalysisData = {
        model: 'gpt-4-vision-preview',
        processingTime: 2.5,
        rawResponse: '{"detected_items": [...]}',
      };
      photo.recognitions = mockRecognitions;
      photo.updatedAt = new Date().toISOString();

      await saveToStorage(STORAGE_KEYS.STOCK_PHOTOS, mockStockPhotos);

      return photo;
    },

    getById: async (token: string, photoId: string): Promise<StockPhoto> => {
      await initializeStorage();
      await delay(MOCK_DELAY);

      const photo = mockStockPhotos.find(p => p.id === photoId);
      if (!photo) throw new Error('Stock photo not found');

      return photo;
    },

    confirmRecognition: async (
      token: string,
      recognitionId: string,
      data: {
        articleId: string;
        quantity: number;
      }
    ): Promise<ArticleRecognition> => {
      await initializeStorage();
      await delay(MOCK_DELAY);

      const photo = mockStockPhotos.find((p: StockPhoto) => 
        p.recognitions?.some((r: ArticleRecognition) => r.id === recognitionId)
      );
      if (!photo) throw new Error('Recognition not found');

      const recognition = photo.recognitions!.find((r: ArticleRecognition) => r.id === recognitionId)!;
      
      recognition.status = 'CONFIRMED';
      recognition.articleId = data.articleId;
      recognition.quantity = data.quantity;
      recognition.updatedAt = new Date().toISOString();

      await saveToStorage(STORAGE_KEYS.STOCK_PHOTOS, mockStockPhotos);

      return recognition;
    },

    confirmAllAndUpdate: async (
      token: string,
      photoId: string,
      userId: string
    ): Promise<StockEntry[]> => {
      await initializeStorage();
      await delay(MOCK_DELAY);

      const photo = mockStockPhotos.find((p: StockPhoto) => p.id === photoId);
      if (!photo) throw new Error('Stock photo not found');

      const confirmedRecognitions = photo.recognitions?.filter((r: ArticleRecognition) => r.status === 'CONFIRMED') || [];
      const newEntries: StockEntry[] = [];

      // Crea stock entries per ogni riconoscimento confermato
      for (const recognition of confirmedRecognitions) {
        if (!recognition.articleId) continue;

        const article = mockArticles.find((a: Article) => a.id === recognition.articleId);
        if (!article) continue;

        const newEntry: StockEntry = {
          id: `entry_${Date.now()}_${recognition.id}`,
          establishmentId: article.establishmentId,
          articleId: recognition.articleId,
          userId,
          quantity: recognition.quantity,
          type: 'LOAD',
          stockPhotoId: photoId,
          createdAt: new Date().toISOString(),
        };

        article.currentStock += recognition.quantity;
        article.updatedAt = new Date().toISOString();

        newEntries.push(newEntry);
        mockStockEntries.push(newEntry);
      }

      photo.status = 'MODIFIED'; // Use valid status
      photo.updatedAt = new Date().toISOString();

      await saveToStorage(STORAGE_KEYS.STOCK_ENTRIES, mockStockEntries);
      await saveToStorage(STORAGE_KEYS.ARTICLES, mockArticles);
      await saveToStorage(STORAGE_KEYS.STOCK_PHOTOS, mockStockPhotos);

      return newEntries;
    },
  },
};

// ============================================
// EXPORT API (Switch automatico MOCK/HTTP)
// ============================================

/**
 * API principale dell'app
 * 
 * Switcha automaticamente tra:
 * - mockApi (dati locali) quando USE_MOCK_API = true
 * - httpApi (server reale) quando USE_MOCK_API = false
 * 
 * Configurazione in: services/api-config.ts
 */
export const api = USE_MOCK_API ? mockApi : httpApi;

// Export anche mockApi per testing/sviluppo
export { mockApi };
