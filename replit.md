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
- **Enhanced Nutrition Analysis**: USDA-powered calorie calculations using comprehensive CSV datasets with food-specific conversion factors, precise portion weights, and detailed nutritional breakdowns. Professional ingredient database with accurate weight conversions and advanced measurement parsing system supporting fractions and food-specific portions.
- **Meal Logging**: Real-time nutrition calculations and dashboard updates.
- **Recipe Creation**: Dynamic nutrition calculation as ingredients are added.
- **Tracking**: Daily goals, aggregated consumption, calendar view for historical data.
- **User Profile**: Comprehensive profile with personal info, preferences, and achievement system.
- **Data Management**: Server-side persistence with real-time updates, Drizzle Kit for schema migrations.
- **Reporting**: PDF export system for progress reports.
- **Native Mobile Support**: Android and iOS support using Capacitor framework with relevant mobile plugins.

## Recent Major Enhancements
✓ **Comprehensive USDA Data Integration**: Implemented 10 complete USDA CSV datasets totaling 50,000+ food records for maximum nutrition accuracy
✓ **Food-Specific Conversion Factors**: Integrated precise calorie conversion factors (protein: 2.44-4.27, fat: 8.37-9.02, carbs: 3.57-4.16) based on food type replacing generic 4-9-4 formula  
✓ **Precise Portion Database**: Added accurate portion-to-gram conversions from USDA food portion data (e.g., medium apple = 182g, large banana = 136g)
✓ **Cooking Retention Factors**: Implemented nutrient retention calculations for different cooking methods (baking, boiling, steaming, frying, grilling)
✓ **Food Classification System**: Enhanced food categorization using USDA FNDDS survey data for improved nutritional analysis
✓ **Advanced Measurement Parsing**: Enhanced measurement recognition with support for fractions, food-specific portions, and comprehensive unit conversions
✓ **Real-Time Nutrition Calculations**: All calorie calculations now use authentic USDA data with cooking adjustments for meal logging and recipe building

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