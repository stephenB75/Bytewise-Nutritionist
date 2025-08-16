# ByteWise Nutritionist

## Overview
ByteWise Nutritionist is a comprehensive Progressive Web App (PWA) for nutrition tracking and meal planning. It integrates with the USDA food database to provide accurate nutritional information, offering features like meal logging, calorie tracking, progress analytics, and an achievement system. The application is designed for cross-platform compatibility and full PWA capabilities, including PDF export functionality for comprehensive nutrition reports. Its vision is to provide a robust, user-friendly tool for personal nutrition management, leveraging modern web technologies for a seamless experience.

**Current Version: BETA 1.6** - Enhanced user experience with smart app tour timing, editable calorie goals, and mobile-optimized avatar visibility.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side application is built using React with TypeScript, leveraging Vite for optimal performance. The UI framework utilizes Tailwind CSS for styling with shadcn/ui for consistent design patterns. It implements a mobile-first responsive design with PWA capabilities, including offline functionality, service worker caching, and native app-like experiences.

### Backend Architecture
The server architecture follows a Node.js/Express pattern with TypeScript, designed for serverless deployment compatibility. The backend serves as both an API server and static file host, incorporating middleware for authentication, CORS handling, and security headers. Core components include the Express server for routing, Supabase-based JWT token verification for authentication, and an abstracted storage layer for database operations, alongside integration with the USDA food database.

### Data Storage Solutions
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe operations. The schema includes tables for users, foods, meals, recipes, achievements, and tracking data. Neon Database is utilized for cloud-hosted PostgreSQL with HTTP-based connections, and client-side local storage is used for caching.

### Authentication and Authorization
Authentication is handled through Supabase Auth, utilizing JWT token-based session management. The system supports multiple authentication methods including email/password authentication with required email verification, and OAuth providers (Google and GitHub). Security implementation includes Supabase for user management, server-side JWT token verification for protected routes, secure session management, email verification for account activation, and OAuth redirect handling with proper state management.

### UI/UX Decisions
The application employs a mobile-first responsive design. Tailwind CSS and shadcn/ui are used for a consistent and modern aesthetic. Key UI/UX features include a professional PDF viewer modal with inline preview, multi-method download options for reports, and an enhanced hero component scroll reset system for smooth navigation. The application aims for intuitive user flows and a visually appealing interface.

## External Dependencies

### Third-Party Services
- **Supabase**: Authentication and user management service.
- **USDA FoodData Central API**: Provides accurate nutritional information.
- **FoodStruct.com**: Enhanced detailed nutrition data for candy items.
- **Neon Database**: Cloud PostgreSQL hosting.

### Development and Deployment Tools
- **Vite**: Frontend build tool and development server.
- **Drizzle Kit**: Database migration and schema management.
- **Capacitor**: Mobile app framework for iOS and Android deployment.
- **Railway/Replit**: Cloud deployment platforms.

### UI and Styling Libraries
- **Radix UI**: Accessible component primitives.
- **Tailwind CSS**: Utility-first CSS framework.
- **React Hook Form**: Form handling with validation.
- **Zod**: Runtime type validation.

### Performance and PWA Enhancements
- **Service Worker**: Custom implementation for offline caching and background sync.
- **React Query/TanStack Query**: Server state management and caching.
- **Web App Manifest**: PWA configuration for native app installation.## Version History

### BETA 1.6 (August 16, 2025)
**Milestone Release: Comprehensive Food Database & Intelligent Nutrition Recognition**

Key Features Added:
- ✅ Smart app tour timing - triggers only after fresh sign-in/sign-up instead of for returning users
- ✅ Editable daily calorie goals in user profile with real-time app-wide updates (1000-5000 cal range)  
- ✅ Mobile-optimized avatar visibility with proper image loading and fallback handling
- ✅ Enhanced mobile responsiveness throughout profile card layout
- ✅ Improved authentication flow with fresh session detection for tour triggering
- ✅ **Advanced Food Recognition System** - Accurate identification of complex ethnic and composite foods
- ✅ **Enhanced Nutrition Database** - Comprehensive macro/micro nutrient profiles for 50+ global cuisines
- ✅ **Intelligent Composite Food Analysis** - Proper nutrient calculation for pastry-wrapped, sandwich-style, and multi-component foods
- ✅ **Multi-Cuisine Coverage** - Chinese, Thai, Korean, Vietnamese, Greek, Italian, Indian, African, Caribbean, Middle Eastern foods
- ✅ **Pattern-Based Food Matching** - Smart recognition of food variants (e.g., "chicken fried rice" → "fried rice")
- ✅ **Breakfast & Vegetarian Categories** - Comprehensive coverage of breakfast foods and plant-based options

Enhanced Food Database Coverage:
- **Chinese**: General Tso's chicken, orange chicken, lo mein, egg rolls, fried rice (295-175 cal/100g)
- **Thai**: Pad thai, green curry, tom yum soup (85-165 cal/100g)  
- **Korean**: Bulgogi, bibimbap with accurate fermented vegetable nutrients (155-195 cal/100g)
- **Vietnamese**: Pho, banh mi with authentic herb/spice profiles (85-225 cal/100g)
- **Greek**: Gyro, moussaka with proper dairy/vegetable integration (195-215 cal/100g)
- **Italian**: Lasagna, chicken parmigiana, risotto (165-235 cal/100g)
- **Indian**: Butter chicken, biryani, samosa with spice-derived nutrients (195-308 cal/100g)
- **Breakfast**: Pancakes, French toast, omelets, breakfast burritos (185-255 cal/100g)
- **Vegetarian**: Buddha bowls, veggie burgers with plant protein profiles (135-185 cal/100g)
- **African**: Jollof rice with traditional vegetable/spice content (165 cal/100g)

Technical Improvements:
- Enhanced ProfileIcon component with proper img tags and error handling
- Added responsive spacing and sizing for mobile compatibility
- Integrated calorie goal editing with existing goals API endpoint
- Improved localStorage-based fresh authentication detection system
- Ring styling and gradient backgrounds for better visual accessibility
- **Created Enhanced Food Database** (`server/data/enhancedFoodDatabase.ts`) with 50+ complex foods and accurate portion weights
- **Upgraded USDA Service** fallback system with intelligent prioritization (enhanced database for ethnic foods, USDA for basic ingredients)
- **Improved Pattern Recognition** with regex-based matching for composite foods and cultural variants
- **Smart Database Selection** - `shouldUseUSDAData()` function intelligently routes foods to best nutrition source

### BETA 1.5 (August 15, 2025)
**Previous Release: Complete Profile System**
- Complete Profile system fully operational with authentication fixes
- Enhanced UI visibility and comprehensive user experience improvements
