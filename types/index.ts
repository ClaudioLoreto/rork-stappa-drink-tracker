export type UserRole = 'ROOT' | 'SENIOR_MERCHANT' | 'MERCHANT' | 'USER';

export interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  username: string;
  phone?: string;
  email?: string;
  profilePicture?: string;
  role: UserRole;
  status: 'ACTIVE' | 'INACTIVE';
  establishmentId?: string;
  createdAt: string;
}

export interface Establishment {
  id: string;
  name: string;
  address: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface UserProgress {
  id: string;
  userId: string;
  establishmentId: string;
  drinksCount: number;
  updatedAt: string;
}

export interface QRCodeData {
  token: string;
  userId: string;
  establishmentId: string;
  type: 'VALIDATION' | 'BONUS';
  expiresAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface MerchantRequest {
  id: string;
  userId: string;
  businessName: string;
  businessAddress: string;
  phone: string;
  description?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface DrinkValidation {
  id: string;
  userId: string;
  establishmentId: string;
  type: 'VALIDATION' | 'BONUS';
  status: 'SUCCESS' | 'FAILED';
  timestamp: string;
  establishmentName: string;
}

export interface Promo {
  id: string;
  establishmentId: string;
  ticketCost: number;
  ticketsRequired: number;
  rewardValue: number;
  expiresAt: string;
  createdAt: string;
  isActive: boolean;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  profilePicture?: string;
  drinksCount: number;
  rank: number;
}

export type Language = 'it' | 'en';
