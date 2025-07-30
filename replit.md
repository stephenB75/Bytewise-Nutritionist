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
- **Base**: Complete shadcn/ui component library (50+ components) built on Radix UI primitives
- **Core Components**: Button, Input, Card, Dialog, Tabs, Calendar, Carousel, Form, Checkbox, Switch, Toggle, etc.
- **Navigation**: Pagination, Breadcrumb, Navigation Menu, Sidebar, Menubar, Hover Card
- **Layout**: Resizable panels, Separator, Aspect Ratio, Table, Skeleton, Carousel
- **Feedback**: Toast, Progress, Hover Card, Tooltip, Alert Dialog, Popover
- **Forms**: Form, Toggle Group, Progress, Switch, all input components with validation
- **Data Display**: Chart, Table, Accordion, Sheet, Breadcrumb
- **Custom Components**: Nutrition-specific components (progress rings, meal cards)
- **Typography**: Custom font system with League Spartan, Quicksand, and Work Sans
- **Icons**: Lucide React icon library
- **Mobile Hook**: useIsMobile hook for responsive behavior

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

### Complete Mobile App Redesign (January 2025)
- **Four Main Screens Implementation**: Built Dashboard, Recipe Builder, Meal Planner, and Profile screens following brand guidelines
- **Mobile-First Navigation**: Implemented iOS-style bottom tab navigation with fixed header and seamless transitions
- **Bytewise Brand System**: Complete typography implementation with League Spartan, Work Sans, and Quicksand fonts
- **Hero Component System**: Created reusable HeroSection with progress rings, stat cards, and contextual backgrounds
- **Logo Brand Component**: Precision character-based alignment system for "bytewise" and "Nutritionist" tagline
- **CSS Mobile Optimization**: Enhanced mobile typography, touch targets (44px minimum), and PWA-ready styling
- **Interactive Features**: Real-time nutrition calculations, drag-and-drop ingredients, meal planning, and achievement tracking
- **Component Architecture**: LogoBrand, Header, Navigation, HeroSection, ImageWithFallback for consistent UI patterns
- **PWA Optimizations**: Safe area support, touch interactions, and native app appearance
- **Brand Color Scheme**: Pastel blue (#a8dadc) and yellow (#fef7cd) throughout application
- **Mobile Input Handling**: 16px minimum font sizes to prevent mobile zoom, enhanced form interactions
- **Responsive Layout**: Mobile-first cards, grid systems, and spacing optimized for phone screens

## Recent Implementation Updates

### January 2025 - Recipe Components Replaced with Calorie Calculator & Weekly Logger  
✓ **Replaced Recipe Components**: Removed RecipeBuilder and MealPlanner, replaced with CalorieCalculator and WeeklyLogger modules  
✓ **Enhanced Dashboard**: Added comprehensive daily nutrition metrics card showing macro/micro nutrients with progress tracking  
✓ **Weekly Logger Implementation**: Created weekly meal tracking system to log calories calculated and added as meals by users  
✓ **Navigation Updates**: Updated bottom navigation from "Recipes/Planner" to "Calculator/Logger" for better user flow  
✓ **Calorie Calculator Integration**: Maintained existing USDA-powered calorie calculator functionality without changes  
✓ **Metrics Visualization**: Added detailed macro nutrients (protein, carbs, fat) and micronutrients (fiber, sodium, vitamins) display  

### January 2025 - Enhanced Mobile UI and Imperial System Implementation  
✓ **Faded Background Images**: Added subtle pattern backgrounds to all hero components for visual depth  
✓ **Imperial System Integration**: Updated height inputs to feet/inches and weight inputs to pounds throughout profile  
✓ **Email Confirmation Feature**: Added email verification button with celebration popup for unverified addresses  
✓ **Enhanced Achievement System**: Implemented detailed trophy categories, points system, and achievement celebration popup with confetti  
✓ **Increased Header Height**: Expanded header padding and increased logo sizes for better visual comfort  
✓ **Logo Size Enhancement**: Updated LogoBrand component with larger size variants (sm→md, md→lg, lg→xl)  
✓ **Achievement Celebration Component**: Created popup with trophy icon, confetti animation, and auto-dismissal  
✓ **Calculator Hero Fix**: Added proper HeroSection wrapper to CalorieCalculator with statistics  
✓ **Button Functionality Validation**: Ensured all navigation and action buttons work correctly across all pages  
✓ **Mobile PWA Optimizations**: Enhanced touch targets, responsive layouts, and native app appearance

### January 2025 - Calculator-Logger Communication & Enhanced Features
✓ **Calorie Tracking Integration**: Implemented useCalorieTracking hook for seamless calculator→logger communication
✓ **Daily Calorie Tracking**: Calculator automatically tracks calories calculated by user on daily basis with real-time statistics
✓ **Header Spacing Fix**: Increased header height and improved spacing between header and hero components 
✓ **Food Background Images**: Added food-themed background patterns to all hero components for enhanced visual appeal
✓ **Privacy & Security Button Fix**: Enhanced button interactions with hover effects and functional click handlers
✓ **Notification Settings Enhancement**: Added interactive switches with proper state management and visual feedback
✓ **App Version Management**: Implemented complete version checking, update notifications, and changelog display system
✓ **Header Icon Enhancement**: Increased all header icon sizes by 10% and verified functionality for all navigation icons
✓ **Weekly Logger Integration**: Calculator calories now appear in weekly statistics and contribute to daily totals
✓ **Real-time Statistics**: Hero sections display live data from calculated calories including daily totals and protein tracking

### January 2025 - Data Validation & Header Updates
✓ **Dashboard Data Validation**: Comprehensive validation of all dashboard components with real-time integration between calculator and weekly logger
✓ **Header Branding Update**: Replaced "Bytewise" text with apple emoji (🍎) for simplified branding approach
✓ **Achievement System Enhancement**: Dynamic achievement calculation based on real progress data from nutrition tracking
✓ **Weekly Logger Status Indicator**: Added calculator connection status showing live data flow between components
✓ **Variable Initialization Fix**: Resolved JavaScript "Cannot access before initialization" error in Dashboard component
✓ **Browser Extension Compatibility**: Identified and isolated browser extension conflicts that don't affect app functionality

### January 2025 - Responsive Mobile Viewport & UI Enhancements
✓ **Enhanced Viewport Configuration**: Updated viewport meta tag from restrictive `user-scalable=no` to responsive `user-scalable=yes, maximum-scale=5.0` for better accessibility
✓ **Device-Specific Responsive Design**: Added CSS media queries for iPhone SE (320px), iPhone 12 mini (375px), iPhone 12 Pro (414px), and large mobile devices (768px+)
✓ **Navigation Footer Improvements**: Increased footer height (py-4), enlarged icon sizes (22px), and enhanced touch targets for better mobile usability
✓ **Calculator-Logger Integration Button**: Added branded "View Weekly Logger" navigation button with gradient styling and proper event handling
✓ **Profile Settings UI Consistency**: Updated display preferences and notification components with data management card styling patterns
✓ **Mobile Typography Scaling**: Implemented responsive font sizes and padding adjustments across different mobile device breakpoints
✓ **Container Responsiveness**: Enhanced container layouts with device-specific max-widths and padding adjustments for optimal mobile viewing

### January 2025 - Backend Integration & Database Management
✓ **Database Schema Verification**: Confirmed 11-table PostgreSQL database fully operational with proper Drizzle ORM integration
✓ **User Authentication System**: Verified 2 active users with Replit OIDC authentication and 10 active sessions
✓ **API Endpoint Testing**: Confirmed all REST endpoints functional including version check, meal logging, and USDA integration
✓ **USDA Service Integration**: Working calorie calculation with fallback estimates when USDA API temporarily unavailable
✓ **Database Storage Implementation**: Full DatabaseStorage class with comprehensive CRUD operations for all data models
✓ **Settings Toggle Conversion**: Successfully converted all preference buttons to toggle switches with proper state management
✓ **Calculator-Logger Communication**: Enhanced event-driven communication between calorie calculator and weekly meal logger
✓ **PDF Export Functionality**: Real PDF generation system creating actual 6-month progress reports using jsPDF
✓ **Achievement System Refinement**: Restricted achievement triggers to only daily and weekly nutrition goals via achievementTriggers.ts

### January 2025 - USDA Food Database Integration & Enhanced Features
✓ **USDA FoodData Central API Integration**: Complete integration with over 300,000 foods, offline caching, and intelligent search capabilities  
✓ **Enhanced Calorie Calculator**: USDA-powered ingredient analysis with detailed nutrition breakdown and measurement conversions (cups, tablespoons, grams, oz)  
✓ **Expanded Profile Module**: Comprehensive user profile with personal info, email verification, privacy/security settings, notifications, display settings, data management, and achievements system  
✓ **Intelligent Meal Planner**: Analyzes user food habits and provides personalized improvement recommendations based on nutrition patterns  
✓ **Mobile UI Enhancements**: All components optimized for proper mobile view with League Spartan typography and iOS compliance  
✓ **Database Schema Expansion**: Added USDA foods cache, user profiles, achievements, and food suggestions tables for comprehensive tracking  
✓ **Offline Capabilities**: Local caching of popular USDA foods for offline nutrition analysis  
✓ **Achievement System**: Tracks user progress with personalized achievements and milestone celebrations  
✓ **Simple Login Screen**: Redesigned with clean food background imagery, floating food icons, and simple sign-in popup window for improved user experience  
✓ **Goal-Based Achievement System**: Refactored achievement system to only trigger for daily and weekly nutrition goals, removing achievement spam from settings and utility actions  
✓ **High-Quality Food Images Integration**: Added 28 high-quality food images provided by user throughout the app with component-specific background system and ImageWithFallback utility

### January 2025 - Brand & UI Consistency Updates
✓ **CSS Brand Logo Implementation**: Removed icon logo from header, restored original CSS-based Bytewise brand logo for consistency  
✓ **Header Spacing Fix**: Fixed header overlapping issues with hero sections by adjusting header height and margins  
✓ **Pastel Brand Colors**: Updated to use pastel yellow (#fef7cd) and pastel blue (#a8dadc) as primary brand colors with black/white accents throughout the app  
✓ **Switch Interface Implementation**: Converted Privacy & Security, Notifications, and Display Preferences from buttons to switches for better UX  
✓ **Dish Background Login**: Changed login screen to use high-quality dish background image instead of floating food icons  
✓ **Achievement System Refinement**: Removed achievement notifications from all settings interactions, restricting awards to only daily and weekly nutrition goals  
✓ **Log Button Integration**: Enhanced calorie calculator with "Log to Weekly Tracker" button for saving calculated entries to meal logger  

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
- **Database**: PostgreSQL with Drizzle ORM for server-side persistence, enhanced with USDA food cache and user analytics
- **Authentication**: Replit OIDC with comprehensive login module, session management, and user profile extensions
- **State Management**: TanStack Query for server state, Context providers for app state
- **Component Library**: Complete shadcn/ui integration with custom Bytewise components
- **API Routes**: RESTful endpoints including meals, foods, recipes, user management, USDA integration, achievements, and food suggestions
- **Food Database**: USDA FoodData Central integration with 300k+ foods, offline caching, and intelligent search
- **Nutrition Analysis**: USDA-powered calorie calculations with measurement conversions and detailed nutrition breakdowns
- **Meal Planning**: Intelligent suggestions based on user habits with improvement recommendations
- **User Experience**: Mobile-first PWA with achievements, habit analysis, personalized nutrition insights, and secure authentication flow

### USDA Integration Features
- **Food Search**: Real-time search of USDA database with local caching for offline use
- **Nutrition Accuracy**: Precise calorie and macro calculations using official USDA nutrition data  
- **Measurement Conversions**: Supports cups, tablespoons, grams, ounces, pieces, and custom measurements
- **Ingredient Analysis**: Detailed breakdown with equivalent measurements and nutrition per 100g
- **Offline Support**: Popular foods cached locally for offline nutrition analysis
- **Smart Suggestions**: Analyzes eating patterns to suggest nutritional improvements

### Data Architecture Note
This implementation uses **server-side database storage** (PostgreSQL + Drizzle ORM) with Replit authentication, enhanced with USDA food data integration. The application features comprehensive nutrition tracking with USDA-powered calorie calculations, habit analysis, achievements system, and intelligent meal planning.

The application is designed for mobile-first usage with PWA capabilities, allowing users to track nutrition on-the-go with accurate USDA data while maintaining a comprehensive web experience with offline functionality.