import { User, AuthResponse, Establishment, UserProgress, QRCodeData, MerchantRequest, DrinkValidation, Promo, LeaderboardEntry } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MOCK_DELAY = 800;

const STORAGE_KEYS = {
  USERS: '@stappa/users',
  ESTABLISHMENTS: '@stappa/establishments',
  PROGRESS: '@stappa/progress',
  QR_CODES: '@stappa/qr_codes',
  MERCHANT_REQUESTS: '@stappa/merchant_requests',
  DRINK_VALIDATIONS: '@stappa/drink_validations',
  PROMOS: '@stappa/promos',
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
let mockPasswords: Map<string, string> = new Map();

let initialized = false;

async function initializeStorage() {
  if (initialized) return;
  
  mockUsers = await loadFromStorage(STORAGE_KEYS.USERS, [
    {
      id: '1',
      username: 'root',
      email: 'root@stappa.com',
      role: 'ROOT' as const,
      status: 'ACTIVE' as const,
      createdAt: new Date().toISOString(),
    },
  ]);
  
  const storedPasswords = await loadFromStorage<Record<string, string>>(STORAGE_KEYS.USERS + '_passwords', {});
  mockPasswords = new Map(Object.entries(storedPasswords));
  if (!mockPasswords.has('1')) {
    mockPasswords.set('1', 'Root4321@');
  }
  
  mockEstablishments = await loadFromStorage(STORAGE_KEYS.ESTABLISHMENTS, []);
  mockProgress = await loadFromStorage(STORAGE_KEYS.PROGRESS, []);
  mockMerchantRequests = await loadFromStorage(STORAGE_KEYS.MERCHANT_REQUESTS, []);
  mockDrinkValidations = await loadFromStorage(STORAGE_KEYS.DRINK_VALIDATIONS, []);
  mockPromos = await loadFromStorage(STORAGE_KEYS.PROMOS, []);
  
  initialized = true;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const api = {
  auth: {
    login: async (username: string, password: string): Promise<AuthResponse> => {
      await initializeStorage();
      await delay(MOCK_DELAY);
      
      const user = mockUsers.find((u) => u.username === username);
      
      if (!user) {
        throw new Error('Invalid username or password');
      }
      
      const storedPassword = mockPasswords.get(user.id);
      if (!storedPassword || storedPassword !== password) {
        throw new Error('Invalid username or password');
      }
      
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
      
      await saveToStorage(STORAGE_KEYS.USERS, mockUsers);
      await saveToStorage(STORAGE_KEYS.USERS + '_passwords', Object.fromEntries(mockPasswords));
      
      const token = `mock_token_${Date.now()}`;
      return { token, user: newUser };
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

      const newPromo: Promo = {
        id: `${mockPromos.length + 1}`,
        establishmentId,
        ...data,
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
};
