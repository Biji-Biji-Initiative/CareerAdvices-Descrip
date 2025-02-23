# Career Advice & Job Description Platform

A comprehensive platform designed to provide career guidance and manage job descriptions, developed by Biji-Biji Initiative. This platform aims to bridge the gap between job seekers and employers while offering valuable career development resources.

## Overview

The platform serves two main purposes:
1. Providing career advice and guidance to job seekers
2. Managing and organizing job descriptions for employers and recruiters

## Features

### For Job Seekers
- Career guidance and counseling
- Job search functionality
- Resume building tips
- Interview preparation resources
- Career path recommendations
- Real-time chat support
- AI-powered career recommendations

### For Employers
- Job posting management
- Candidate profile viewing
- Application tracking
- Analytics and reporting
- Real-time notifications
- Custom job description templates

## Tech Stack

- Next.js 15.1.4
- React 19
- Supabase for authentication and real-time features
- OpenAI integration for AI-powered recommendations
- TailwindCSS for styling
- TypeScript for type safety
- Framer Motion for animations

## Prerequisites

- Node.js (v20 or higher)
- Git
- Supabase account
- OpenAI API key (for AI features)

## Installation

1. Clone the repository
```bash
git clone https://github.com/Biji-Biji-Initiative/CareerAdvices-Descrip.git
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env
```

4. Set up your environment variables in `.env`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`
- Other required environment variables as specified in `.env.example`

5. Start the development server
```bash
npm run dev
```

## Project Structure
```
├── src/              # Source code
│   ├── components/   # Reusable UI components
│   ├── pages/        # Next.js pages and API routes
│   ├── styles/       # Global styles and Tailwind config
│   └── utils/        # Helper functions and utilities
├── public/           # Static assets
├── .next/            # Next.js build output
├── node_modules/     # Dependencies
└── docs/            # Documentation
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

We welcome contributions from the community! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Contact

- Project Maintainer: Habib - habib@mereka.io
- Organization: Biji-Biji Initiative
- Project Link: [https://github.com/Biji-Biji-Initiative/CareerAdvices-Descrip](https://github.com/Biji-Biji-Initiative/CareerAdvices-Descrip)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Biji-Biji Initiative team members
- Contributors and supporters
- Open source community
- Supabase team for the excellent real-time and auth features
- OpenAI for AI capabilities
