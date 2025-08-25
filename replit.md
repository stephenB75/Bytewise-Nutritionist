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