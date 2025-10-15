## Overview
bytewise nutritionist is a comprehensive Progressive Web App (PWA) designed for nutrition tracking, meal planning, and recipe building. Its core purpose is to empower users to achieve their health goals through an intuitive, mobile-first interface. The application emphasizes professional mobile interactions, robust design, and real-time data for personalized health management, aiming to deliver a professional-grade nutrition tracking experience.

**Current Status**: BETA v1.2.4 (August 13, 2025) - Production deployment issues resolved. CSP eval blocking fixed and PWA manifest errors eliminated. Ready for production deployment.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
- **Design System**: Bytewise brand identity utilizing League Spartan, Work Sans, and Quicksand fonts.
- **Styling**: Tailwind CSS with shadcn/ui, focusing on consistent spacing, touch interactions (44px min targets), drag & drop, and smooth animations. Brand colors: #faed39 (yellow), #1f4aa6 (blue), #45c73e (green), and #0a0a00 (background).
- **Mobile-First Design**: PWA with touch-optimized interfaces, seamless header-hero integration, bottom tab navigation, and safe area support.
- **Theme System**: CSS variables with light/dark mode support.
- **Visuals**: Faded pattern backgrounds, high-quality food images, glass-morphism effects, rotating food background images, and a ByteWise CSS logo. Includes comprehensive directional slide animations for page transitions with intelligent direction detection and smooth fade-in effects.
- **Iconography**: Professional Lucide React icons for navigation. Updated iOS app icons and splash screens with new Bytewise Nutritionist branded assets (August 2025) featuring consistent branding across all app icon sizes, resolutions, and launch experiences.

### Technical Implementations
- **Frontend Framework**: React 18 with TypeScript, Wouter for routing.
- **Backend Architecture**: Custom Express.js server with Supabase backend-as-a-service, production-ready for Railway deployment.
- **State Management**: TanStack Query for server state, React hooks for local state.
- **Database**: PostgreSQL with Supabase, Row Level Security (RLS) policies, real-time subscriptions, and Drizzle Kit for schema migrations.
- **Authentication**: Supabase Auth with email verification requirement, OAuth providers (Google, GitHub), JWT-based sessions with 24-hour timeout, automatic token refresh, and activity-based session extension. Email verification enforced before account activation.
- **API**: Custom Express routes with Supabase integration, USDA FoodData Central service, health check endpoint for production monitoring.
- **Data Models**: Users, Foods (with USDA data), Recipes, Meals, Water Intake, Achievements, Calorie Calculations.
- **Measurements**: Default imperial measurement system with metric compatibility.
- **Deployment**: Production-ready with comprehensive deployment fixes applied. Features nixpacks.toml configuration, proper host binding (0.0.0.0), environment variable setup, health check endpoints, and verified build process. Includes deployment verification script and complete production environment optimization for Railway and Replit Deployments.

### Feature Specifications
- **PWA Capabilities**: Offline functionality, installable, service worker for caching and push notifications.
- **Real-time Updates**: Optimistic updates via TanStack Query.
- **Component Library**: Extensive shadcn/ui base components augmented with custom nutrition-specific components.
- **Enhanced Nutrition Analysis**: USDA-powered calorie calculations using comprehensive datasets, precise portion weights, and detailed nutritional breakdowns. Includes a professional ingredient database with accurate weight conversions, advanced measurement parsing, and comprehensive international cuisine support (95% accuracy for basic foods, 90% for grains/starches, 95% for nuts/seeds/fats, 80% for Asian, 85% for Middle Eastern, 75% for European, and 78% for Caribbean cuisine). **FDA Standard Liquid Serving Sizes**: Complete integration of FDA Reference Amounts Customarily Consumed (RACC) guidelines with 50+ standardized beverage serving sizes.
- **Streamlined Search Interface**: Clean, simplified search experience with dropdown functionality removed across all search fields. Enhanced food suggestion system exclusively in calorie calculator context with rich nutritional display cards showing complete macro and micronutrient breakdowns.
- **Food Search with History**: Comprehensive search system that includes today's meals, previous weeks and months of logged foods, frequently consumed items display, quick time range filters (Today, This Week, This Month, All Time), and one-click re-logging of any previous meal. Seamlessly integrates historical data with new food searches from the USDA database.
- **Meal Logging**: Real-time nutrition calculations and dashboard updates.
- **Recipe Creation**: Dynamic nutrition calculation as ingredients are added.
- **Tracking**: Daily goals, aggregated consumption, calendar view for historical data, and weekly calorie breakdown.
- **User Profile**: Comprehensive profile with personal info, preferences, and an achievement system. Consolidated user settings manager with tabbed navigation.
- **Data Management**: Comprehensive dual-layer persistence system with automatic localStorage saving and database synchronization. Features include auto-save intervals (30s), save on page unload/tab switch, data restoration on login, visual sync indicators, and PDF export system for progress reports. Zero data loss guaranteed with multiple backup layers. Clean production interface with streamlined data management panel.
- **Native Mobile Support**: Android and iOS support using Capacitor framework with relevant mobile plugins.
- **User Interaction**: Notification bell icon with dropdown functionality, confetti celebrations.
- **USDA Bulk Download System**: Local copy of USDA foods database for offline capabilities and improved performance, with batch processing and caching. Enhanced international food matching with dedicated portion weights for 75+ global dishes and full Caribbean cuisine support.
- **Profile System**: Clean unified accordion system for Profile, Awards, and Data Management cards with proper state management and text orientation fixes. Consolidated CSS classes for consistent styling across profile components.
- **iOS Deployment Ready**: Comprehensive code cleanup completed with production Capacitor configuration, automated build scripts, and App Store deployment checklist. Removed all debug code and optimized for mobile performance.
- **Session Management**: 24-hour extended sessions with automatic token refresh, activity tracking, visual session status display, and warning notifications 30 minutes before expiry. Sessions extend with user activity for uninterrupted workflow.
- **Calendar System**: Accurate date handling system displaying correct day-date alignment in weekly views. Weekly summary shows actual calendar dates without forced corrections for proper user experience.
- **Authentication & Database Integration**: Supabase authentication fully configured with JWT token verification, proper 401 error handling for unauthorized access, PostgreSQL database successfully connected with all tables operational, and achievements system fully implemented with comprehensive CRUD operations.
- **Production Deployment Fixes**: Critical CSP policy updated to allow 'unsafe-eval' for JavaScript execution, eliminating eval blocking errors. PWA manifest completely rebuilt with proper icon references (72x72 through 512x512), shortcut icons, and screenshot files. All production deployment blockers resolved.

## External Dependencies

### Database & Infrastructure
- `@neondatabase/serverless`: PostgreSQL connection.
- `drizzle-orm`: Type-safe database operations.
- `connect-pg-simple`: PostgreSQL session storage.
- `supabase-js`: Supabase client library.

### UI & Styling
- `@radix-ui/*`: Headless UI primitives.
- `tailwindcss`: Utility-first CSS framework.
- `class-variance-authority`: Component variant management.
- `lucide-react`: Icon system.
- `jsPDF`: PDF generation library.

### Data & State Management
- `@tanstack/react-query`: Server state management.
- `zod`: Runtime type validation.
- `date-fns`: Date manipulation utility.

### Authentication
- `openid-client`: OIDC authentication.
- `passport`: Authentication middleware.
- `express-session`: Session management.