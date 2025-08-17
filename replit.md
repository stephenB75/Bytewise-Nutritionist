# ByteWise Nutritionist

## Overview
ByteWise Nutritionist is a comprehensive Progressive Web App (PWA) for nutrition tracking and meal planning. It integrates with the USDA food database to provide accurate nutritional information, offering features like meal logging, calorie tracking, progress analytics, and an achievement system. The application is designed for cross-platform compatibility and full PWA capabilities, including PDF export functionality for comprehensive nutrition reports. Its vision is to provide a robust, user-friendly tool for personal nutrition management, leveraging modern web technologies for a seamless experience.

**Current Version: BETA 1.8** - Complete mixed dish recognition system with accurate macronutrient profiling for composite foods containing multiple protein, carbohydrate, and fat sources across 60+ international dishes.

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

### BETA 1.9 (August 17, 2025)
**Critical Release: Data Persistence & Deployment-Safe Storage**

Key Features Added:
- 🛡️ **Data Integrity System** - Comprehensive verification that user data persists across app refresh, closure, and deployment
- ✅ **Database-First Storage** - Critical user data now prioritizes database storage with localStorage as backup only
- 🔄 **Automatic Data Restoration** - App automatically restores user data from database if localStorage is cleared
- 📊 **Data Health Monitoring** - Real-time monitoring of data integrity with automatic backup warnings
- 🔧 **Persistence Verification Tool** - Built-in script to verify data persistence across app lifecycle
- ⚠️ **Enhanced Portion Warnings** - Now warns on any 30%+ difference from recommended serving sizes (both larger AND smaller)

Critical Data Protection:
- **User profiles and settings** - Protected against browser clearing and deployment updates
- **Daily calorie tracking (weeklyMeals)** - Secured with automatic database backup every 5 minutes
- **Fasting session history** - Persistent across devices and app versions
- **Achievement progress** - Never lost during app updates or browser clearing
- **Meal history and recipes** - Comprehensive backup and restore system
- **Custom food database entries** - Safely stored in database with localStorage cache

Technical Infrastructure:
- **DataIntegrityManager Component** - Monitors data health and triggers automatic backups ✅ **PRODUCTION VERIFIED**
- **useDataIntegrity Hook** - Provides data verification, backup, and restore capabilities
- **Persistence Verification Script** - Automated testing of data survival across app lifecycle
- **Enhanced API Integration** - Improved database sync with proper error handling and fallback systems
- **Real-time Data Monitoring** - Detects data loss risks and automatically protects user information

### BETA 1.8 (August 17, 2025)
**Previous Release: Complete Mixed Dish Recognition & Balanced Macronutrient Analysis**

Key Features Added:
- ✅ **Mixed Dish Recognition System** - Accurately identifies composite foods with multiple protein, carb, and fat sources
- ✅ **Balanced Macronutrient Profiling** - Proper nutrition calculation for dishes combining meat + vegetables + grains + dairy
- ✅ **Enhanced Food Database Integration** - Priority system ensures enhanced database checks before USDA fallback
- ✅ **Pattern-Based Food Matching** - Smart recognition of mixed dishes like "chicken alfredo pasta", "beef and broccoli stir fry"
- ✅ **Comprehensive Mixed Dish Coverage** - Beef & broccoli, chicken alfredo, tuna sandwiches, quesadillas, protein bowls, caesar salads
- ✅ **Realistic Nutrition Profiles** - Each dish shows proper protein from meat, carbs from grains/vegetables, fats from cooking methods
- ✅ **Micronutrient Analysis** - Complete vitamin and mineral profiles reflecting all ingredients in composite dishes

Enhanced Mixed Dish Database:
- **American**: Tuna sandwich (18.5g protein + 22.8g carbs + 8.2g fat), Caesar salad with chicken (18.5g protein + 6.8g carbs + 12.5g fat)
- **Chinese**: Beef and broccoli stir fry (18.5g protein + 8.2g carbs + 6.8g fat) with high Vitamin C from vegetables
- **Italian**: Chicken alfredo pasta (18.2g protein + 22.5g carbs + 15.8g fat) with high calcium from cream sauce
- **Mexican**: Chicken quesadilla (19.8g protein + 18.5g carbs + 13.5g fat), beef tacos (15.8g protein + 18.2g carbs + 12.5g fat)
- **Healthy**: Protein quinoa bowl (16.5g protein + 22.8g carbs + 5.8g fat) with complete amino acid profile

Technical Improvements:
- **Enhanced Database Priority Logic** - Checks enhanced database first before USDA API for better composite food recognition ✅ **PRODUCTION VERIFIED**
- **Smart Pattern Recognition** - Regex-based matching for "beef.*broccoli", "chicken.*alfredo", "tuna.*sandwich" patterns
- **Fixed Calculation Flow** - Enhanced food database properly integrated into main calculation pipeline
- **Realistic Portion Weights** - Each mixed dish has authentic serving sizes (300g stir fry, 280g pasta, 200g quesadilla)
- **Composite Nutrition Logic** - Proper scaling and combination of nutrients from multiple ingredient sources

### BETA 1.7 (August 17, 2025)
**Previous Release: Enhanced Fasting Timer & Comprehensive Global Cuisine Database**

Key Features Added:
- ✅ **Enhanced Fasting Timer with Detailed Progress Tracking** - Shows actual hours fasted and remaining time when sessions are stopped early
- ✅ **Improved Fasting History Display** - Shows both completed and stopped sessions with visual indicators and detailed progress information  
- ✅ **Smart Session Feedback** - Toast notifications display exact fasting duration and remaining goal time for all session types
- ✅ **Visual Session Indicators** - Green checkmarks for completed fasts, orange alerts for early-stopped sessions with remaining time display
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
- Enhanced ProfileIcon component with proper img tags and error handling ✅ **PRODUCTION VERIFIED**
- Added responsive spacing and sizing for mobile compatibility ✅ **PRODUCTION VERIFIED**
- Integrated calorie goal editing with existing goals API endpoint
- Improved localStorage-based fresh authentication detection system
- Ring styling and gradient backgrounds for better visual accessibility ✅ **PRODUCTION VERIFIED**
- **Created Enhanced Food Database** (`server/data/enhancedFoodDatabase.ts`) with 50+ complex foods and accurate portion weights
- **Upgraded USDA Service** fallback system with intelligent prioritization (enhanced database for ethnic foods, USDA for basic ingredients)
- **Improved Pattern Recognition** with regex-based matching for composite foods and cultural variants
- **Smart Database Selection** - `shouldUseUSDAData()` function intelligently routes foods to best nutrition source

### BETA 1.6 (August 16, 2025)  
**Previous Release: Enhanced User Experience & Mobile Optimization**
- Smart app tour timing with fresh session detection
- Editable daily calorie goals with real-time app-wide updates
- Mobile-optimized avatar visibility and enhanced responsive design
- Improved authentication flow and enhanced visual accessibility

### BETA 1.5 (August 15, 2025)
**Earlier Release: Complete Profile System**
- Complete Profile system fully operational with authentication fixes
- Enhanced UI visibility and comprehensive user experience improvements
