'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import { FirebaseProvider } from '@/contexts/FirebaseContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </FirebaseProvider>
  )
} 