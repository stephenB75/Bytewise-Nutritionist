# Bytewise Nutrition Tracker - Architecture Documentation

## System Overview

Bytewise is a comprehensive Progressive Web App (PWA) for nutrition tracking built with a modern serverless architecture. The application provides meal logging, recipe management, calorie calculations, and achievement tracking with a mobile-first design approach.

## Technical Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with hot module replacement
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **PWA Features**: Service worker, offline support, installable interface

### Backend Architecture
- **Type**: Serverless (Backend-as-a-Service)
- **Provider**: Supabase
- **Database**: PostgreSQL with automatic scaling
- **Authentication**: Supabase Auth with JWT tokens
- **API**: RESTful API with real-time subscriptions
- **Security**: Row Level Security (RLS) policies

### Database Schema
- **Users**: Profile data, nutrition goals, preferences
- **Foods**: USDA integrated food database with nutrition facts
- **Recipes**: User-created recipes with ingredient calculations
- **Meals**: Planned and logged meals with timestamps
- **Water Intake**: Daily hydration tracking
- **Achievements**: Gamification system with progress tracking
- **Calorie Calculations**: Historical calculation records

## Core Components

### Authentication System
```typescript
// Supabase Auth integration with multiple providers
- Email/password authentication
- OAuth providers (Google, GitHub)
- JWT-based session management
- Automatic token refresh
- Secure logout and session cleanup
```

### Data Layer
```typescript
// Type-safe database operations
- Generated TypeScript types from database schema
- Real-time subscriptions for live updates
- Optimistic updates with TanStack Query
- Automatic error handling and retry logic
- Connection pooling and caching
```

### UI Component System
```typescript
// Comprehensive component library
- shadcn/ui base components
- Custom nutrition-specific components
- Mobile-optimized touch interactions
- Dark/light theme support
- Responsive grid layouts
```

## Key Features & Implementation

### 1. Nutrition Tracking
**Implementation**: USDA FoodData Central API integration
- Real-time calorie calculations
- Comprehensive nutrient analysis
- Serving size conversions
- Offline food database caching

### 2. Meal Planning
**Implementation**: Calendar-based interface with drag-and-drop
- Weekly meal scheduling
- Automatic nutrition aggregation
- Recipe integration
- Shopping list generation

### 3. Recipe Management
**Implementation**: Dynamic recipe builder
- Ingredient search and selection
- Automatic nutrition calculation
- Scaling for different serving sizes
- Photo attachment support

### 4. Achievement System
**Implementation**: Event-driven gamification
- Progress tracking algorithms
- Badge and milestone system
- Social sharing capabilities
- Personalized goal setting

### 5. Water Intake Tracking
**Implementation**: Simple logging with visual progress
- Daily goal tracking
- Reminder notifications
- Historical trend analysis
- Integration with health apps

## File Structure & Organization

```
├── client/                     # Frontend application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── ui/           # shadcn/ui base components
│   │   │   ├── Auth/         # Authentication components
│   │   │   ├── Dashboard/    # Dashboard-specific components
│   │   │   └── Navigation/   # Navigation and routing
│   │   ├── pages/            # Main application pages
│   │   │   ├── Dashboard.tsx
│   │   │   ├── CalorieCalculator.tsx
│   │   │   ├── WeeklyLogger.tsx
│   │   │   └── Profile.tsx
│   │   ├── hooks/            # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useNutrition.ts
│   │   │   └── useImageRotation.ts
│   │   ├── lib/              # Utility libraries
│   │   │   ├── supabase.ts   # Database client
│   │   │   ├── api.ts        # API helpers
│   │   │   └── queryClient.ts # React Query config
│   │   └── types/            # TypeScript type definitions
├── server/                    # Development server (legacy)
├── supabase/                  # Database configuration
│   └── migrations/           # Database schema migrations
├── shared/                    # Shared type definitions
└── public/                    # Static assets
```

## Component Details

### Core Pages

#### Dashboard
- **Purpose**: Main nutrition overview and daily tracking
- **Features**: Calorie progress rings, recent meals, quick actions
- **Data Sources**: User profile, daily logs, achievement progress
- **Real-time Updates**: Live calorie calculations, water intake

#### Calorie Calculator
- **Purpose**: Food search and calorie calculation tool
- **Features**: USDA food search, serving size conversion, nutrition facts
- **API Integration**: USDA FoodData Central with local caching
- **Offline Support**: Cached food database for offline calculations

#### Weekly Logger
- **Purpose**: Meal planning and weekly nutrition overview
- **Features**: Calendar interface, meal scheduling, nutrition aggregation
- **Data Persistence**: Real-time sync with Supabase
- **Mobile Optimization**: Touch-friendly drag-and-drop interface

#### Profile Management
- **Purpose**: User settings, goals, and account management
- **Features**: Personal info, nutrition goals, privacy settings
- **Theme Support**: Light/dark mode toggle
- **Data Security**: Encrypted personal information storage

### Utility Components

#### Authentication Wrapper
- **Purpose**: Manages authentication state across the app
- **Features**: Auto-login, session persistence, logout handling
- **Security**: JWT token validation and refresh
- **Error Handling**: Authentication error recovery

#### Image Rotation System
- **Purpose**: Dynamic food image backgrounds
- **Features**: Automatic rotation on app open/close
- **Performance**: Lazy loading and image optimization
- **Customization**: User-configurable rotation settings

#### Navigation System
- **Purpose**: Mobile-first bottom tab navigation
- **Features**: Active state management, smooth transitions
- **Accessibility**: Screen reader compatibility
- **PWA Integration**: Native app-like navigation experience

## Data Flow Architecture

### Authentication Flow
```
1. User Login → Supabase Auth → JWT Token
2. Token Storage → Local Storage + HTTP-Only Cookies
3. API Requests → Automatic token attachment
4. Token Refresh → Background renewal process
5. Logout → Token invalidation + cleanup
```

### Nutrition Data Flow
```
1. Food Search → USDA API + Local Cache
2. Selection → Nutrition Calculation Engine
3. Logging → Supabase Database + Optimistic UI
4. Aggregation → Daily/Weekly Summary Calculation
5. Display → Real-time Progress Updates
```

### Real-time Updates
```
1. Database Change → Supabase Real-time Event
2. Event Processing → TanStack Query Cache Invalidation
3. UI Update → Automatic Component Re-render
4. Optimistic Updates → Immediate UI Feedback
5. Error Recovery → Automatic retry with fallback
```

## Security & Privacy

### Data Protection
- **Encryption**: AES-256 encryption for sensitive data
- **Access Control**: Row Level Security policies
- **Authentication**: Multi-factor authentication support
- **Privacy**: GDPR-compliant data handling

### API Security
- **Rate Limiting**: Automatic request throttling
- **Input Validation**: Zod schema validation
- **SQL Injection Protection**: Parameterized queries
- **CORS Configuration**: Restricted cross-origin requests

## Performance Optimization

### Frontend Performance
- **Code Splitting**: Lazy loading for route-based chunks
- **Image Optimization**: WebP format with fallbacks
- **Caching Strategy**: Service worker with cache-first approach
- **Bundle Size**: Tree shaking and minification

### Database Performance
- **Indexing**: Optimized indexes for common queries
- **Connection Pooling**: Supabase managed connections
- **Query Optimization**: Efficient SQL queries with joins
- **Caching**: Redis-based query result caching

## Deployment & Scaling

### Serverless Architecture Benefits
- **Auto-scaling**: Automatic traffic-based scaling
- **Zero Maintenance**: Managed infrastructure
- **Global Distribution**: Edge network deployment
- **Cost Optimization**: Pay-per-use pricing model

### PWA Deployment
- **Service Worker**: Offline functionality and caching
- **Web App Manifest**: Native app installation
- **Push Notifications**: Meal reminders and achievements
- **Background Sync**: Offline data synchronization

## Development Workflow

### Local Development
```bash
npm run dev        # Start development server
npm run build      # Production build
npm run preview    # Preview production build
npm run test       # Run test suite
```

### Database Management
```bash
npx supabase migration new <name>  # Create new migration
npx supabase db push               # Apply migrations
npx supabase db reset              # Reset local database
```

### Environment Configuration
- **Development**: Local Supabase instance
- **Staging**: Supabase staging project
- **Production**: Supabase production project
- **Secrets Management**: Replit Secrets for API keys

This architecture provides a scalable, maintainable, and secure foundation for the Bytewise nutrition tracking application with modern web development best practices.