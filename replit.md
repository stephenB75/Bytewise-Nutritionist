# ByteWise Nutritionist

## Overview

ByteWise Nutritionist is a comprehensive Progressive Web App (PWA) for nutrition tracking and meal planning. Built with modern web technologies, it integrates with the USDA food database to provide accurate nutritional information and offers features including meal logging, calorie tracking, progress analytics, and achievement systems. The application is designed for both web and mobile deployment with full PWA capabilities and cross-platform compatibility.

**Current Status**: BETA v1.3.0 (August 13, 2025) - **PRODUCTION READY** - Critical date logging bug resolved. Food entries now display correct local dates instead of server UTC dates. Enhanced timezone detection using browser APIs with automatic correction of existing meal data. Weekly summary and progress tracking now show accurate date information.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side application is built using React with TypeScript, leveraging Vite as the build tool for optimal performance. The UI framework utilizes Tailwind CSS for styling with shadcn/ui component library for consistent design patterns. The application implements a mobile-first responsive design with PWA capabilities including offline functionality, service worker caching, and native app-like experiences.

**Key Design Decisions:**
- **React + TypeScript**: Chosen for type safety and modern development experience
- **Vite Build System**: Selected for fast development builds and optimized production bundles
- **Tailwind CSS**: Provides utility-first styling with excellent mobile responsiveness
- **PWA Implementation**: Service worker handles offline caching and background sync

### Backend Architecture
The server architecture follows a Node.js/Express pattern with TypeScript, designed for serverless deployment compatibility. The backend serves as both an API server and static file host, with middleware for authentication, CORS handling, and security headers.

**Core Components:**
- **Express Server**: Handles API routing and static file serving
- **Authentication Middleware**: Supabase-based JWT token verification
- **Storage Layer**: Abstracted database operations through a storage service pattern
- **USDA Service Integration**: External API integration for food database queries

### Data Storage Solutions
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations. The schema includes comprehensive tables for users, foods, meals, recipes, achievements, and tracking data.

**Database Architecture:**
- **Drizzle ORM**: Provides type-safe SQL operations with schema validation
- **PostgreSQL**: Robust relational database with JSON field support for flexible data
- **Neon Database**: Cloud-hosted PostgreSQL with HTTP-based connections for serverless compatibility
- **Local Storage**: Client-side caching for offline functionality and performance

### Authentication and Authorization
Authentication is handled through Supabase Auth with JWT token-based session management. The system supports email/password authentication with email verification requirements.

**Security Implementation:**
- **Supabase Authentication**: Handles user registration, login, and session management
- **JWT Token Verification**: Server-side middleware validates tokens on protected routes
- **Session Management**: Secure session storage with appropriate expiration handling
- **Email Verification**: Required for account activation to ensure valid user accounts

### External Dependencies

#### Third-Party Services
- **Supabase**: Authentication service providing user management and JWT tokens
- **USDA FoodData Central API**: Government food database for accurate nutritional information
- **Neon Database**: Cloud PostgreSQL hosting with serverless-friendly HTTP connections

#### Development and Deployment
- **Vite**: Frontend build tool and development server
- **Drizzle Kit**: Database migration and schema management
- **Capacitor**: Mobile app framework for iOS and Android deployment
- **Railway/Replit**: Cloud deployment platforms with automatic scaling

#### UI and Styling
- **Radix UI**: Accessible component primitives for complex UI elements
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **React Hook Form**: Form handling with validation and error management
- **Zod**: Runtime type validation for forms and API responses

#### Performance and PWA
- **Service Worker**: Custom implementation for offline caching and background sync
- **React Query/TanStack Query**: Server state management and caching
- **Web App Manifest**: PWA configuration for native app installation

### Recent Changes (BETA v1.3.0)

#### Critical Date Bug Resolution
- **Root Cause**: Food entries were being logged with server UTC timestamps instead of user's local timezone dates
- **Impact**: Meals logged "today" appeared on the wrong day (e.g., Wednesday entries showing as Thursday)
- **Solution**: Implemented browser-based timezone detection using `Intl.DateTimeFormat` API for accurate local date calculation
- **Auto-Correction**: Added automatic detection and correction system for existing incorrectly dated meal entries
- **Enhanced Components**: Updated `WeeklyCaloriesCard`, `getLocalDateKey()`, and meal date validation logic

#### Technical Implementation
- **Timezone Detection**: Uses `Intl.DateTimeFormat().resolvedOptions().timeZone` for user's actual timezone
- **Date Utilities**: Enhanced `getLocalDateKey()` function with proper timezone conversion
- **Debugging Tools**: Added comprehensive timezone debugging utility for development support
- **Data Migration**: Automatic correction of existing meal data with wrong dates

#### Navigation UX Enhancement (BETA v1.3.0)
- **Scroll Reset Functionality**: Enhanced `handleTabChange()` function with automatic scroll-to-top behavior
- **Root Cause Resolved**: Fixed CSS `scroll-behavior: smooth` interference with instant scroll attempts
- **Smooth Navigation**: When switching between pages, view instantly scrolls back to hero component
- **Universal Implementation**: All navigation elements (bottom tabs, hero buttons, logo) use enhanced handler
- **Technical Solution**: Temporarily disables smooth scrolling during navigation, forces instant scroll, then restores smooth behavior
- **User Experience**: Consistent instant scroll reset behavior across all app sections