'use client'

// AuthPortal: Main authentication page that serves as the gateway to the ChatHub application
// Provides a unified interface for both sign-in and sign-up functionality
import { useState } from 'react'
import { AuthPortalSignIn } from '@/components/auth/SignInForm'
import { AuthPortalSignUp } from '@/components/auth/SignUpForm'
import { Button } from '@/components/ui/Button'

export default function AuthPortal() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center">
      <div className="auth-container w-full max-w-md">
        <div className="text-center mb-10">
          <img 
            src="https://cdn.brandfetch.io/idP99DVbZ3/theme/dark/logo.svg" 
            alt="Mereka Logo" 
            className="h-8 w-auto mx-auto mb-6"
          />
          <h1 className="text-2xl font-semibold text-gray-900">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {mode === 'signin' 
              ? 'Sign in to access personalized career advice'
              : 'Join Mereka to get expert career guidance'}
          </p>
        </div>

        {mode === 'signin' ? <AuthPortalSignIn /> : <AuthPortalSignUp />}
        
        <div className="mt-6 text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                {mode === 'signin' ? 'New to Mereka?' : 'Already have an account?'}
              </span>
            </div>
          </div>

          <Button
            variant="link"
            className="mt-4 text-gray-900 hover:text-gray-700 font-medium"
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          >
            {mode === 'signin'
              ? "Create an account"
              : 'Sign in to your account'}
          </Button>
        </div>
      </div>
    </div>
  )
} 