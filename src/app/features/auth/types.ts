import { Timestamp } from 'firebase/firestore';

/**
 * User roles in the system
 */
export enum UserRole {
  OWNER = 'owner',           // Tenant owner (profesor/instructor principal)
  INSTRUCTOR = 'instructor', // Additional instructor in the tenant
  CLIENT = 'client',         // Client of the tenant
  ADMIN = 'admin',          // System admin (future use)
}

/**
 * Tenant plan types
 */
export enum TenantPlan {
  FREE = 'free',
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
}

/**
 * User document in Firestore
 */
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  role: UserRole;
  tenantId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  emailVerified: boolean;
  isActive: boolean;
}

/**
 * Tenant document in Firestore
 */
export interface Tenant {
  id: string;
  name: string;
  ownerId: string;
  plan: TenantPlan;
  settings: TenantSettings;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
  // Subscription info
  subscriptionEndDate?: Timestamp;
  trialEndDate?: Timestamp;
}

/**
 * Tenant settings
 */
export interface TenantSettings {
  businessName?: string;
  businessType?: 'gym' | 'clinic' | 'personal_training' | 'other';
  address?: string;
  phone?: string;
  website?: string;
  logo?: string;
  timezone?: string;
  currency?: 'CLP' | 'USD';
  // Sports/Activities that the trainer offers
  sports?: string[]; // Array of SportType
  onboardingCompleted?: boolean;
  // Feature flags
  features?: {
    calendar?: boolean;
    payments?: boolean;
    routines?: boolean;
    activities?: boolean;
  };
}

/**
 * Custom claims added to Firebase Auth token
 */
export interface CustomClaims {
  tenantId: string;
  role: UserRole;
  isActive: boolean;
}

/**
 * Extended auth user with custom claims
 */
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  // Custom claims
  tenantId?: string;
  role?: UserRole;
  isActive?: boolean;
}

/**
 * Auth context state
 */
export interface AuthState {
  user: AuthUser | null;
  userProfile: User | null;
  tenant: Tenant | null;
  loading: boolean;
  initialized: boolean;
}

/**
 * Registration form data
 */
export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  businessName: string;
  businessType?: 'gym' | 'clinic' | 'personal_training' | 'other';
  acceptTerms: boolean;
}

/**
 * Login form data
 */
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Reset password form data
 */
export interface ResetPasswordFormData {
  email: string;
}

/**
 * Auth error codes from Firebase
 */
export enum AuthErrorCode {
  EMAIL_ALREADY_IN_USE = 'auth/email-already-in-use',
  WEAK_PASSWORD = 'auth/weak-password',
  INVALID_EMAIL = 'auth/invalid-email',
  USER_NOT_FOUND = 'auth/user-not-found',
  WRONG_PASSWORD = 'auth/wrong-password',
  TOO_MANY_REQUESTS = 'auth/too-many-requests',
  NETWORK_ERROR = 'auth/network-request-failed',
}

/**
 * Helper to get user-friendly error messages
 */
export const getAuthErrorMessage = (code: string): string => {
  const messages: Record<string, string> = {
    [AuthErrorCode.EMAIL_ALREADY_IN_USE]: 'Este correo ya está registrado',
    [AuthErrorCode.WEAK_PASSWORD]: 'La contraseña debe tener al menos 6 caracteres',
    [AuthErrorCode.INVALID_EMAIL]: 'Correo electrónico inválido',
    [AuthErrorCode.USER_NOT_FOUND]: 'Usuario no encontrado',
    [AuthErrorCode.WRONG_PASSWORD]: 'Contraseña incorrecta',
    [AuthErrorCode.TOO_MANY_REQUESTS]: 'Demasiados intentos. Intenta más tarde',
    [AuthErrorCode.NETWORK_ERROR]: 'Error de conexión. Verifica tu internet',
  };
  
  return messages[code] || 'Ha ocurrido un error. Intenta nuevamente';
};
