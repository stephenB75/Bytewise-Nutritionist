# ByteWise Nutrition Tracker

## Overview
ByteWise is a comprehensive Progressive Web App (PWA) for nutrition tracking, meal planning, and recipe building. Its purpose is to help users achieve health goals through an intuitive, mobile-first interface, emphasizing professional mobile interactions and a robust CSS system. The application focuses on real-time data and user-centric design for personal health management.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes (August 2025)
- **Code Cleanup & Optimization**: Comprehensive code cleanup completed with proper TypeScript interfaces, consolidated notification system, removed unused imports (Flame, Calendar, Settings icons restored where needed), optimized state management with typed interfaces (Achievement, Notification, ProfileSection, TrackingView), and unified notification handling with addNotification utility function.
- **Enhanced Type Safety**: Added proper TypeScript interfaces for all data structures, replacing `any` types with specific typed interfaces for better code maintainability and development experience.
- **Advanced Page Animation System**: Implemented comprehensive directional slide animations for all page transitions with intelligent direction detection based on tab order (700ms duration with ease-out timing), enhanced tab change handling with previousTab state tracking, and smooth fade-in effects combined with contextual slide directions (left/right/bottom) for premium user experience.
- **Full-Height Background System (August 4, 2025)**: Successfully implemented consistent full-height background images across all pages using hero-container and hero-background CSS classes with proper viewport dimensions (100vh/100vw), smooth transition effects (800ms duration), and reliable CDN food images. Fixed critical positioning issue by changing hero-container from fixed to relative positioning, ensuring proper layout without conflicts.
- **Vertical Scroll Restoration (August 4, 2025)**: Fixed vertical scrolling functionality by removing overflow-hidden from main container div. Hero sections now properly allow natural page scrolling to content sections while maintaining all visual styling and background systems.
- **Hero Component Optimization (August 4, 2025)**: Completed comprehensive cleanup of hero components without changing look or functionality. Streamlined component interfaces by removing unused props (children parameter from HeroSection, ProgressCard), optimized MicronutrientCard with automatic percentage calculation, restructured home page hero section to include ByteWise logo directly, and improved code maintainability while preserving all animations, styling, and user interactions.
- **Profile Page Redesign (August 5, 2025)**: Successfully redesigned profile page to match dark theme styling of other pages. Added user info card with profile picture and stats, redesigned navigation as gradient cards (Profile, Awards, Data), updated UserSettingsManager with dark theme styling and glass-morphism effects, cleaned up unused imports and props, and improved overall visual hierarchy while preserving all functionality including profile editing, achievements viewing, and data export features.
- **SignOnModule Brand Styling Update (August 5, 2025)**: Updated SignOnModule component to use consistent ByteWise dark theme styling with glass-morphism card design, dark backgrounds with white/10 opacity, gradient icon buttons, and proper text colors matching the rest of the application. Removed white backgrounds and light theme elements for unified brand experience.

## System Architecture

### UI/UX Decisions
- **Design System**: Bytewise brand identity with League Spartan, Work Sans, and Quicksand fonts.
- **Styling**: Tailwind CSS with shadcn/ui component library, an enhanced CSS system for consistent spacing, touch interactions (44px min touch targets), drag & drop, and smooth animations. Brand colors include #faed39 (yellow), #1f4aa6 (blue), #45c73e (green), #0a0a00 (background).
- **Mobile-First Design**: PWA with touch-optimized interfaces, seamless header-hero integration, bottom tab navigation, and safe area support.
- **Theme System**: CSS variables with light/dark mode support.
- **Visuals**: Faded pattern backgrounds for hero components, high-quality food images, glass-morphism effects, rotating food background images, and a ByteWise CSS logo.
- **Iconography**: Professional Lucide React icons for navigation.

### Technical Implementations
- **Frontend Framework**: React 18 with TypeScript.
- **Backend Architecture**: Custom Express.js server with Supabase backend-as-a-service.
- **State Management**: TanStack Query for server state, React hooks for local state.
- **Database**: PostgreSQL with Supabase, Row Level Security (RLS) policies, real-time subscriptions, and Drizzle Kit for schema migrations.
- **Authentication**: Supabase Auth with email/password and OAuth providers (Google, GitHub), JWT-based sessions.
- **API**: Custom Express routes with Supabase integration, USDA FoodData Central service.
- **Data Models**: Users, Foods (with USDA data), Recipes, Meals, Water Intake, Achievements, Calorie Calculations.

### Feature Specifications
- **PWA Capabilities**: Offline functionality, installable, service worker for caching and push notifications.
- **Real-time Updates**: Optimistic updates via TanStack Query.
- **Component Library**: Extensive shadcn/ui base components augmented with custom nutrition-specific components (e.g., progress rings, meal cards).
- **Enhanced Nutrition Analysis**: USDA-powered calorie calculations using comprehensive CSV datasets with food-specific conversion factors (e.g., precise protein conversion factors, food-type-specific calorie conversion factors), precise portion weights, and detailed nutritional breakdowns. Includes a professional ingredient database with accurate weight conversions and advanced measurement parsing system supporting fractions and food-specific portions, comprehensive USDA measure units, microbe data, lab methods, and cooking retention factors.
- **Meal Logging**: Real-time nutrition calculations and dashboard updates.
- **Recipe Creation**: Dynamic nutrition calculation as ingredients are added.
- **Tracking**: Daily goals, aggregated consumption, calendar view for historical data, and weekly calorie breakdown.
- **User Profile**: Comprehensive profile with personal info, preferences, and an achievement system. Consolidated user settings manager with tabbed navigation (Profile/Account/Privacy).
- **Data Management**: Server-side persistence with real-time updates and PDF export system for progress reports using jsPDF.
- **Native Mobile Support**: Android and iOS support using Capacitor framework with relevant mobile plugins.
- **User Interaction**: Notification bell icon with dropdown functionality, confetti celebrations for daily/weekly goals.

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

### Development Tools
- `vite`: Frontend build tool and development server.
- `typescript`: Language for type safety.
- `tsx`: TypeScript execution for Node.js.
```