import * as logger from 'firebase-functions/logger';
import * as admin from 'firebase-admin';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';

// Initialize admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const auth = admin.auth();

interface PendingTenantData {
  businessName: string;
  businessType?: 'gym' | 'clinic' | 'personal_training' | 'other';
}

/**
 * Cloud Function triggered when a pending tenant document is created
 * Creates user document, tenant document, and sets custom claims
 */
export const onUserCreated = onDocumentCreated('_pendingTenants/{userId}', async (event) => {
  const userId = event.params.userId;
  const pendingData = event.data?.data() as PendingTenantData | undefined;

  if (!pendingData) {
    logger.error('No pending tenant data found');
    return;
  }

  try {
    logger.info(`Creating tenant for user ${userId}`);

    // Get user info from Auth
    const user = await auth.getUser(userId);
    const { uid, email, displayName, photoURL } = user;

    const tenantData: PendingTenantData = {
      businessName: pendingData.businessName || displayName || 'Mi Negocio',
      businessType: pendingData.businessType || 'other',
    };

    // Create tenant document
    const tenantRef = db.collection('tenants').doc();
    const now = admin.firestore.FieldValue.serverTimestamp();

    await tenantRef.set({
      name: tenantData.businessName,
      ownerId: uid,
      plan: 'free',
      settings: {
        businessName: tenantData.businessName,
        businessType: tenantData.businessType,
        timezone: 'America/Santiago',
        currency: 'CLP',
        features: {
          calendar: true,
          payments: true,
          routines: true,
          activities: true,
        },
      },
      createdAt: now,
      updatedAt: now,
      isActive: true,
    });

    logger.info(`Tenant created with ID: ${tenantRef.id}`);

    // Create user document in Firestore
    await db.collection('users').doc(uid).set({
      uid,
      email: email || '',
      displayName: displayName || '',
      photoURL: photoURL || '',
      role: 'owner',
      tenantId: tenantRef.id,
      createdAt: now,
      updatedAt: now,
      emailVerified: user.emailVerified || false,
      isActive: true,
    });

    logger.info(`User document created for ${uid}`);

    // Set custom claims
    await auth.setCustomUserClaims(uid, {
      tenantId: tenantRef.id,
      role: 'owner',
      isActive: true,
    });

    logger.info(`Custom claims set for ${uid}`);

    // Delete the pending document
    await event.data?.ref.delete();
    logger.info(`Pending tenant document deleted for ${uid}`);

    return {
      success: true,
      tenantId: tenantRef.id,
    };
  } catch (error) {
    logger.error('Error in onUserCreated:', error);
    
    // If there's an error, try to clean up
    try {
      await db.collection('users').doc(userId).delete();
      logger.info('Cleaned up user document');
    } catch (cleanupError) {
      logger.error('Error cleaning up:', cleanupError);
    }

    throw error;
  }
});
