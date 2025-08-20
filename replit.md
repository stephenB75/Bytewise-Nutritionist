# ByteWise Nutritionist

## Overview
ByteWise Nutritionist is a comprehensive Progressive Web App (PWA) for nutrition tracking and meal planning. It integrates with the USDA food database to provide accurate nutritional information, offering features like meal logging, calorie tracking, progress analytics, and an achievement system. The AI Food Analyzer uses Google Gemini Vision for intelligent photo-based food recognition and nutrition analysis. The application is designed for cross-platform compatibility and full PWA capabilities, including PDF export functionality for comprehensive nutrition reports. Its vision is to provide a robust, user-friendly tool for personal nutrition management, leveraging modern web technologies for a seamless experience.

**Current Version: BETA 3.0**

## Recent Changes (August 20, 2025)
- **✅ COMPLETED: Navigation Updates**: Changed "Nutrition" to "Calorie Tracker" and "Food Log" to "Meal Journal" in bottom navigation
- **✅ COMPLETED: Enhanced Water Intake Card**: Redesigned water consumption card with visual glass indicators, gradient styling, and improved goal achievement feedback
- **✅ COMPLETED: Fasting Tracker Production Cleanup**: Removed debugging functions, test session creators, and development-only UI elements for clean production code
- **✅ COMPLETED: AI Service Migration**: Switched AI Photo Analyzer from OpenAI GPT-4 Vision to Google Gemini Vision API using GOOGLE_API_KEY for enhanced food recognition capabilities
- **✅ COMPLETED: Production Code Cleanup**: Removed all debugging console.log statements from water consumption logic and FastingTracker for clean production code
- **✅ COMPLETED: TypeScript Error Resolution**: Fixed remaining property access issues including onError removal from TanStack Query v5 and planName property access with type assertions
- **✅ COMPLETED: Critical Data Persistence Fix**: Resolved authentication token mismatch in API requests - custom tokens now properly used across all data fetching operations
- **✅ COMPLETED: Daily Stats Loading Recovery**: Fixed user data not populating on app refresh by updating apiRequest function to handle custom authentication tokens
- **✅ COMPLETED: Authentication Token Consistency**: Unified custom token handling between useAuth hook and apiRequest function for reliable data persistence
- **✅ COMPLETED: Water Card Troubleshooting**: Fixed water consumption entries not displaying by ensuring fetchDailyStats loads on component mount for both authenticated and unauthenticated users
- **✅ COMPLETED: Water Tracking Data Persistence**: Verified offline water tracking works correctly with localStorage for unauthenticated users and database sync for authenticated users
- **✅ COMPLETED: Fasting Session Recent History Fix**: Completely resolved issue with logged fasting sessions not appearing in Recent Sessions card
- **✅ COMPLETED: Enhanced Fasting Data Persistence**: Improved session completion flow with proper local storage and server synchronization
- **✅ COMPLETED: Robust Session History Merging**: Fixed data merging logic between local storage and server history with proper deduplication
- **✅ COMPLETED: Authentication Notification System**: Center-screen popup notifications replace toast notifications for better user experience
- **✅ COMPLETED: Water Tracking Backend Integration**: Added missing POST endpoint `/api/daily-stats` for water consumption updates
- **✅ COMPLETED: Storage Layer Enhancement**: Implemented `updateUserDailyStats` and `updateWaterIntake` methods for proper data persistence
- **✅ COMPLETED: AI Food Analyzer Upload Fix**: Enhanced error handling and logging for photo upload functionality to resolve "undefined URL" issues
- **✅ COMPLETED: Database Schema Validation**: Water consumption now properly saves to PostgreSQL with user authentication
- **✅ COMPLETED: Authentication & Async Fixes**: Resolved authentication issues and async/await handling in AI Food Analyzer
- **✅ COMPLETED: OpenAI Quota Error Handling**: Implemented graceful fallback for API quota exceeded errors with user-friendly messages
- **✅ COMPLETED: Offline-First Water Tracking**: Water detection works without authentication, syncs to database when possible
- **Production Ready**: All core features functional with comprehensive error handling, offline capabilities, and clean error-free codebase. User data persistence works reliably across app refresh, close, and deployment.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client-side application is built using React with TypeScript, leveraging Vite for optimal performance. The UI framework utilizes Tailwind CSS for styling with shadcn/ui for consistent design patterns. It implements a mobile-first responsive design with PWA capabilities, including offline functionality, service worker caching, and native app-like experiences.

### Backend Architecture
The server architecture follows a Node.js/Express pattern with TypeScript, designed for serverless deployment compatibility. The backend serves as both an API server and static file host, incorporating middleware for authentication, CORS handling, and security headers. Core components include the Express server for routing, Supabase-based JWT token verification for authentication, and an abstracted storage layer for database operations, alongside integration with the USDA food database.

### Data Storage Solutions
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe operations. Neon Database is utilized for cloud-hosted PostgreSQL with HTTP-based connections, and client-side local storage is used for caching. Data integrity is ensured with comprehensive verification that user data persists across app refresh, closure, and deployment, prioritizing database storage with localStorage as backup only.

### Authentication and Authorization
Authentication is handled through Supabase Auth, utilizing JWT token-based session management. The system supports multiple authentication methods including email/password authentication with required email verification, and OAuth providers (Google and GitHub). Security implementation includes Supabase for user management, server-side JWT token verification for protected routes, secure session management, email verification for account activation, and OAuth redirect handling with proper state management.

### UI/UX Decisions
The application employs a mobile-first responsive design. Tailwind CSS and shadcn/ui are used for a consistent and modern aesthetic. Key UI/UX features include a professional PDF viewer modal with inline preview, multi-method download options for reports, and an enhanced hero component scroll reset system for smooth navigation. The application aims for intuitive user flows and a visually appealing interface, with optimized content-footer spacing system (7rem bottom padding) preventing navigation overlap, and enhanced mobile navigation.

### Feature Specifications
The application includes an enhanced fasting timer with detailed progress tracking and history display. It features an advanced food recognition system with a comprehensive global cuisine database, capable of accurate identification and nutrient calculation for complex ethnic and composite foods. It also includes editable daily calorie goals and a complete profile system.

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
- **Web App Manifest**: PWA configuration for native app installation.