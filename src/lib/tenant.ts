import { doc, setDoc, collection, serverTimestamp, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { SportType } from '@/app/shared/types/sports';

export interface CreateTenantData {
  userId: string;
  email: string;
  displayName: string;
  businessName: string;
  businessType?: SportType;
}

/**
 * Create tenant and user documents in Firestore
 * This is a fallback when Cloud Functions are not available
 */
export const createTenantAndUser = async (data: CreateTenantData) => {
  console.log('🔥 createTenantAndUser called with:', { userId: data.userId, email: data.email });
  
  try {
    // Check if user already exists
    console.log('📋 Checking if user exists...');
    const userDoc = await getDoc(doc(db, 'users', data.userId));
    if (userDoc.exists()) {
      console.log('✅ User already exists, skipping creation');
      const userData = userDoc.data();
      return { tenantId: userData.tenantId, userId: data.userId };
    }

    console.log('🏢 Creating tenant document...');
    // Create tenant document
    const tenantRef = doc(collection(db, 'tenants'));
    const tenantId = tenantRef.id;

    await setDoc(tenantRef, {
      name: data.businessName,
      ownerId: data.userId,
      plan: 'free',
      settings: {
        businessName: data.businessName,
        businessType: data.businessType || 'other',
        timezone: 'America/Santiago',
        currency: 'CLP',
        features: {
          calendar: true,
          payments: true,
          routines: true,
          activities: true,
        },
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true,
    });

    console.log(`✅ Tenant created with ID: ${tenantId}`);

    console.log('👤 Creating user document...');
    // Create user document
    await setDoc(doc(db, 'users', data.userId), {
      uid: data.userId,
      email: data.email,
      displayName: data.displayName,
      photoURL: '',
      role: 'owner',
      tenantId: tenantId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      emailVerified: false,
      isActive: true,
    });

    console.log(`✅ User document created for ${data.userId}`);
    console.log('🎉 Tenant and user creation completed successfully!');

    return { tenantId, userId: data.userId };
  } catch (error) {
    console.error('❌ Error creating tenant and user:', error);
    throw error;
  }
};

/**
 * Update tenant document
 */
export const updateTenant = async (tenantId: string, data: Partial<{
  businessType: SportType;
  businessName: string;
  [key: string]: any;
}>) => {
  console.log('🔥 updateTenant called:', { tenantId, data });
  
  try {
    const tenantRef = doc(db, 'tenants', tenantId);
    
    const updateData: any = {
      updatedAt: serverTimestamp(),
    };

    // Update top-level or nested fields
    if (data.businessType) {
      updateData['settings.businessType'] = data.businessType;
    }
    if (data.businessName) {
      updateData.name = data.businessName;
      updateData['settings.businessName'] = data.businessName;
    }

    await updateDoc(tenantRef, updateData);
    console.log('✅ Tenant updated successfully');
  } catch (error) {
    console.error('❌ Error updating tenant:', error);
    throw error;
  }
};

