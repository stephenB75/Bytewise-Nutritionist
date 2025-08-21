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
The application employs a mobile-first responsive design using Tailwind CSS and shadcn/ui for a consistent and modern aesthetic. Key UI/UX features include a professional PDF viewer modal with inline preview and multi-method download options. The application aims for intuitive user flows and a visually appealing interface.

### Feature Specifications
The application includes an enhanced fasting timer with detailed progress tracking and history display. It features an advanced food recognition system with a comprehensive global cuisine database, capable of accurate identification and nutrient calculation for complex ethnic and composite foods. It also includes editable daily calorie goals and a complete profile system.

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