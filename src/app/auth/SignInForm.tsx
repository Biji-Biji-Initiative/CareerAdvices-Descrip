'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { supabase } from '@/lib/supabase'

export function SignInForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSocialLoading, setIsSocialLoading] = useState(false)
  const [isResetEmailSent, setIsResetEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Sign in successful
      router.push('/dashboard')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setError(null)
    setIsSocialLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
      setIsSocialLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address')
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error

      setIsResetEmailSent(true)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <img 
          src="https://cdn.brandfetch.io/idP99DVbZ3/theme/dark/logo.svg" 
          alt="Mereka Logo" 
          className="h-8 w-auto mx-auto mb-6"
        />
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Sign in to your account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input-mereka w-full"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm font-medium text-gray-900 hover:text-gray-700"
            >
              Forgot password?
            </button>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input-mereka w-full"
          />
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 rounded-md px-4 py-3">
            {error}
          </div>
        )}

        {isResetEmailSent && (
          <div className="text-sm text-green-600 bg-green-50 rounded-md px-4 py-3">
            Check your email for password reset instructions
          </div>
        )}

        <Button
          type="submit"
          className="button-mereka w-full"
          isLoading={isLoading}
        >
          Sign in
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleSocialLogin('google')}
            disabled={isSocialLoading}
            className="inline-flex w-full justify-center rounded-lg border px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            Google
          </button>
          <button
            type="button"
            onClick={() => handleSocialLogin('facebook')}
            disabled={isSocialLoading}
            className="inline-flex w-full justify-center rounded-lg border px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            Facebook
          </button>
        </div>
      </form>
    </div>
  )
} 