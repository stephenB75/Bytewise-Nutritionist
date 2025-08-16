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
**Milestone Release: Enhanced User Experience & Mobile Optimization**

Key Features Added:
- ✅ Smart app tour timing - triggers only after fresh sign-in/sign-up instead of for returning users
- ✅ Editable daily calorie goals in user profile with real-time app-wide updates (1000-5000 cal range)  
- ✅ Mobile-optimized avatar visibility with proper image loading and fallback handling
- ✅ Enhanced mobile responsiveness throughout profile card layout
- ✅ Improved authentication flow with fresh session detection for tour triggering

Technical Improvements:
- Enhanced ProfileIcon component with proper img tags and error handling
- Added responsive spacing and sizing for mobile compatibility
- Integrated calorie goal editing with existing goals API endpoint
- Improved localStorage-based fresh authentication detection system
- Ring styling and gradient backgrounds for better visual accessibility

### BETA 1.5 (August 15, 2025)
**Previous Release: Complete Profile System**
- Complete Profile system fully operational with authentication fixes
- Enhanced UI visibility and comprehensive user experience improvements
