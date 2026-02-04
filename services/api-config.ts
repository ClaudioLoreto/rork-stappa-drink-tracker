/**
 * API Configuration
 * 
 * IMPORTANTE: Prima di pubblicare l'app, imposta USE_MOCK_API = false
 * e configura API_BASE_URL con l'URL del server in produzione
 */

// ============================================
// CONFIGURAZIONE PRINCIPALE
// ============================================

/**
 * Usa API MOCK (dati locali) o API HTTP (server reale)?
 * 
 * - true  = Usa dati MOCK (per sviluppo locale)
 * - false = Usa server HTTP reale (per produzione)
 */
export const USE_MOCK_API = true;

/**
 * URL del server backend in produzione
 * 
 * Backend deployato su Railway.app
 * SEMPRE Railway anche in sviluppo per usare stesso DB
 */
export const API_BASE_URL = 'https://rork-stappa-drink-tracker-production.up.railway.app';

/**
 * Timeout per le chiamate API (millisecondi)
 */
export const API_TIMEOUT = 15000;

/**
 * Headers comuni per tutte le richieste
 */
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

/**
 * Versione API (opzionale, per future versioning)
 */
export const API_VERSION = 'v1';

/**
 * Endpoints API
 */
export const ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  ME: '/api/auth/me',
  VERIFY_EMAIL: '/api/auth/verify-email',
  VERIFY_PHONE: '/api/auth/verify-phone',
  SEND_VERIFICATION: '/api/auth/send-verification',
  FORGOT_PASSWORD: '/api/auth/forgot-password',
  RESET_PASSWORD: '/api/auth/reset-password',

  // Users
  USERS: '/api/users',
  USER_BY_ID: (id: string) => `/api/users/${id}`,
  USER_PROFILE: (id: string) => `/api/users/${id}/profile`,
  USER_FAVORITES: (id: string) => `/api/users/${id}/favorites`,
  USER_PASSWORD_RESET: (id: string) => `/api/users/${id}/send-password-reset`,

  // Localities
  LOCALITIES: '/api/localities',

  // Establishments
  ESTABLISHMENTS: '/api/establishments',
  ESTABLISHMENT_BY_ID: (id: string) => `/api/establishments/${id}`,
  ESTABLISHMENT_ASSIGN: (id: string) => `/api/establishments/${id}/assign-merchant`,
  ESTABLISHMENT_TEAM: (id: string) => `/api/establishments/${id}/team`,
  ESTABLISHMENT_REMOVE_MERCHANT: (id: string, userId: string) => `/api/establishments/${id}/merchants/${userId}`,
  ESTABLISHMENT_TRANSFER_SENIOR: (id: string) => `/api/establishments/${id}/transfer-senior`,

  // Progress
  PROGRESS: '/api/qr/progress',
  PROGRESS_BY_USER: (userId: string, establishmentId: string) => `/api/qr/progress?establishmentId=${establishmentId}`,
  PROGRESS_INCREMENT: '/api/progress/increment',
  PROGRESS_RESET: '/api/progress/reset',

  // QR Codes
  QR_GENERATE_VALIDATION: '/api/qr/generate/validation',
  QR_GENERATE_BONUS: '/api/qr/generate/bonus',
  QR_SCAN: '/api/qr/scan',
  QR_SIMULATE_SCAN: '/api/qr/simulate-scan',

  // Merchant Requests
  MERCHANT_REQUESTS: '/api/merchant-requests',
  MERCHANT_REQUEST_BY_ID: (id: string) => `/api/merchant-requests/${id}`,
  MERCHANT_REQUEST_APPROVE: (id: string) => `/api/merchant-requests/${id}/approve`,
  MERCHANT_REQUEST_REJECT: (id: string) => `/api/merchant-requests/${id}/reject`,
  MERCHANT_REQUESTS_MY: '/api/merchant-requests/my-requests',

  // Promos
  PROMOS: '/api/promos',
  PROMO_BY_ID: (id: string) => `/api/promos/${id}`,
  PROMO_ACTIVE: (establishmentId: string) => `/api/promos/active/${establishmentId}`,
  PROMO_BY_ESTABLISHMENT: (establishmentId: string) => `/api/promos/establishment/${establishmentId}`,

  // Validations
  VALIDATIONS: '/api/validations',
  VALIDATIONS_USER: (userId: string) => `/api/validations/user/${userId}`,
  VALIDATIONS_ESTABLISHMENT: (establishmentId: string) => `/api/validations/establishment/${establishmentId}`,

  // Leaderboard
  LEADERBOARD_MONTHLY: (establishmentId: string) => `/api/leaderboard/monthly/${establishmentId}`,

  // Social
  SOCIAL_POSTS: (establishmentId: string) => `/api/social/${establishmentId}`,
  SOCIAL_POST_CREATE: '/api/social',
  SOCIAL_POST_LIKE: (postId: string) => `/api/social/posts/${postId}/like`,
  SOCIAL_STORIES: (establishmentId: string) => `/api/social/${establishmentId}`, // Will append ?type=STORY in api-http
  SOCIAL_STORY_CREATE: '/api/social',
  SOCIAL_STORY_VIEW: (storyId: string) => `/api/social/stories/${storyId}/view`,
  SOCIAL_COMMENTS: '/api/social/comments',
  SOCIAL_CHAT: (establishmentId: string) => `/api/social/${establishmentId}/chat`,
  SOCIAL_CHAT_SEND: '/api/social/chat/send',
  SOCIAL_REVIEWS: (establishmentId: string) => `/api/reviews/establishment/${establishmentId}`,
  SOCIAL_REVIEW_CREATE: '/api/reviews',
  SOCIAL_STATS: (establishmentId: string) => `/api/social/${establishmentId}/stats`,
  SOCIAL_SET_MANAGER: '/api/social/set-manager',
  SOCIAL_TOGGLE_POST_PERMISSION: '/api/social/toggle-post-permission',

  // Schedule
  SCHEDULE: (establishmentId: string) => `/api/schedule/${establishmentId}`,
  SCHEDULE_UPDATE: (establishmentId: string) => `/api/schedule/${establishmentId}`,
  SCHEDULE_OPEN_STATUS: (establishmentId: string) => `/api/schedule/${establishmentId}/open-status`,
  SCHEDULE_CLOSURE: (establishmentId: string) => `/api/schedule/${establishmentId}/closure`,
  SCHEDULE_CLOSURE_REMOVE: (establishmentId: string, closureId: string) => 
    `/api/schedule/${establishmentId}/closure/${closureId}`,

  // Bug Reports
  BUG_REPORTS: '/api/bug-reports',
  BUG_REPORT_BY_ID: (id: string) => `/api/bug-reports/${id}`,
  BUG_REPORTS_MY: '/api/bug-reports/my-reports',

  // Inventory (Articles)
  ARTICLES: '/api/articles',
  ARTICLE_BY_ID: (id: string) => `/api/articles/${id}`,
  ARTICLES_BY_ESTABLISHMENT: (establishmentId: string) => `/api/articles/establishment/${establishmentId}`,

  // Stock
  STOCK: '/api/stock',
  STOCK_UPDATE: '/api/stock/update',
  STOCK_SET: '/api/stock/set',
  STOCK_HISTORY: '/api/stock/history',
  STOCK_BY_ESTABLISHMENT: (establishmentId: string) => `/api/stock/establishment/${establishmentId}`,

  // Stock Photos (AI Recognition)
  STOCK_PHOTOS: '/api/stock-photos',
  STOCK_PHOTO_UPLOAD: '/api/stock-photos/upload',
  STOCK_PHOTO_ANALYZE: (photoId: string) => `/api/stock-photos/${photoId}/analyze`,
  STOCK_PHOTO_BY_ID: (photoId: string) => `/api/stock-photos/${photoId}`,
  STOCK_PHOTO_CONFIRM: '/api/stock-photos/confirm-recognition',
  STOCK_PHOTO_CONFIRM_ALL: (photoId: string) => `/api/stock-photos/${photoId}/confirm-all`,
};

/**
 * Helper per costruire URL completi
 */
export function buildUrl(endpoint: string): string {
  return `${API_BASE_URL}${endpoint}`;
}

/**
 * Helper per aggiungere query parameters
 */
export function buildUrlWithParams(endpoint: string, params: Record<string, string | number | boolean>): string {
  const url = buildUrl(endpoint);
  const searchParams = new URLSearchParams();
  
  for (const key in params) {
    const value = params[key];
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  }
  
  const queryString = searchParams.toString();
  return queryString ? `${url}?${queryString}` : url;
}
