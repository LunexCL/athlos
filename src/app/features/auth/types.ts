import { Timestamp } from 'firebase/firestore';
import type Usuario from '@/estructura/Usuario';
import type Tenant from '@/estructura/Tenant';
import type { SportType } from '@/app/shared/types/sports';

/**
 * User roles in the system
 * @deprecated Usar UserRole de '@/estructura/Usuario'
 */
export enum UserRole {
  OWNER = 'owner',           // Tenant owner (profesor/instructor principal)
  INSTRUCTOR = 'instructor', // Additional instructor in the tenant
  CLIENT = 'client',         // Client of the tenant
  ADMIN = 'admin',          // System admin (future use)
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
  userProfile: Usuario | null;
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
  businessType?: SportType;
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
