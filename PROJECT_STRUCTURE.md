# Career Advice Description Project Structure

## Project Overview
This Next.js application serves as a platform for career advice and descriptions, built with modern web technologies and best practices.

## Technology Stack
### Core Technologies
- **Frontend Framework:** Next.js 15.1.4
- **UI Library:** React 19
- **Language:** TypeScript
- **Styling:** TailwindCSS + PostCSS
- **API Integration:** OpenAI API

### Development Tools
- ESLint for code quality
- TypeScript for type safety
- Netlify for deployment
- PostCSS for CSS processing

## Directory Structure
```
src/
├── app/                      # Main application code
│   ├── components/          # Reusable React components
│   ├── api/                 # API routes and handlers
│   ├── contexts/            # React context providers
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions and libraries
│   ├── agentConfigs/       # Configuration for agents
│   ├── App.tsx             # Main application component
│   ├── layout.tsx          # Root layout component
│   ├── page.tsx            # Main page component
│   ├── types.ts            # TypeScript type definitions
│   └── globals.css         # Global styles
```

## Key Components and Their Responsibilities

### 1. Core Application Files
- `App.tsx`: Main application component that orchestrates the entire application
- `layout.tsx`: Defines the common layout structure used across pages
- `page.tsx`: Main entry point for the application's home page
- `types.ts`: Central location for TypeScript type definitions

### 2. Directory Purposes
- `components/`: Houses reusable UI components
- `api/`: Contains API route handlers and backend logic
- `contexts/`: Manages application state through React Context
- `hooks/`: Custom React hooks for shared logic
- `lib/`: Utility functions and helper methods
- `agentConfigs/`: Configuration files for various agents/services

## State Management
- Uses React Context for global state management
- Custom hooks for encapsulating complex logic and local state
- Follows unidirectional data flow principles

## Styling Strategy
- Utility-first approach with TailwindCSS
- Global styles defined in globals.css
- Component-specific styles when needed
- Responsive design principles

## API Integration
- RESTful API endpoints in the api/ directory
- OpenAI API integration for AI-powered features
- Type-safe API responses

## Development Guidelines

### 1. Code Organization
- Keep components small and focused
- Use TypeScript interfaces for prop definitions
- Implement proper error handling
- Follow the DRY (Don't Repeat Yourself) principle

### 2. Naming Conventions
- Components: PascalCase (e.g., `UserProfile.tsx`)
- Hooks: camelCase with 'use' prefix (e.g., `useAuth.ts`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- Types/Interfaces: PascalCase with descriptive names

### 3. Best Practices
- Write self-documenting code
- Add comments for complex logic
- Use TypeScript strictly
- Implement proper error boundaries
- Follow React's best practices for hooks and components

### 4. Performance Considerations
- Implement code splitting where necessary
- Optimize images and assets
- Use proper React memo and callback patterns
- Implement proper loading states

## Environment Configuration
- `.env`: Production environment variables
- `.env.example`: Template for environment variables
- Required variables:
  - API keys
  - External service configurations
  - Environment-specific settings

## Build and Deployment
- Build Command: `npm run build`
- Development: `npm run dev`
- Production: `npm run start`
- Linting: `npm run lint`

## Adding New Features
When adding new features:
1. Create components in appropriate directories
2. Update types as needed
3. Add necessary API endpoints
4. Implement proper error handling
5. Add documentation
6. Test thoroughly

## Common Patterns
- Use hooks for shared logic
- Implement proper loading states
- Handle errors gracefully
- Type all components and functions
- Follow the established folder structure

## Security Considerations
- Never expose API keys in client-side code
- Implement proper input validation
- Use environment variables for sensitive data
- Follow security best practices for API endpoints

This documentation serves as a living document and should be updated as the project evolves. 