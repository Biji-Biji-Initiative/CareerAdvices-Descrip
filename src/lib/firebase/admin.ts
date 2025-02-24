import * as admin from 'firebase-admin';

interface FirebaseAdminConfig {
  projectId: string;
  clientEmail: string;
  privateKey: string;
  databaseURL: string;
}

const getFirebaseAdminConfig = (): FirebaseAdminConfig => {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  
  if (!process.env.FIREBASE_PROJECT_ID) {
    throw new Error('FIREBASE_PROJECT_ID is not set in environment variables');
  }
  if (!process.env.FIREBASE_CLIENT_EMAIL) {
    throw new Error('FIREBASE_CLIENT_EMAIL is not set in environment variables');
  }
  if (!privateKey) {
    throw new Error('FIREBASE_PRIVATE_KEY is not set in environment variables');
  }
  if (!process.env.FIREBASE_DATABASE_URL) {
    throw new Error('FIREBASE_DATABASE_URL is not set in environment variables');
  }

  return {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: privateKey.replace(/\\n/g, '\n'),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  };
};

// Initialize Firebase Admin
let firebaseAdmin: admin.app.App;

export function getFirebaseAdminApp(): admin.app.App {
  if (!firebaseAdmin) {
    const config = getFirebaseAdminConfig();
    
    try {
      firebaseAdmin = admin.getApp();
    } catch {
      firebaseAdmin = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: config.projectId,
          clientEmail: config.clientEmail,
          privateKey: config.privateKey,
        }),
        databaseURL: config.databaseURL,
      });
    }
  }
  
  return firebaseAdmin;
}

// Export commonly used Firebase Admin services
export const getFirestore = () => getFirebaseAdminApp().firestore();
export const getAuth = () => getFirebaseAdminApp().auth();
export const getDatabase = () => getFirebaseAdminApp().database(); 