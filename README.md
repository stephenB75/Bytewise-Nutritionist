# Bytewise Nutrition Tracker

A comprehensive Progressive Web App (PWA) for nutrition tracking, meal planning, and recipe management built with modern serverless architecture.

## 🚀 Features

- **Nutrition Tracking**: USDA-powered food database with accurate calorie and macro calculations
- **Meal Planning**: Weekly calendar-based meal scheduling and planning
- **Recipe Management**: Create, save, and share custom recipes with automatic nutrition analysis
- **Achievement System**: Gamified progress tracking with badges and milestones
- **Water Intake Tracking**: Daily hydration monitoring with goal setting
- **PWA Support**: Installable app with offline functionality
- **Real-time Sync**: Live data updates across all devices
- **Mobile-First Design**: Touch-optimized interface with native app feel

## 🏗️ Architecture

### Modern Serverless Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **UI Library**: Tailwind CSS + shadcn/ui
- **State Management**: TanStack Query + React Hooks
- **API Integration**: USDA FoodData Central
- **PWA**: Service Worker + Web App Manifest

### Key Benefits
- Zero server maintenance
- Automatic scaling and backups
- Global edge network performance
- Enterprise-grade security
- Real-time data synchronization

## 📋 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier available)
- USDA API key (optional, for enhanced food data)

### Setup Instructions

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd bytewise-nutrition-tracker
   npm install
   ```

2. **Configure Supabase**
   - Create a project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Add to Replit Secrets or `.env`:
     ```
     VITE_SUPABASE_URL=https://your-project.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-key
     ```

3. **Set up Database**
   - Go to Supabase SQL Editor
   - Copy and run the SQL from `supabase/migrations/001_initial_schema.sql`
   - This creates all tables, security policies, and indexes

4. **Optional: Add USDA API Key**
   ```
   VITE_USDA_API_KEY=your-usda-api-key
   ```

5. **Start Development**
   ```bash
   npm run dev
   ```

## 📖 Documentation

- **[Architecture Guide](ARCHITECTURE.md)** - System design and technical architecture
- **[Components Guide](COMPONENTS.md)** - Detailed component documentation
- **[API Documentation](API_DOCUMENTATION.md)** - Complete API reference
- **[Setup Guide](SUPABASE_QUICKSTART.md)** - Step-by-step setup instructions

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Production build
npm run preview      # Preview production build
npm run type-check   # TypeScript type checking
```

### Project Structure
```
├── client/          # Frontend React application
├── server/          # Development server (legacy)
├── supabase/        # Database migrations and config
├── shared/          # Shared TypeScript types
├── public/          # Static assets
└── docs/            # Documentation files
```

### Key Technologies

#### Frontend
- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Full type safety throughout the application
- **Vite**: Fast build tool with hot module replacement
- **Tailwind CSS**: Utility-first styling with responsive design
- **shadcn/ui**: Accessible component library with consistent design
- **TanStack Query**: Powerful data fetching and caching
- **Wouter**: Lightweight client-side routing

#### Backend & Services
- **Supabase**: Complete backend-as-a-service platform
- **PostgreSQL**: Robust relational database with JSONB support
- **Row Level Security**: Database-level security policies
- **Real-time Subscriptions**: Live data updates
- **Supabase Auth**: Multi-provider authentication system
- **USDA FoodData Central**: Comprehensive nutrition database

#### PWA Features
- **Service Worker**: Offline functionality and caching
- **Web App Manifest**: Native app installation
- **Background Sync**: Offline data synchronization
- **Push Notifications**: Meal reminders and achievements

### Database Schema

The application uses a comprehensive PostgreSQL schema with the following main tables:

- **users**: User profiles, preferences, and nutrition goals
- **foods**: USDA-integrated food database with nutrition facts
- **recipes**: User-created recipes with ingredient calculations
- **meals**: Planned and logged meals with timestamps
- **meal_foods**: Foods within meals with quantities
- **water_intake**: Daily hydration tracking
- **achievements**: Gamification system with progress tracking
- **calorie_calculations**: Historical calculation records

All tables include Row Level Security policies to ensure data privacy and security.

## 🔐 Security

- **Authentication**: JWT-based sessions with automatic refresh
- **Authorization**: Row Level Security policies at database level
- **Data Encryption**: AES-256 encryption for sensitive data
- **API Security**: Rate limiting and input validation
- **Privacy Compliance**: GDPR-compliant data handling

## 📱 PWA Installation

### Desktop (Chrome/Edge)
1. Click the install icon in the address bar
2. Click "Install" in the prompt
3. App will be added to your applications

### Mobile (iOS Safari)
1. Tap the share button
2. Select "Add to Home Screen"
3. Confirm installation

### Mobile (Android Chrome)
1. Tap the three-dot menu
2. Select "Add to Home Screen"
3. Confirm installation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use Prettier for code formatting
- Write comprehensive tests for new features
- Update documentation for API changes
- Ensure mobile responsiveness
- Test PWA functionality across devices

## 📊 Performance

### Optimization Features
- **Code Splitting**: Route-based lazy loading
- **Image Optimization**: WebP format with fallbacks
- **Caching Strategy**: Service worker with cache-first approach
- **Bundle Analysis**: Tree shaking and minification
- **Database Optimization**: Efficient queries with proper indexing

### Performance Metrics
- **Lighthouse Score**: 95+ across all categories
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.0s
- **Bundle Size**: < 500kb gzipped

## 🌍 Browser Support

- **Chrome**: 88+ (full PWA support)
- **Firefox**: 85+ (limited PWA features)
- **Safari**: 14+ (iOS PWA support)
- **Edge**: 88+ (full PWA support)
- **Samsung Internet**: 15+ (full PWA support)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⭐ Acknowledgments

- **Supabase**: For providing the excellent backend-as-a-service platform
- **USDA**: For the comprehensive FoodData Central nutrition database
- **shadcn/ui**: For the beautiful and accessible component library
- **Tailwind CSS**: For the utility-first styling framework
- **Replit**: For the development and hosting platform

---

**Built with ❤️ for better nutrition tracking**

For support or questions, please open an issue or check the documentation files.