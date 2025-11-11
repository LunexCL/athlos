import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);

// Connect to emulators in development
const useEmulator = import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true';

if (useEmulator && import.meta.env.DEV) {
  console.log('🔥 Using Firebase Emulators');
  
  try {
    // Auth Emulator - check if not already connected
    if (!(auth as any)._canInitEmulator) {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    }
  } catch (error) {
    // Already connected, ignore
  }
  
  try {
    // Firestore Emulator
    connectFirestoreEmulator(db, 'localhost', 8080);
  } catch (error) {
    // Already connected, ignore
  }
  
  try {
    // Functions Emulator
    connectFunctionsEmulator(functions, 'localhost', 5001);
  } catch (error) {
    // Already connected, ignore
  }
  
  // Storage Emulator (optional, uncomment if needed)
  // try {
  //   connectStorageEmulator(storage, 'localhost', 9199);
  // } catch (error) {
  //   // Already connected, ignore
  // }
}

export default app;
