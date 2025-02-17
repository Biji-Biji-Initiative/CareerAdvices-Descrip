# Authentication Files Overview

## Main Authentication Pages

1. `src/app/auth/page.tsx`
   - Main authentication portal
   - Unified interface for sign-in and sign-up
   - Handles mode switching between sign-in and sign-up views

2. `src/app/auth/reset-password/page.tsx`
   - Password reset page
   - Handles password reset flow
   - Password confirmation and validation

3. `src/app/auth/callback/route.ts`
   - Authentication callback handler
   - Processes OAuth redirects
   - Handles session token exchange

## Authentication Components

1. `src/components/auth/SignInForm.tsx`
   - Sign-in form component
   - Email/password authentication
   - Social login (Google, Facebook)
   - Password reset functionality
   - Remember me option
   - Error handling

2. `src/components/auth/SignUpForm.tsx`
   - Sign-up form component
   - New user registration
   - Password validation
   - Email verification
   - Social sign-up options
   - Error handling

## Authentication Context and State Management

1. `src/contexts/AuthContext.tsx`
   - Authentication context provider
   - User session management
   - Authentication state handling
   - Auth state change listeners

## Styling

1. `src/app/globals.css`
   - Contains authentication-related styles
   - Custom styling for auth containers
   - Form input styling
   - Responsive design elements

## Features
- Email/Password Authentication
- Social Authentication (Google, Facebook)
- Password Reset Flow
- Email Verification
- Session Management
- Protected Routes
- Responsive Design
- Error Handling
- Loading States

## Authentication Provider
- Supabase Authentication
- OAuth Integration
- Secure Session Management
- Token Handling 