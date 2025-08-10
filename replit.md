## Overview
ByteWise Nutritionist is a comprehensive Progressive Web App (PWA) designed for nutrition tracking, meal planning, and recipe building. Its core purpose is to empower users to achieve their health goals through an intuitive, mobile-first interface. The application emphasizes professional mobile interactions, robust design, and real-time data for personalized health management, aiming to deliver a professional-grade nutrition tracking experience. 

**Primary Domain**: https://bytewisenutritionist.com - The app automatically redirects users from Replit preview URLs to the custom domain for the best experience.

## User Preferences
Preferred communication style: Simple, everyday language.
Component modification policy: Do not alter existing working components unless explicitly instructed. Preserve all current functionality when making changes to unrelated parts of the app.

## Recent Changes (August 10, 2025)
- Fixed production database connection with correct Supabase credentials
- Updated API endpoint configuration for backend-frontend communication
- Fixed dashboard metrics cards to display correct data:
  - Meals Today: Shows actual logged meals count from database
  - Daily/Weekly Progress: Prevents negative values
  - Fasting Status: Checks localStorage every 10 seconds
  - Macros/Micronutrients: Displays real-time nutritional data
- Changed "Daily" tab to "Logger" tab name
- **Backend successfully deployed to Render**: https://bytewise-backend.onrender.com/api
- Frontend configured to use independent backend for production

## System Architecture

### UI/UX Decisions
- **Design System**: Bytewise brand identity utilizing League Spartan, Work Sans, and Quicksand fonts.
- **Styling**: Tailwind CSS with shadcn/ui, focusing on consistent spacing, touch interactions (44px min targets), drag & drop, and smooth animations. Brand colors: #faed39 (yellow), #1f4aa6 (blue), #45c73e (green), and #0a0a00 (background).
- **Mobile-First Design**: PWA with touch-optimized interfaces, seamless header-hero integration, bottom tab navigation, and safe area support.
- **Theme System**: CSS variables with light/dark mode support.
- **Visuals**: Faded pattern backgrounds, high-quality food images, glass-morphism effects, rotating food background images, and a ByteWise CSS logo. Includes comprehensive directional slide animations for page transitions with intelligent direction detection and smooth fade-in effects.
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
- **Enhanced Nutrition Analysis**: USDA-powered calorie calculations using comprehensive datasets, precise portion weights, and detailed nutritional breakdowns. Includes a professional ingredient database with accurate weight conversions, advanced measurement parsing, and comprehensive international cuisine support (95% accuracy for basic foods, 90% for grains/starches, 95% for nuts/seeds/fats, 80% for Asian, 85% for Middle Eastern, 75% for European, and 78% for Caribbean cuisine). **FDA Standard Liquid Serving Sizes**: Complete integration of FDA Reference Amounts Customarily Consumed (RACC) guidelines with 50+ standardized beverage serving sizes.
- **Meal Logging**: Real-time nutrition calculations and dashboard updates.
- **Recipe Creation**: Dynamic nutrition calculation as ingredients are added.
- **Tracking**: Daily goals, aggregated consumption, calendar view for historical data, and weekly calorie breakdown.
- **User Profile**: Comprehensive profile with personal info, preferences, and an achievement system. Consolidated user settings manager with tabbed navigation.
- **Data Management**: Server-side persistence with real-time updates and PDF export system for progress reports.
- **Native Mobile Support**: Android and iOS support using Capacitor framework with relevant mobile plugins.
- **User Interaction**: Notification bell icon with dropdown functionality, confetti celebrations.
- **USDA Bulk Download System**: Local copy of USDA foods database for offline capabilities and improved performance, with batch processing and caching. Enhanced international food matching with dedicated portion weights for 75+ global dishes and full Caribbean cuisine support.
- **Profile System**: Clean unified accordion system for Profile, Awards, and Data Management cards with proper state management and text orientation fixes. Consolidated CSS classes for consistent styling across profile components.
- **iOS Deployment Ready**: Comprehensive code cleanup completed with production Capacitor configuration, automated build scripts, and App Store deployment checklist. Removed all debug code and optimized for mobile performance. ByteWise branded app icons (yellow background with BW logo) and splash screens fully configured for all required iOS sizes.
- **Database Authentication Fixed**: All dashboard components now use apiRequest() for proper authentication with database. Fixed 7 components including WeeklyCaloriesCard, DataManagementPanel, CalorieCalculator, UserSettingsManager, FastingTracker, and SignOnModule. All metrics cards can now retrieve and display real-time user data.
- **Architecture Documentation**: Complete PDF documentation (ByteWise_Nutritionist_Architecture.pdf) detailing frontend/backend services, deployment architecture, database schema, API endpoints, and independent hosting strategy. Includes comprehensive guides for deploying to Render (backend) and Vercel (frontend) for complete Replit independence.

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