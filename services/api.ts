import { User, AuthResponse, Establishment, UserProgress, QRCodeData, MerchantRequest } from '@/types';

const MOCK_DELAY = 800;

const mockUsers: User[] = [
  {
    id: '1',
    username: 'root',
    email: 'root@stappa.com',
    role: 'ROOT',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  },
];

const mockEstablishments: Establishment[] = [];
const mockProgress: UserProgress[] = [];
const mockQRCodes: Map<string, QRCodeData> = new Map();
const mockMerchantRequests: MerchantRequest[] = [];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const api = {
  auth: {
    login: async (username: string, password: string): Promise<AuthResponse> => {
      await delay(MOCK_DELAY);
      
      const user = mockUsers.find((u) => u.username === username);
      
      if (username === 'root' && password === 'Root1234@') {
        const token = `mock_token_${Date.now()}`;
        return { token, user: mockUsers[0] };
      }
      
      if (!user || password !== 'Root1234@') {
        throw new Error('Invalid credentials');
      }
      
      const token = `mock_token_${Date.now()}`;
      return { token, user };
    },

    register: async (
      username: string,
      email: string,
      password: string
    ): Promise<AuthResponse> => {
      await delay(MOCK_DELAY);
      
      if (mockUsers.some((u) => u.username === username || u.email === email)) {
        throw new Error('User already exists');
      }

      const newUser: User = {
        id: `${mockUsers.length + 1}`,
        username,
        email,
        role: 'USER',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };

      mockUsers.push(newUser);
      const token = `mock_token_${Date.now()}`;
      return { token, user: newUser };
    },
  },

  establishments: {
    create: async (
      name: string,
      address: string,
      token: string
    ): Promise<Establishment> => {
      await delay(MOCK_DELAY);
      
      const newEstablishment: Establishment = {
        id: `${mockEstablishments.length + 1}`,
        name,
        address,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };

      mockEstablishments.push(newEstablishment);
      return newEstablishment;
    },

    list: async (token: string): Promise<Establishment[]> => {
      await delay(MOCK_DELAY);
      return [...mockEstablishments];
    },

    assignMerchant: async (
      establishmentId: string,
      userId: string,
      token: string
    ): Promise<void> => {
      await delay(MOCK_DELAY);
      
      const user = mockUsers.find((u) => u.id === userId);
      if (user) {
        user.role = 'MERCHANT';
      }
    },
  },

  users: {
    list: async (token: string, role?: string): Promise<User[]> => {
      await delay(MOCK_DELAY);
      
      if (role) {
        return mockUsers.filter((u) => u.role === role);
      }
      return [...mockUsers];
    },

    search: async (token: string, query: string): Promise<User[]> => {
      await delay(MOCK_DELAY);
      
      const lowerQuery = query.toLowerCase();
      return mockUsers.filter(
        (u) =>
          u.username.toLowerCase().includes(lowerQuery) ||
          u.email.toLowerCase().includes(lowerQuery)
      );
    },
  },

  progress: {
    get: async (token: string, userId: string): Promise<UserProgress | null> => {
      await delay(MOCK_DELAY);
      
      const progress = mockProgress.find((p) => p.userId === userId);
      return progress || null;
    },

    increment: async (
      token: string,
      userId: string,
      establishmentId: string
    ): Promise<UserProgress> => {
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

      return progress;
    },

    reset: async (
      token: string,
      userId: string,
      establishmentId: string
    ): Promise<UserProgress> => {
      await delay(MOCK_DELAY);
      
      const progress = mockProgress.find(
        (p) => p.userId === userId && p.establishmentId === establishmentId
      );

      if (progress) {
        progress.drinksCount = 0;
        progress.updatedAt = new Date().toISOString();
      }

      return progress!;
    },
  },

  qr: {
    generate: async (
      token: string,
      userId: string,
      type: 'VALIDATION' | 'BONUS'
    ): Promise<QRCodeData> => {
      await delay(MOCK_DELAY);
      
      const qrToken = `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

      const qrData: QRCodeData = {
        token: qrToken,
        userId,
        establishmentId: '1',
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
      await delay(MOCK_DELAY);
      
      const qrData = mockQRCodes.get(qrToken);

      if (!qrData) {
        return { success: false, message: 'Invalid or expired QR code' };
      }

      if (new Date(qrData.expiresAt) < new Date()) {
        mockQRCodes.delete(qrToken);
        return { success: false, message: 'QR code has expired' };
      }

      mockQRCodes.delete(qrToken);

      if (qrData.type === 'VALIDATION') {
        const progress = await api.progress.increment(
          token,
          qrData.userId,
          qrData.establishmentId
        );
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
        city: string;
        postalCode: string;
        country: string;
        vatId: string;
        phone: string;
        description?: string;
      }
    ): Promise<MerchantRequest> => {
      await delay(MOCK_DELAY);

      const newRequest: MerchantRequest = {
        id: `${mockMerchantRequests.length + 1}`,
        userId,
        ...data,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      };

      mockMerchantRequests.push(newRequest);
      return newRequest;
    },

    list: async (token: string, status?: string): Promise<MerchantRequest[]> => {
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
          address: `${request.businessAddress}, ${request.city}, ${request.postalCode}, ${request.country}`,
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
        };
        mockEstablishments.push(establishment);
      }

      const user = mockUsers.find((u) => u.id === request.userId);
      if (user) {
        user.role = 'MERCHANT';
      }

      return { request, establishment };
    },

    reject: async (
      token: string,
      requestId: string,
      adminId: string,
      reason?: string
    ): Promise<MerchantRequest> => {
      await delay(MOCK_DELAY);

      const request = mockMerchantRequests.find((r) => r.id === requestId);
      if (!request) {
        throw new Error('Request not found');
      }

      request.status = 'REJECTED';
      request.reviewedAt = new Date().toISOString();
      request.reviewedBy = adminId;
      request.rejectionReason = reason;

      return request;
    },
  },
};
