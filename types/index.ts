export type UserRole = 'ROOT' | 'SENIOR_MERCHANT' | 'MERCHANT' | 'USER';

export interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  username: string;
  phone?: string;
  email?: string;
  profilePicture?: string;
  city?: string;
  province?: string;
  region?: string;
  favoriteEstablishments?: string[]; // NUOVO: Array di ID bar preferiti
  role: UserRole;
  status: 'ACTIVE' | 'INACTIVE';
  establishmentId?: string;
  isSocialManager?: boolean;
  canPostSocial?: boolean; // Solo MERCHANT: permesso di pubblicare post social (default false, abilitato da SENIOR_MERCHANT)
  createdAt: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  verificationCode?: string;
  verificationCodeExpiry?: string;
}

export interface TimeSlot {
  from: string;
  to: string;
}

export interface DaySchedule {
  isOpen: boolean;
  slots: TimeSlot[];
}

export interface WeeklySchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface ClosurePeriod {
  id: string;
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface Establishment {
  id: string;
  name: string;
  address: string;
  city?: string;
  province?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  status: 'ACTIVE' | 'INACTIVE';
  isOpen?: boolean;
  schedule?: WeeklySchedule;
  isRecurring?: boolean;
  closurePeriods?: ClosurePeriod[];
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
  username?: string;
}

export interface BugReport {
  id: string;
  userId: string;
  username: string;
  userRole: UserRole;
  title: string;
  description: string;
  category: 'UI' | 'FUNCTIONALITY' | 'PERFORMANCE' | 'CRASH' | 'OTHER';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  deviceInfo?: string;
  appVersion?: string;
  screenshots?: string[];
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  adminNotes?: string;
}

export interface Promo {
  id: string;
  establishmentId: string;
  ticketCost: number;
  ticketsRequired: number;
  rewardValue: number;
  description?: string;
  startDate: string;
  endDate: string;
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

export interface Post {
  id: string;
  establishmentId: string;
  authorId: string;
  content: string;
  images?: string[];
  videoUrl?: string | null;
  likes: string[];
  commentCount: number;
  createdAt: string;
  scheduledAt?: string;
  published?: boolean;
}

export interface Story {
  id: string;
  establishmentId: string;
  authorId: string;
  content: string;
  image?: string;
  videoUrl?: string | null;
  expiresAt: string;
  views: string[];
  createdAt: string;
  scheduledAt?: string;
  published?: boolean;
}

export interface Comment {
  id: string;
  postId?: string;
  storyId?: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  establishmentId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  createdAt: string;
}

export interface Review {
  id: string;
  establishmentId: string;
  userId: string;
  username: string;
  rating: number;
  comment: string;
  photos?: string[];
  createdAt: string;
}

export interface SocialStats {
  postsCount: number;
  storiesCount: number;
  followersCount: number;
  averageRating: number;
  reviewCount: number;
}
