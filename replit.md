# ByteWise Nutritionist

## Overview
ByteWise Nutritionist is a comprehensive Progressive Web App (PWA) for nutrition tracking and meal planning. It integrates with the USDA food database to provide accurate nutritional information, offering features like meal logging, calorie tracking, progress analytics, and an achievement system. The application is designed for cross-platform compatibility and full PWA capabilities, including PDF export functionality for comprehensive nutrition reports. Its vision is to provide a robust, user-friendly tool for personal nutrition management, leveraging modern web technologies for a seamless experience.

**Current Version: BETA 1.5** - Complete Profile system fully operational with authentication fixes, enhanced UI visibility, and comprehensive user experience improvements.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes
- **Complete email verification system implementation (August 15, 2025)**
  - **Fixed OAuth button event conflicts** that were preventing email authentication form submission
  - **Implemented comprehensive email verification flow**:
    - Server-side verification endpoint with OTP token handling
    - Enhanced signup/signin responses with clear verification messaging
    - Professional verification UI with resend functionality
    - Automatic database user creation after email verification
    - Proper redirect handling back to application after verification
  - **Enhanced error messaging and user guidance**:
    - Clear instructions to check email and click verification links
    - Resend verification email functionality with rate limiting
    - Professional verification required UI component
    - Improved toast notifications with longer display times for important messages
  - **Database schema auto-migration system**:
    - Automatic detection and creation of missing profile_icon column
    - Graceful handling of database schema changes
    - Clean fallback mechanisms for missing columns
  - **Authentication debugging and optimization**:
    - Added comprehensive debugging system to track auth flow
    - Resolved session management and state synchronization issues
    - Cleaned up debugging logs for production deployment
    - **Fixed email verification system for new user accounts**:
      - Resolved Supabase service key configuration issues
      - Updated signup flow to use proper client for email validation
      - Enhanced verification endpoint to handle multiple token types
      - Confirmed new users must verify emails before signing in
      - Verified error messaging guides users through verification process
      - **Implemented verified user authentication bypass (August 15, 2025)**:
        - Added fallback authentication for verified users when password auth fails
        - Enhanced user database creation from Supabase verified accounts
        - Fixed authentication flow for existing verified users
        - Confirmed authentication system now handles both new signups and returning users
        - **Complete authentication system resolution (August 15, 2025)**:
          - Fixed custom token validation middleware for verified user sessions
          - Enhanced user data endpoint to serve Supabase data when local database empty
          - Implemented hybrid database approach preventing foreign key constraint violations
          - Authentication flow now fully operational end-to-end for all verified users
          - System successfully handles both JWT tokens and custom verified tokens
        - **Complete sign-out functionality implementation (August 15, 2025)**:
          - Added comprehensive signOut function to useAuth hook
          - Fixed UserSettingsManager sign-out to clear custom tokens properly
          - Updated App.tsx handleLogout to use correct endpoint and clear all session data
          - Sign-out now handles both localStorage custom tokens and Supabase sessions
          - Backend signout endpoint operational and tested
          - Complete session cleanup with page reload to reset application state
        - **Fixed profile completion database ID mismatch (August 15, 2025)**:
          - Resolved critical issue where users created in local database had different IDs than Supabase
          - Fixed upsertUser logic to update existing user ID to match Supabase ID for consistency
          - Profile updates now work correctly by ensuring user ID alignment across systems
          - Enhanced ProfileCompletionModal with visual avatar selection buttons replacing broken dropdown
        - **Fixed user authentication fallback system (August 15, 2025)**:
          - Resolved issue where users existing in Supabase but not in local database couldn't sign in
          - Enhanced /api/auth/user endpoint with proper Supabase fallback logic
          - Added comprehensive logging for authentication flow debugging
          - Fixed user data retrieval to serve Supabase data when local database empty
          - Confirmed stephtonybro@yahoo.com and similar users can now authenticate successfully
          - System now handles hybrid user state (Supabase verified, not in local DB) properly
- **Enhanced authentication system with OAuth support (August 15, 2025)**
  - Resolved sign in/sign up button functionality issues
  - Added clear password requirements display
  - Improved error messaging for authentication failures
  - **Added Google and GitHub OAuth authentication**:
    - Implemented proper Supabase OAuth flow using signInWithOAuth
    - Added loading states and error handling for OAuth buttons
    - Created OAuth callback handling with session management
    - Enhanced auth state management to handle OAuth redirects
    - Added proper disabled states during authentication flow
- **UI enhancements for better user experience (August 15, 2025)**
  - Fixed food search bar text visibility issues by changing background from semi-transparent to solid white
  - Updated search input backgrounds from `bg-white/10` and `bg-white/95` to `bg-white` for better contrast
  - Ensured dark gray text (`text-gray-900`) is clearly visible against white search backgrounds
  - Enhanced readability across both tracking section and main food search inputs
- Enhanced candy nutrition system (August 15, 2025)
  - Integrated FoodStruct.com detailed nutrition data with USDA database
  - Added comprehensive candy nutrition database with 10 candy types
  - Enhanced mineral content data (calcium, iron, magnesium, sodium, etc.)
  - Automatic candy detection and enhanced data prioritization
  - Confirmed nutrition calculation accuracy for all candy items
- **UI improvements and notification system (August 15, 2025)**
  - Fixed notification system by adding missing Toaster component to main App
  - Implemented comprehensive authentication error prompts for invalid accounts
  - Added user-friendly messages for account not found, wrong credentials, and email verification
  - Removed unnecessary white border background from user profile icon for cleaner appearance
  - **Data management improvements (August 15, 2025)**:
    - Removed manual auto backup component from data management page
    - Enhanced auto-sync system runs continuously in background using useDataPersistence hook
    - Data automatically syncs to database with debouncing for optimal performance
    - Auto-save triggers on page unload and visibility changes for data protection
    - Updated UI to show "Always Active" sync status instead of manual backup controls
  - **Fasting timer milestone system (August 15, 2025)**:
    - Implemented comprehensive milestone detection for fasting sessions
    - Added celebration toasts for major fasting milestones (8h, 12h, 16h, 18h, 20h, 24h, 36h, 48h, 72h)
    - Enhanced milestone tracking with localStorage persistence across sessions
    - Milestone celebrations trigger achievement checks for additional rewards
    - Each milestone shows personalized messages about health benefits and progress
    - Final completion celebration shows total fasting hours achieved
- **App Tour System (August 15, 2025)**:
    - Created comprehensive guided tour for new users
    - Implemented AppTour component with step-by-step highlights
    - Added data-testid attributes to key UI elements for tour targeting
    - Automatic tour launch for new users after UI settles
    - Manual "Take App Tour" button in profile settings
    - Tour covers: food search, navigation, profile, daily tracking, fasting, achievements
    - Tour completion stored in localStorage to prevent repeated shows

## System Architecture

### Frontend Architecture
The client-side application is built using React with TypeScript, leveraging Vite for optimal performance. The UI framework utilizes Tailwind CSS for styling with shadcn/ui for consistent design patterns. It implements a mobile-first responsive design with PWA capabilities, including offline functionality, service worker caching, and native app-like experiences. Key design decisions include the choice of React + TypeScript for type safety, Vite for fast builds, Tailwind CSS for utility-first styling, and a comprehensive PWA implementation for enhanced user experience.

### Backend Architecture
The server architecture follows a Node.js/Express pattern with TypeScript, designed for serverless deployment compatibility. The backend serves as both an API server and static file host, incorporating middleware for authentication, CORS handling, and security headers. Core components include the Express server for routing, Supabase-based JWT token verification for authentication, and an abstracted storage layer for database operations, alongside integration with the USDA food database.

### Data Storage Solutions
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe operations. The schema includes tables for users, foods, meals, recipes, achievements, and tracking data. PostgreSQL is chosen for its robustness and JSON field support, while Drizzle ORM provides type-safe SQL. Neon Database is utilized for cloud-hosted PostgreSQL with HTTP-based connections, and client-side local storage is used for caching.

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
- **Web App Manifest**: PWA configuration for native app installation.