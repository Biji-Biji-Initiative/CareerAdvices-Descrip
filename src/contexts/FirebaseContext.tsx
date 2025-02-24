import { createContext, useContext, ReactNode } from 'react';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { Database } from 'firebase/database';
import { auth, firestore, database } from '@/lib/firebase/client';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';

interface FirebaseContextType {
  auth: Auth;
  firestore: Firestore;
  database: Database;
  user: ReturnType<typeof useFirebaseAuth>['user'];
  loading: boolean;
  isAuthenticated: boolean;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

interface FirebaseProviderProps {
  children: ReactNode;
}

export function FirebaseProvider({ children }: FirebaseProviderProps) {
  const { user, loading, isAuthenticated } = useFirebaseAuth();

  const value = {
    auth,
    firestore,
    database,
    user,
    loading,
    isAuthenticated,
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
} 