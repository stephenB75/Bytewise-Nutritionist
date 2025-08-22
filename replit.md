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

## Recent Changes (August 2025)

### Component Content Color Enhancement - August 22, 2025
**Status**: ✅ **COMPLETED** - All component contents updated with darker colors for yellow background

**Component Updates:**
- ✅ ProgressRing: Trophy icon changed from text-white to text-gray-900
- ✅ DataSyncIndicator: All status messages updated from light backgrounds to amber gradients with dark text
- ✅ AchievementCelebration: Trophy icon and card background updated to amber theme
- ✅ VerifyEmail: All text colors darkened (text-gray-800→900, text-gray-600→700, text-gray-500→700)
- ✅ PWAInstallPrompt: Background changed from bg-white to amber gradient
- ✅ ProfileIcon: Fallback text updated from text-white to text-gray-900
- ✅ NotificationDropdown: Light gray text updated to text-gray-700
- ✅ UserFoodSuggestions: All light colors updated, backgrounds changed to amber gradients
- ✅ ResetPassword: All text colors darkened for better contrast
- ✅ ImageWithFallback: Icon colors updated to darker variants

**Color Pattern Applied:**
- Primary text: `text-gray-900` for maximum contrast on yellow background
- Secondary text: `text-gray-700` for medium emphasis  
- Background cards: `bg-gradient-to-br from-amber-50 to-amber-100` for consistency
- Status indicators: Amber gradient backgrounds with dark text instead of light colors

**Result**: Perfect contrast and readability across all component contents with the yellow/amber background theme.

### Code Cleanup and Optimization - August 22, 2025
**Status**: ✅ **COMPLETED** - Production-ready code optimization

**Debugging Code Removal:**
- ✅ Removed all console.log statements from queryClient.ts
- ✅ Cleaned up authentication and API request debugging logs
- ✅ Removed query function debugging artifacts

**CSS Consolidation:**
- ✅ Consolidated metrics cards text color rules (18+ selectors → 4 clean selectors)
- ✅ Removed empty comment blocks and redundant styling rules
- ✅ Streamlined navigation and interaction state comments
- ✅ Optimized CSS specificity while maintaining functionality

**Performance Improvements:**
- ✅ Reduced CSS file size through rule consolidation
- ✅ Maintained pure black (#000000) text for optimal contrast
- ✅ Preserved all yellow background theme compatibility

### Yellow Background Theme Optimization
**Status**: ✅ **COMPLETED** - All major components optimized for yellow/amber background theme

**Components Updated for Theme Compatibility:**
- ✅ Dashboard metrics cards (ProgressCard, WaterCard, MacroCard, MicronutrientCard)
- ✅ DataManagementPanel - Updated backgrounds and text colors
- ✅ WeeklyCaloriesCard - Enhanced contrast with amber backgrounds
- ✅ SignOnModule - Updated card backgrounds and form inputs
- ✅ TourLauncher - Changed gradients to amber tones
- ✅ CalorieCalculator - Updated all card backgrounds and styling
- ✅ FoodSearchWithHistory - Fixed input backgrounds and hover states
- ✅ MealTimeline - Updated main card and progress bar backgrounds
- ✅ AwardsAchievements - Fixed light text colors for readability
- ✅ UserProfile - Updated all backgrounds to amber gradient
- ✅ PWAStatus - Changed card background and text colors
- ✅ Dashboard layout - Fixed white text conflicts in small stat cards
- ✅ Progress section headings and micronutrients section styling

**Key Pattern Changes Applied:**
- `bg-white/10`, `bg-white/90`, `bg-white` → `bg-gradient-to-br from-amber-50 to-amber-100`
- `text-gray-300`, `text-white` → `text-gray-900`, `text-gray-950`
- `border-white/20` → `border-amber-200/40`
- `bg-gray-800/50` → `bg-gradient-to-br from-amber-100 to-amber-200`
- Form inputs: `bg-white/80` with `border-amber-300`
- Hover states: `hover:bg-amber-100/50`

**CSS Conflicts Resolved:**
- Fixed complex CSS override rules in index.css that were forcing white text
- Updated dashboard page exclusions for metrics cards
- Resolved text readability issues across all major UI components

**Result**: Complete visual harmony with yellow background theme while maintaining excellent readability and accessibility standards.