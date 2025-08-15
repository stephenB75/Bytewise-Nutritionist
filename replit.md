# ByteWise Nutritionist

## Overview
ByteWise Nutritionist is a comprehensive Progressive Web App (PWA) for nutrition tracking and meal planning. It integrates with the USDA food database to provide accurate nutritional information, offering features like meal logging, calorie tracking, progress analytics, and an achievement system. The application is designed for cross-platform compatibility and full PWA capabilities, including PDF export functionality for comprehensive nutrition reports. Its vision is to provide a robust, user-friendly tool for personal nutrition management, leveraging modern web technologies for a seamless experience.

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
- Enhanced candy nutrition system (August 15, 2025)
  - Integrated FoodStruct.com detailed nutrition data with USDA database
  - Added comprehensive candy nutrition database with 10 candy types
  - Enhanced mineral content data (calcium, iron, magnesium, sodium, etc.)
  - Automatic candy detection and enhanced data prioritization
  - Confirmed nutrition calculation accuracy for all candy items

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