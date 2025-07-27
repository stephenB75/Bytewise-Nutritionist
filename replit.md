# ByteWise Nutrition Tracker

## Overview

ByteWise is a comprehensive nutrition tracking application built as a Progressive Web App (PWA). The application allows users to track their nutrition, plan meals, build recipes, and achieve their health goals through an intuitive mobile-first interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state, React hooks for local state
- **Mobile-First Design**: PWA with touch-optimized interfaces
- **Drag & Drop**: Custom implementation for ingredient management

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Development**: Vite for frontend bundling, tsx for TypeScript execution
- **Session Management**: Express sessions with PostgreSQL store

### Database Architecture
- **Primary Database**: PostgreSQL with Drizzle ORM
- **Connection**: Neon Database serverless PostgreSQL
- **Schema**: Strongly typed with Drizzle and Zod validation
- **Migrations**: Drizzle Kit for schema management

## Key Components

### Authentication System
- **Provider**: Replit OIDC authentication
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Security**: HTTP-only cookies, CSRF protection
- **User Management**: Automatic user creation and profile management

### Data Models
- **Users**: Profile information, nutrition goals, preferences
- **Foods**: Comprehensive nutrition database with USDA data
- **Recipes**: User-created recipes with calculated nutrition
- **Meals**: Logged food consumption with timestamps
- **Water Intake**: Daily hydration tracking

### UI/UX Features
- **Progressive Web App**: Offline capabilities, installable
- **Touch Interactions**: Drag-and-drop for ingredient management
- **Real-time Updates**: Optimistic updates with TanStack Query
- **Mobile Navigation**: Bottom tab navigation with safe area support
- **Theme System**: CSS variables with light/dark mode support

### Component Library
- **Base**: shadcn/ui components built on Radix UI primitives
- **Custom Components**: Nutrition-specific components (progress rings, meal cards)
- **Typography**: Custom font system with League Spartan and Quicksand
- **Icons**: Lucide React icon library

## Data Flow

### Meal Logging Flow
1. User searches for foods via REST API
2. Food selection adds to current meal
3. Nutrition calculations update in real-time
4. Meal submission creates database entries
5. Dashboard updates automatically via query invalidation

### Recipe Creation Flow
1. User builds recipe by adding ingredients
2. Nutrition totals calculate dynamically
3. Recipe saves to database with calculated values
4. Recipe becomes available for meal logging

### Nutrition Tracking Flow
1. Daily goals retrieved from user profile
2. Consumed nutrition aggregated from logged meals
3. Progress indicators update in real-time
4. Calendar view shows historical data

## External Dependencies

### Database & Infrastructure
- **@neondatabase/serverless**: PostgreSQL connection
- **drizzle-orm**: Type-safe database operations
- **connect-pg-simple**: Session storage

### UI & Styling
- **@radix-ui/***: Headless UI primitives
- **tailwindcss**: Utility-first styling
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon system

### Data & State
- **@tanstack/react-query**: Server state management
- **zod**: Runtime type validation
- **date-fns**: Date manipulation

### Authentication
- **openid-client**: OIDC authentication
- **passport**: Authentication middleware
- **express-session**: Session management

### Development
- **vite**: Build tool and dev server
- **typescript**: Type safety
- **tsx**: TypeScript execution

## Deployment Strategy

### Development Environment
- **Hot Reloading**: Vite dev server with React Fast Refresh
- **Type Checking**: Real-time TypeScript compilation
- **Database**: Development database with hot schema reloading

### Production Build
- **Frontend**: Static asset generation via Vite
- **Backend**: Single bundle via esbuild for Node.js
- **Assets**: Optimized images and fonts
- **PWA**: Service worker for offline functionality

### Database Management
- **Schema Evolution**: Drizzle migrations for schema changes
- **Connection Pooling**: Neon serverless with connection pooling
- **Environment Variables**: Secure credential management

### Security Considerations
- **HTTPS Only**: Secure cookie transmission
- **CSRF Protection**: Double-submit cookie pattern
- **Input Validation**: Zod schemas for all user inputs
- **SQL Injection Prevention**: Drizzle ORM parameterized queries

The application is designed for mobile-first usage with PWA capabilities, allowing users to track nutrition on-the-go while maintaining a comprehensive web experience.