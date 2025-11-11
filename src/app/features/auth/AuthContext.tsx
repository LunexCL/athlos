import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { signInWithEmail, registerWithEmail, signOut as firebaseSignOut } from '@/lib/auth';
import type { AuthState, AuthUser, User, Tenant, RegisterFormData, LoginFormData } from './types';

interface AuthContextValue extends AuthState {
  login: (data: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    userProfile: null,
    tenant: null,
    loading: true,
    initialized: false,
  });

  // Subscribe to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (!firebaseUser) {
        setState({
          user: null,
          userProfile: null,
          tenant: null,
          loading: false,
          initialized: true,
        });
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

        // Get user profile from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        
        if (!userDoc.exists()) {
          console.warn('User document not found, might be during registration');
          setState({
            user: authUser,
            userProfile: null,
            tenant: null,
            loading: false,
            initialized: true,
          });
          return;
        }

        const userProfile = { id: userDoc.id, ...userDoc.data() } as unknown as User;

        // Get tenant if user has tenantId in claims
        let tenant: Tenant | null = null;
        if (customClaims.tenantId) {
          const tenantDoc = await getDoc(doc(db, 'tenants', customClaims.tenantId as string));
          if (tenantDoc.exists()) {
            tenant = { id: tenantDoc.id, ...tenantDoc.data() } as unknown as Tenant;
          }
        }

        setState({
          user: authUser,
          userProfile,
          tenant,
          loading: false,
          initialized: true,
        });
      } catch (error: any) {
        console.error('Error loading user data:', error);
        setState({
          user: {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            emailVerified: firebaseUser.emailVerified,
          },
          userProfile: null,
          tenant: null,
          loading: false,
          initialized: true,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (data: LoginFormData) => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      await signInWithEmail(data.email, data.password);
      // onAuthStateChanged will handle the rest
    } catch (error: any) {
      setState((prev) => ({ ...prev, loading: false }));
      throw error;
    }
  };

  const register = async (data: RegisterFormData) => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      await registerWithEmail(data.email, data.password, data.displayName);
      // onAuthStateChanged will handle the rest
    } catch (error: any) {
      setState((prev) => ({ ...prev, loading: false }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      await firebaseSignOut();
      // onAuthStateChanged will handle clearing state
    } catch (error: any) {
      setState((prev) => ({ ...prev, loading: false }));
      throw error;
    }
  };

  const value: AuthContextValue = {
    ...state,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
