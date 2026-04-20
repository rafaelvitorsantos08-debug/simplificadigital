import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

async function testConnection() {
  try {
    const testDoc = await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase connection test complete.", testDoc.exists());
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    } else {
      console.warn("Connection test warning (can be ignored if setup is fine):", error);
    }
  }
}
// Un-comment to test connection immediately (may throw permission denied prior to rules deploy)
// testConnection();

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: any;
}

export const handleFirestoreError = (error: any, operationType: any, path: string | null) => {
  if (error?.message?.includes('Missing or insufficient permissions')) {
    const errorInfo: FirestoreErrorInfo = {
      error: error.message,
      operationType,
      path,
      authInfo: auth.currentUser ? {
        userId: auth.currentUser.uid,
        email: auth.currentUser.email,
        emailVerified: auth.currentUser.emailVerified,
        isAnonymous: auth.currentUser.isAnonymous,
        providerInfo: auth.currentUser.providerData
      } : { userId: null }
    };
    throw new Error(JSON.stringify(errorInfo));
  }
  throw error;
};
