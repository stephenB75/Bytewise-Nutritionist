# ByteWise Nutrition Tracker

## Overview
ByteWise is a comprehensive Progressive Web App (PWA) for nutrition tracking, meal planning, and recipe building. Its purpose is to help users achieve health goals through an intuitive, mobile-first interface, emphasizing professional mobile interactions and a robust CSS system. The application focuses on real-time data and user-centric design for personal health management, aiming to provide a professional-grade nutrition tracking experience.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
- **Design System**: Bytewise brand identity using League Spartan, Work Sans, and Quicksand fonts.
- **Styling**: Tailwind CSS with shadcn/ui component library, emphasizing consistent spacing, touch interactions (44px min touch targets), drag & drop, and smooth animations. Brand colors include #faed39 (yellow), #1f4aa6 (blue), #45c73e (green), and #0a0a00 (background).
- **Mobile-First Design**: PWA with touch-optimized interfaces, seamless header-hero integration, bottom tab navigation, and safe area support.
- **Theme System**: CSS variables with light/dark mode support.
- **Visuals**: Faded pattern backgrounds for hero components, high-quality food images, glass-morphism effects, rotating food background images, and a ByteWise CSS logo. Implemented comprehensive directional slide animations for page transitions with intelligent direction detection and smooth fade-in effects.
- **Iconography**: Professional Lucide React icons for navigation.

### Technical Implementations
- **Frontend Framework**: React 18 with TypeScript.
- **Backend Architecture**: Custom Express.js server with Supabase backend-as-a-service.
- **State Management**: TanStack Query for server state, React hooks for local state.
- **Database**: PostgreSQL with Supabase, Row Level Security (RLS) policies, real-time subscriptions, and Drizzle Kit for schema migrations.
- **Authentication**: Supabase Auth with email/password and OAuth providers (Google, GitHub), JWT-based sessions.
- **API**: Custom Express routes with Supabase integration, USDA FoodData Central service.
- **Data Models**: Users, Foods (with USDA data), Recipes, Meals, Water Intake, Achievements, Calorie Calculations.
- **Measurements**: Default imperial measurement system with metric compatibility.

### Feature Specifications
- **PWA Capabilities**: Offline functionality, installable, service worker for caching and push notifications.
- **Real-time Updates**: Optimistic updates via TanStack Query.
- **Component Library**: Extensive shadcn/ui base components augmented with custom nutrition-specific components.
- **Enhanced Nutrition Analysis**: USDA-powered calorie calculations using comprehensive CSV datasets, precise portion weights, and detailed nutritional breakdowns. Includes a professional ingredient database with accurate weight conversions, advanced measurement parsing system, and comprehensive international cuisine support achieving 80% accuracy for Asian foods, 75% for Middle Eastern, 85% for European, and 78% for Caribbean cuisine with dedicated support for plantains, jerk chicken, rice and beans, patties, and traditional Caribbean breads.
- **Meal Logging**: Real-time nutrition calculations and dashboard updates.
- **Recipe Creation**: Dynamic nutrition calculation as ingredients are added.
- **Tracking**: Daily goals, aggregated consumption, calendar view for historical data, and weekly calorie breakdown.
- **User Profile**: Comprehensive profile with personal info, preferences, and an achievement system. Consolidated user settings manager with tabbed navigation.
- **Data Management**: Server-side persistence with real-time updates and PDF export system for progress reports.
- **Native Mobile Support**: Android and iOS support using Capacitor framework with relevant mobile plugins.
- **User Interaction**: Notification bell icon with dropdown functionality, confetti celebrations.
- **USDA Bulk Download System**: Local copy of USDA foods database for offline capabilities and improved performance, with batch processing and caching. Enhanced international food matching system with dedicated portion weights for 75+ global dishes including falafel (17g/piece), gyoza (15g/piece), pierogi (28g/piece), plantains (179g/medium), beef patty (142g/patty), cassava (103g/cup), and comprehensive scoring penalties to prevent wrong food category matches. Full Caribbean cuisine support with 25+ food synonyms and authentic portion weights.

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