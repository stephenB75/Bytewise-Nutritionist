# ByteWise Nutrition Tracker

## Overview

ByteWise is a comprehensive nutrition tracking application built as a Progressive Web App (PWA). The application allows users to track their nutrition, plan meals, build recipes, and achieve their health goals through an intuitive mobile-first interface. The app features a complete shadcn/ui component library and enhanced CSS system for professional mobile interactions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with complete shadcn/ui component library
- **Design System**: Bytewise brand identity with League Spartan, Work Sans, and Quicksand fonts
- **State Management**: TanStack Query for server state, React hooks for local state
- **Mobile-First Design**: PWA with touch-optimized interfaces and seamless header-hero integration
- **Components**: 30+ shadcn/ui components with custom nutrition-specific components

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Development**: Vite for frontend bundling, tsx for TypeScript execution
- **Session Management**: Express sessions with PostgreSQL store
- **API**: RESTful endpoints with authentication middleware

### Database Architecture
- **Primary Database**: PostgreSQL with Drizzle ORM
- **Connection**: Neon Database serverless PostgreSQL
- **Schema**: Strongly typed with Drizzle and Zod validation
- **Migrations**: Drizzle Kit for schema management
- **Data Storage**: Server-side persistence with real-time updates

## Key Components

### Authentication System
- **Provider**: Replit OIDC authentication
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Security**: HTTP-only cookies, CSRF protection
- **User Management**: Automatic user creation and profile management

### Data Models
- **Users**: Profile information, nutrition goals, preferences
- **Foods**: Comprehensive nutrition database with USDA data
- **Recipes**: User-created recipes with calculated nutrition
- **Meals**: Logged food consumption with timestamps
- **Water Intake**: Daily hydration tracking

### UI/UX Features
- **Progressive Web App**: Offline capabilities, installable
- **Touch Interactions**: Drag-and-drop for ingredient management
- **Real-time Updates**: Optimistic updates with TanStack Query
- **Mobile Navigation**: Bottom tab navigation with safe area support
- **Theme System**: CSS variables with light/dark mode support

### Component Library
- **Base**: Complete shadcn/ui component library (30+ components) built on Radix UI primitives
- **Core Components**: Button, Input, Card, Dialog, Tabs, Calendar, Carousel, Form, etc.
- **Navigation**: Pagination, Breadcrumb, Navigation Menu, Sidebar
- **Layout**: Resizable panels, Separator, Aspect Ratio
- **Feedback**: Toast, Progress, Hover Card, Tooltip
- **Custom Components**: Nutrition-specific components (progress rings, meal cards)
- **Typography**: Custom font system with League Spartan, Quicksand, and Work Sans
- **Icons**: Lucide React icon library

### Enhanced Styling System
- **Brand Spacing**: Consistent spacing system with mobile-optimized values (xs: 2px to 4xl: 32px)
- **Touch Interactions**: 44px minimum touch targets, hover effects, and tap feedback
- **Drag & Drop**: Enhanced drag states with visual feedback and auto-scroll support
- **Animations**: Smooth transitions, gentle bounces, and fade effects
- **Mobile PWA**: Safe area support, touch-friendly scrolling, and app-like interactions
- **Accessibility**: Reduced motion support, proper focus states, and color contrast

## Data Flow

### Meal Logging Flow
1. User searches for foods via REST API
2. Food selection adds to current meal
3. Nutrition calculations update in real-time
4. Meal submission creates database entries
5. Dashboard updates automatically via query invalidation

### Recipe Creation Flow
1. User builds recipe by adding ingredients
2. Nutrition totals calculate dynamically
3. Recipe saves to database with calculated values
4. Recipe becomes available for meal logging

### Nutrition Tracking Flow
1. Daily goals retrieved from user profile
2. Consumed nutrition aggregated from logged meals
3. Progress indicators update in real-time
4. Calendar view shows historical data

## External Dependencies

### Database & Infrastructure
- **@neondatabase/serverless**: PostgreSQL connection
- **drizzle-orm**: Type-safe database operations
- **connect-pg-simple**: Session storage

### UI & Styling
- **@radix-ui/***: Headless UI primitives
- **tailwindcss**: Utility-first styling
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon system

### Data & State
- **@tanstack/react-query**: Server state management
- **zod**: Runtime type validation
- **date-fns**: Date manipulation

### Authentication
- **openid-client**: OIDC authentication
- **passport**: Authentication middleware
- **express-session**: Session management

### Development
- **vite**: Build tool and dev server
- **typescript**: Type safety
- **tsx**: TypeScript execution

## Deployment Strategy

### Development Environment
- **Hot Reloading**: Vite dev server with React Fast Refresh
- **Type Checking**: Real-time TypeScript compilation
- **Database**: Development database with hot schema reloading

### Production Build
- **Frontend**: Static asset generation via Vite
- **Backend**: Single bundle via esbuild for Node.js
- **Assets**: Optimized images and fonts
- **PWA**: Service worker for offline functionality

### Database Management
- **Schema Evolution**: Drizzle migrations for schema changes
- **Connection Pooling**: Neon serverless with connection pooling
- **Environment Variables**: Secure credential management

### Security Considerations
- **HTTPS Only**: Secure cookie transmission
- **CSRF Protection**: Double-submit cookie pattern
- **Input Validation**: Zod schemas for all user inputs

## Recent Changes

### Major System Updates (January 2025)
- **Enhanced Component Integration**: Successfully integrated CalorieCalculator, Profile, Calendar, and MealLogger components with consistent Bytewise design
- **Food Database System**: Created FoodDatabaseProvider with unified API access for food search and nutrition data
- **Notification System**: Implemented NotificationProvider with toast notifications for meal logging and user feedback
- **API Route Fixes**: Fixed "Invalid meal ID" error by adding proper /api/meals/today endpoint in server routes
- **Recipe Builder Enhancement**: Replaced RecipeBuilder with CalorieCalculator for comprehensive meal logging functionality
- **Provider Hierarchy**: Updated App.tsx with proper provider chain (FoodDatabase + Notification + DragDrop)
- **Profile Management**: Enhanced profile screen with editable calorie goals, achievement tracking, and account settings
- **Calendar Integration**: Added meal calendar with date-based nutrition tracking and visual meal indicators
- **Mobile-First Design**: All new components follow Bytewise brand guidelines with pastel color scheme and responsive layouts
- **Enhanced CSS Styling System**: Updated globals.css with mobile-optimized typography, animations, and comprehensive UI component overrides
- **Brand System Guidelines**: Implemented comprehensive design system with League Spartan, Work Sans, and Quicksand fonts

## Recent Implementation Updates

### December 2024 - Bytewise Design System Implementation
✓ Implemented complete Bytewise design system with brand typography (League Spartan, Work Sans, Quicksand)  
✓ Created LogoBrand component with precise character-based alignment system  
✓ Added seamless hero components with header integration across Dashboard and MealLogger  
✓ Updated color scheme to use Bytewise brand colors (pastel blue #a8dadc)  
✓ Enhanced all components with mobile-first responsive design and touch interactions  
✓ Fixed all TypeScript errors and implemented proper ImageWithFallback utility  
✓ Added Header component with fixed navigation and LogoBrand integration  
✓ Completed PWA-ready architecture with offline-capable design patterns  

### Current Architecture Status
- **Database**: PostgreSQL with Drizzle ORM for server-side persistence
- **Authentication**: Replit OIDC with session management  
- **State Management**: TanStack Query for server state, Context providers for app state
- **Component Library**: Complete shadcn/ui integration with custom Bytewise components
- **API Routes**: RESTful endpoints including meals, foods, recipes, and user management
- **Food Database**: Integrated USDA nutrition data with search capabilities
- **Meal Logging**: Real-time nutrition tracking with measurement options and calorie calculations

### Data Architecture Note
This implementation uses **server-side database storage** (PostgreSQL + Drizzle ORM) with Replit authentication, not localStorage. The application now features a complete meal logging system with the CalorieCalculator component providing food search, nutrition calculations, and meal tracking functionality.

The application is designed for mobile-first usage with PWA capabilities, allowing users to track nutrition on-the-go while maintaining a comprehensive web experience.