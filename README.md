# Career Advice & Job Description Platform

A comprehensive platform designed to provide career guidance and manage job descriptions, developed by Biji-Biji Initiative. This platform aims to bridge the gap between job seekers and employers while offering valuable career development resources.

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/Biji-Biji-Initiative/CareerAdvices-Descrip.git

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start development server
npm run dev
```

## 🎯 Overview

The platform serves as a comprehensive career development ecosystem with two main focuses:
1. **Career Guidance**: AI-powered career advice and development resources
2. **Job Management**: Efficient job description management and matching system

## ✨ Key Features

### 🎓 For Job Seekers
- Personalized career guidance and counseling
- AI-powered job recommendations
- Interactive resume building tools
- Interview preparation resources
- Career path visualization
- Real-time chat support
- Skill assessment tools

### 💼 For Employers
- Streamlined job posting management
- Advanced candidate matching
- Application tracking system
- Analytics dashboard
- Real-time notifications
- Customizable job templates

## 🛠 Tech Stack

- **Framework**: Next.js 15.1.4
- **Frontend**: React 19, TailwindCSS
- **Language**: TypeScript
- **Authentication**: Supabase Auth
- **Database**: Supabase
- **AI Integration**: OpenAI
- **Animation**: Framer Motion
- **Deployment**: Netlify

## 📋 Prerequisites

- Node.js v20+
- npm/yarn
- Git
- Supabase account
- OpenAI API key

## 🔧 Environment Setup

Required environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
OPENAI_API_KEY=your_openai_key
# See .env.example for all required variables
```

## 📁 Project Structure

```
├── src/
│   ├── app/           # Next.js app directory
│   ├── components/    # Reusable UI components
│   ├── contexts/      # React contexts
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility functions
│   └── middleware.ts  # Next.js middleware
├── public/           # Static assets
└── docs/            # Documentation
```

## 🛠 Available Scripts

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm start` - Production server
- `npm run lint` - Code linting

## 🤝 Contributing

We welcome contributions! Please follow our contribution guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/YourFeature`)
3. Commit changes (`git commit -m 'Add YourFeature'`)
4. Push to branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

### Commit Message Format
```
type(scope): subject

[optional body]

[optional footer]
```

Types: feat, fix, docs, style, refactor, test, chore

## 📝 Version Control

- Main branch: Production-ready code
- Develop branch: Integration branch
- Feature branches: New features
- Hotfix branches: Emergency fixes

## 🔒 Security

- Environment variables for sensitive data
- Input validation on all forms
- API rate limiting
- Regular security audits
- Secure authentication flow

## 📞 Contact & Support

- **Organization**: Biji-Biji Initiative
- **Repository**: [CareerAdvices-Descrip](https://github.com/Biji-Biji-Initiative/CareerAdvices-Descrip)
- **Issues**: Please use GitHub Issues

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Biji-Biji Initiative team
- Open source community
- Supabase team
- OpenAI team
- All contributors
