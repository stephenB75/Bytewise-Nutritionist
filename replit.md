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
✓ **Complete USDA Database Integration**: Implemented 17 comprehensive USDA CSV datasets totaling 275,000+ records including microbe data, lab methods, protein factors, and complete nutrient profiles
✓ **Food-Specific Protein Conversion**: Integrated precise protein conversion factors (dairy: 6.38, nuts: 5.46, legumes: 5.30, grains: 5.83-5.95) replacing generic 6.25 formula
✓ **Enhanced Calorie Conversion Factors**: Food-type-specific factors (protein: 2.44-4.27, fat: 8.37-9.02, carbs: 3.57-4.16) for maximum accuracy
✓ **Comprehensive Measure Units**: Added 124 USDA measure units with intelligent food-specific unit suggestions and validation
✓ **Probiotic and Microbe Tracking**: Integrated USDA microbe database for probiotic strain identification and health benefit analysis
✓ **Advanced Lab Method Validation**: 285 analytical methods for data quality assurance and calculation transparency
✓ **Cooking Retention Factors**: Nutrient retention calculations for different cooking methods with food-group-specific adjustments
✓ **Complete Nutrient Database**: 479 nutrients with proper categorization, validation ranges, and formatting standards
✓ **Real-Time Enhanced Calculations**: All nutrition calculations use authentic USDA data with cooking adjustments, protein factors, and comprehensive validation
✓ **React Import Issues Resolution**: Fixed all "Cannot read properties of null (reading 'useState')" errors across 10+ components by removing problematic React import patterns
✓ **Visual Redesign Activation**: Successfully deployed complete visual redesign with rotating backgrounds, interactive progress rings, and ADHD-friendly design elements (August 2025)  
✓ **Fresh Start Redesign**: Created completely new interface from scratch keeping only calorie calculator function, featuring auto-rotating themes, modern card design, and streamlined user experience (August 2025)  
✓ **Complete Modern Redesign**: Implemented comprehensive UI overhaul with glass-morphism effects, rotating food background images, ByteWise CSS logo integration, bottom tab navigation, and enhanced mobile-first experience while preserving full USDA calorie calculator functionality (August 2025)
✓ **Production-Ready Clean Release**: Eliminated all console errors, fixed TypeScript diagnostics, suppressed browser extension interference, and cleaned debug messages for pristine professional experience (August 2025)
✓ **Brand Standard Hero Layout**: Applied consistent full-screen hero layout pattern to all pages with centered text overlays, high-quality background images, scroll indicators, and content sections completely separated underneath (August 2025)
✓ **Hero Logo Scale Enhancement**: Optimized CSS logo size to 3.825rem (61px) main text and 1.0625rem (17px) tagline for balanced visual hierarchy with hero headings, reduced by 15% for better proportion (August 2025)
✓ **PDF Export Enhancement**: Fixed PDF generation to create actual .pdf files using jsPDF library with CSS logo branding, professional A4 formatting, multi-page support, and high-resolution rendering (August 2025)
✓ **Comprehensive App Redesign**: Removed "bytewise" from header, replaced categories with macro/micro nutrient progress cards, added daily/weekly tracking page with food search bar, eliminated favorites page, updated achievements to goal tracking, implemented discover-style hero layouts across all pages, added profile components (data management, user info, account settings) (August 2025)
✓ **React useState Error Resolution**: Successfully fixed all "Cannot read properties of null (reading 'useState')" errors by removing problematic sign-on module and cleaning component references (August 2025)
✓ **Dynamic URL Configuration**: Fixed all hardcoded URLs to use dynamic environment-aware configuration, ensuring app works correctly on any domain (replit.dev, replit.app, localhost, custom domains) (August 2025)

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