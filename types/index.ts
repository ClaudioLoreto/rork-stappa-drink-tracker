export type UserRole = 'ROOT' | 'MERCHANT' | 'USER';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  status: 'ACTIVE' | 'INACTIVE';
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
  city: string;
  postalCode: string;
  country: string;
  vatId: string;
  phone: string;
  description?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}
