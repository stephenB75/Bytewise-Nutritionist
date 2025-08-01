# ByteWise Nutrition Tracker

## Overview
ByteWise is a comprehensive Progressive Web App (PWA) designed for nutrition tracking, meal planning, and recipe building. It aims to help users achieve their health goals through an intuitive, mobile-first interface. The application emphasizes professional mobile interactions using a complete shadcn/ui component library and an enhanced CSS system, providing a robust solution for personal health management with a focus on real-time data and user-centric design.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
- **Design System**: Bytewise brand identity with League Spartan, Work Sans, and Quicksand fonts.
- **Styling**: Tailwind CSS with shadcn/ui component library, enhanced CSS system for consistent spacing, touch interactions (44px min touch targets), drag & drop, and smooth animations.
- **Mobile-First Design**: PWA with touch-optimized interfaces, seamless header-hero integration, bottom tab navigation, and safe area support.
- **Theme System**: CSS variables with light/dark mode support.
- **Visuals**: Faded pattern backgrounds for hero components, high-quality food images.

### Technical Implementations
- **Frontend Framework**: React 18 with TypeScript.
- **Backend Architecture**: Serverless with Supabase backend-as-a-service.
- **State Management**: TanStack Query for server state, React hooks for local state.
- **Database**: PostgreSQL with Supabase, Row Level Security (RLS) policies, real-time subscriptions.
- **Authentication**: Supabase Auth with email/password and OAuth providers (Google, GitHub), JWT-based sessions.
- **API**: Supabase client-side API with TypeScript types, USDA FoodData Central integration.
- **Data Models**: Users, Foods (with USDA data), Recipes, Meals, Water Intake, Achievements, Calorie Calculations.

### Feature Specifications
- **PWA Capabilities**: Offline functionality, installable, service worker for caching and push notifications.
- **Real-time Updates**: Optimistic updates via TanStack Query.
- **Component Library**: Extensive shadcn/ui base components augmented with custom nutrition-specific components (e.g., progress rings, meal cards).
- **Nutrition Analysis**: USDA-powered calorie calculations with measurement conversions and detailed nutritional breakdowns.
- **Meal Logging**: Real-time nutrition calculations and dashboard updates.
- **Recipe Creation**: Dynamic nutrition calculation as ingredients are added.
- **Tracking**: Daily goals, aggregated consumption, calendar view for historical data.
- **User Profile**: Comprehensive profile with personal info, preferences, and achievement system.
- **Data Management**: Server-side persistence with real-time updates, Drizzle Kit for schema migrations.

## External Dependencies

### Database & Infrastructure
- `@neondatabase/serverless`: PostgreSQL connection.
- `drizzle-orm`: Type-safe database operations.
- `connect-pg-simple`: PostgreSQL session storage.

### UI & Styling
- `@radix-ui/*`: Headless UI primitives.
- `tailwindcss`: Utility-first CSS framework.
- `class-variance-authority`: Component variant management.
- `lucide-react`: Icon system.

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

## Recent Changes

### January 2025 - Serverless Architecture Migration
✓ **Supabase Integration**: Complete migration from Express.js to Supabase backend-as-a-service
✓ **Authentication System**: Replaced Replit OIDC with Supabase Auth supporting email/password and OAuth providers
✓ **Database Migration**: PostgreSQL with Row Level Security policies, real-time subscriptions, and automatic scaling
✓ **TypeScript API Layer**: Type-safe client-side API with generated database types and error handling
✓ **Serverless Functions**: USDA API integration moved to client-side with proper environment variable handling
✓ **Security Enhancement**: JWT-based authentication, RLS policies, and secure environment variable management
✓ **Development Workflow**: Simplified deployment with zero server maintenance and automatic scaling
✓ **Authentication Enhancement**: Rotating background images system for login screen similar to hero components
✓ **Professional Ingredient Database**: Enhanced with Kitchen to Table and Shamrock Foods conversion standards
  - 8 categories with 25+ ingredients and precise weight conversions
  - Professional fractional cup measurements (3/4, 2/3, 1/2, 1/3, 1/4 cups)
  - Baking ingredient precision (cocoa powder, baking soda, vanilla extract)
  - Industry-standard can sizes and drain weights for commercial cooking
  - Smart ingredient search with diet type badges and category indicators
  - Unit conversion system with precision accuracy indicators