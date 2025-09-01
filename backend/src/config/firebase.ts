import admin from 'firebase-admin';
import { config } from 'dotenv';

config();

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  if (!admin.apps.length) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    if (!serviceAccount) {
      console.warn('Firebase service account key not found. Google authentication will not work.');
      return null;
    }

    try {
      const serviceAccountKey = JSON.parse(serviceAccount);
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountKey),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
      
      console.log('✅ Firebase Admin initialized successfully');
      return admin;
    } catch (error) {
      console.error('❌ Failed to initialize Firebase Admin:', error);
      return null;
    }
  }
  
  return admin;
};

export const firebaseAdmin = initializeFirebase();

// Verify Firebase ID token
export const verifyFirebaseToken = async (idToken: string) => {
  if (!firebaseAdmin) {
    throw new Error('Firebase Admin not initialized');
  }
  
  try {
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Firebase token verification error:', error);
    throw new Error('Invalid Firebase token');
  }
};
