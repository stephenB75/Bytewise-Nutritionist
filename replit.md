# ByteWise Nutritionist

## Overview
ByteWise Nutritionist is a comprehensive Progressive Web App (PWA) for nutrition tracking and meal planning. It integrates with the USDA food database to provide accurate nutritional information, offering features like meal logging, calorie tracking, progress analytics, and an achievement system. The AI Food Analyzer uses Google Gemini Vision for intelligent photo-based food recognition and nutrition analysis. The application is designed for cross-platform compatibility and full PWA capabilities, including PDF export functionality for comprehensive nutrition reports. Its vision is to provide a robust, user-friendly tool for personal nutrition management, leveraging modern web technologies for a seamless experience.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side application is built using React with TypeScript and Vite. It utilizes Tailwind CSS for styling with shadcn/ui for consistent design patterns, implementing a mobile-first responsive design with PWA capabilities, including offline functionality and service worker caching.

### Backend Architecture
The server architecture follows a Node.js/Express pattern with TypeScript, designed for serverless deployment compatibility. It acts as both an API server and static file host, incorporating middleware for authentication, CORS handling, and security. Core components include an Express server for routing, Supabase-based JWT token verification, and an abstracted storage layer for database operations, integrated with the USDA food database.

### Data Storage Solutions
The application uses PostgreSQL as the primary database with Drizzle ORM. Neon Database is utilized for cloud-hosted PostgreSQL. Client-side local storage is used for caching, with comprehensive verification that user data persists across app refresh, closure, and deployment, prioritizing database storage with localStorage as backup.

### Authentication and Authorization
Authentication is handled through Supabase Auth, utilizing JWT token-based session management. The system supports email/password authentication with required email verification, and OAuth providers (Google and GitHub). Security implementation includes Supabase for user management, server-side JWT token verification for protected routes, and secure session management.

### UI/UX Decisions
The application employs a mobile-first responsive design using Tailwind CSS and shadcn/ui for a consistent and modern aesthetic. The application features a **yellow/amber gradient background theme** with comprehensive optimization for text readability and component compatibility. All major components have been updated to work seamlessly with the amber color scheme, using gradient backgrounds (from-amber-50 to-amber-100) and dark text (text-gray-900, text-gray-950) for optimal contrast. Key UI/UX features include a professional PDF viewer modal with inline preview and multi-method download options. The application aims for intuitive user flows and a visually appealing interface.

### Feature Specifications
The application includes an enhanced fasting timer with detailed progress tracking and history display. It features an advanced food recognition system with a comprehensive global cuisine database, capable of accurate identification and nutrient calculation for complex ethnic and composite foods. It also includes editable daily calorie goals and a complete profile system. The AI Photo Analyzer includes automatic food logging to the daily tracker (NO manual button), an enhanced upload interface with click and drag & drop indicators, and emoji-based visual instructions.

## External Dependencies

### Third-Party Services
- **Supabase**: Authentication and user management.
- **USDA FoodData Central API**: Nutritional information.
- **FoodStruct.com**: Detailed nutrition data for candy items.
- **Neon Database**: Cloud PostgreSQL hosting.
- **Google Gemini Vision AI**: Photo-based food recognition and nutrition analysis.

### Development and Deployment Tools
- **Vite**: Frontend build tool and development server.
- **Drizzle Kit**: Database migration and schema management.
- **Capacitor**: Mobile app framework for iOS and Android deployment.
- **Railway**: Cloud deployment platform (Dockerfile-based) with custom domain support.
- **tsx**: TypeScript execution engine for running server code in production without compilation.

### UI and Styling Libraries
- **Radix UI**: Accessible component primitives.
- **Tailwind CSS**: Utility-first CSS framework.
- **React Hook Form**: Form handling with validation.
- **Zod**: Runtime type validation.

### Performance and PWA Enhancements
- **Service Worker**: Custom implementation for offline caching and background sync.
- **React Query/TanStack Query**: Server state management and caching.
- **Web App Manifest**: PWA configuration.

## Recent Changes

### September 30, 2025 - Railway Production Deployment Complete (Version 4.2)
- **Static File Path Resolution**: Fixed production server to correctly locate frontend build files at `/app/dist/public` instead of `/app/server/public`
- **Environment Variable Configuration**: Successfully configured all required Railway environment variables (DATABASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY)
- **Server-Side vs Frontend Variables**: Clarified distinction between backend environment variables and VITE_ prefixed frontend build variables
- **IPv6 Binding**: Confirmed server binding to `::` (IPv6) for Railway custom domain health checks instead of `0.0.0.0` (IPv4 only)
- **Old Build Artifacts Cleanup**: Removed obsolete bundled server files (dist/index.js, dist/prod-index.js) preventing deployment conflicts
- **Production Verification**: Successfully deployed to Railway with health checks passing and app accessible at https://bytewisenutritionist.com
- **Code Safety Review**: Verified production path changes are isolated and don't affect development environment or other application functionality

### September 30, 2025 - Railway Deployment & Data Flow Fixes (Version 4.1)
- **Dockerfile Migration**: Replaced Alpine Linux with Debian-based Node.js (node:20-bookworm-slim) for reliable native module compilation and successful Railway builds
- **Server Runtime Update**: Changed from esbuild-bundled server to running TypeScript directly with tsx, eliminating vite import errors in production
- **React Query Cache Fix**: Aligned cache invalidation keys with actual API endpoints (['/api/daily-stats'], ['/api/stats/daily'], [`/api/users/${userId}/daily-stats`]) to ensure metrics cards refresh properly
- **Health Check Optimization**: Removed redundant Dockerfile HEALTHCHECK in favor of Railway's built-in health monitoring via railway.json
- **Meal Logging Database Integration**: Fixed useCalorieTracking hook to save meals to database (was localStorage only), ensuring data persistence across devices
- **Data Flow Verification**: Confirmed meals are saving to PostgreSQL (meal id: 9) and metrics pipeline is functional
- **Dependency Management**: Kept all node_modules (including dev dependencies) in production to support dynamic vite imports
- **Domain Configuration**: Identified Replit domain limitation (A/TXT/MX records only, no CNAME support) affecting Railway custom domain setup
- **Build Process**: Simplified build command to `vite build` (frontend only) with tsx runtime for server execution
- **Deployment Strategy**: Configured Railway with Dockerfile builder, 120s health check timeout, and proper environment variable setup

### September 11, 2025 - iOS Swift Package Manager Migration (Version 4.0)
- **Complete CocoaPods to SPM Migration**: Successfully transitioned iOS development from CocoaPods to Swift Package Manager, eliminating Ruby dependency issues
- **Future-Proof iOS Architecture**: Updated to Capacitor 7.4.3 with native Apple package management, aligning with Apple's recommended development approach
- **Enhanced iOS Privacy Configuration**: Added comprehensive privacy usage descriptions for Camera, Photos, Location, and User Tracking to ensure App Store compliance
- **Plugin Compatibility Verified**: All 8 Capacitor plugins (Camera, Filesystem, Haptics, Keyboard, Local/Push Notifications, Splash Screen, Status Bar) successfully configured with SPM
- **Simplified Deployment Pipeline**: Eliminated CocoaPods sandbox permission issues, enabling cleaner iOS builds and easier App Store submission process
- **Dead Code Removal**: Removed unused HealthKit configuration to clean up project structure and prevent runtime issues
- **iOS App Store Readiness**: Project now fully prepared for modern iOS deployment with Swift Package Manager workflow and comprehensive App Store compliance

### August 24, 2025 - Database-First Architecture Migration
- **Completed**: Transitioned from localStorage+database hybrid to database-first approach for meal data
- **Simplified Data Flow**: Removed complex localStorage fallback logic that was causing sync issues and quota errors  
- **Enhanced Meal Deletion**: Implemented database-first meal deletion with proper error handling and new server DELETE endpoint (/api/meals/:id)
- **Improved Performance**: Using React Query caching instead of localStorage for better performance and consistency
- **Fixed UI Issues**: Resolved notification icon z-index layering issues with z-[9999] positioning
- **Data Integrity**: Eliminated localStorage quota errors and sync inconsistencies between client and database
- **Event-Driven Updates**: Implemented reload-meal-data events for real-time UI updates after database operations
- **Architecture Improvement**: Database now serves as single source of truth for all meal data, removing localStorage complexity

### August 24, 2025 - Navigation Enhancement Update (Version 3.4)
- **Enhanced Animation Library**: Integrated Phosphor React icons with framer-motion for advanced animation capabilities
- **Pronounced Click Animations**: Implemented zoom-rotate effects with 1.5x scaling and rotation for highly visible feedback
- **Modern Icon System**: Replaced Lucide icons with Phosphor React icons featuring weight variations (fill vs regular)
- **Advanced CSS Animations**: Added glow effects, text slide animations, and hover rotation with cubic-bezier easing
- **Improved UX Feedback**: Active navigation buttons now show filled icons with white glow and pronounced scaling
- **Color Optimization**: Fixed CSS conflicts ensuring proper black/white color states for navigation elements
- **Performance Optimization**: 600ms click animations with staggered timing for icons and text elements

### August 25, 2025 - Date Alignment and Timezone Accuracy Fix (Version 3.5)
- **Fixed Weekly Summary Date Alignment**: Resolved misalignment where August 24th was showing as "Sunday" when it should be "Saturday"
- **Dynamic Day Name Calculation**: Replaced hardcoded day name arrays with dynamic date-based day name calculation using `toLocaleDateString`
- **Enhanced Timezone Handling**: Confirmed all meal logging uses user's correct local timezone via browser APIs and Intl.DateTimeFormat
- **Date Storage Optimization**: Fixed meal date saving from ISO timestamps to local date keys (YYYY-MM-DD) for consistent server processing
- **Server-Side Date Processing**: Modified server to parse dates as noon UTC to prevent timezone drift during database operations
- **Cross-Timezone Verification**: Tested and validated accurate date handling for users in different global timezones
- **Meal Display Accuracy**: Weekly calendar now correctly matches meal dates with their proper calendar days