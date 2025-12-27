import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { signInWithEmail, registerWithEmail, signOut as firebaseSignOut } from '@/lib/auth';
import Usuario from '@/estructura/Usuario';
import Tenant from '@/estructura/Tenant';
import type { AuthState, AuthUser, RegisterFormData, LoginFormData } from './types';

interface AuthContextValue extends Omit<AuthState, 'userProfile' | 'tenant'> {
  userProfile: Usuario | null;
  tenant: Tenant | null;
  login: (data: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<Usuario | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Subscribe to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (!firebaseUser) {
        setUser(null);
        setUserProfile(null);
        setTenant(null);
        setLoading(false);
        setInitialized(true);
        return;
      }

      try {
        // Get user custom claims
        const tokenResult = await firebaseUser.getIdTokenResult();
        const customClaims = tokenResult.claims;

        // Build AuthUser from Firebase User and custom claims
        const authUser: AuthUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
          tenantId: customClaims.tenantId as string | undefined,
          role: customClaims.role as any,
          isActive: customClaims.isActive as boolean | undefined,
        };

        // Get user profile from Firestore usando el nuevo modelo Usuario
        const usuario = await Usuario.getById(firebaseUser.uid);
        
        if (!usuario) {
          console.warn('User document not found, might be during registration');
          setUser(authUser);
          setUserProfile(null);
          setTenant(null);
          setLoading(false);
          setInitialized(true);
          return;
        }

        // Get tenant - try from custom claims first, then from user document
        let loadedTenant: Tenant | null = null;
        const tenantIdFromClaims = customClaims.tenantId as string | undefined;
        const tenantIdFromUser = usuario.tenantId;
        const tenantId = tenantIdFromClaims || tenantIdFromUser;
        
        if (tenantId) {
          try {
            loadedTenant = await Tenant.getById(tenantId);
          } catch (error) {
            console.error('Error loading tenant:', error);
          }
        }

        setUser(authUser);
        setUserProfile(usuario);
        setTenant(loadedTenant);
        setLoading(false);
        setInitialized(true);
      } catch (error: any) {
        console.error('Error loading user data:', error);
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
        });
        setUserProfile(null);
        setTenant(null);
        setLoading(false);
        setInitialized(true);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (data: LoginFormData) => {
    try {
      setLoading(true);
      await signInWithEmail(data.email, data.password);
      // onAuthStateChanged will handle the rest
    } catch (error: any) {
      setLoading(false);
      throw error;
    }
  }, []);

  const register = useCallback(async (data: RegisterFormData) => {
    try {
      setLoading(true);
      await registerWithEmail(data.email, data.password, data.displayName);
      // onAuthStateChanged will handle the rest
    } catch (error: any) {
      setLoading(false);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await firebaseSignOut();
      // onAuthStateChanged will handle clearing state
    } catch (error: any) {
      setLoading(false);
      throw error;
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    userProfile,
    tenant,
    loading,
    initialized,
    login,
    register,
    logout,
  }), [user, userProfile, tenant, loading, initialized, login, register, logout]);

  // Only render children after provider is ready to prevent loops
  if (!initialized) {
    return (
      <AuthContext.Provider value={value}>
        <div className="flex min-h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </AuthContext.Provider>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
