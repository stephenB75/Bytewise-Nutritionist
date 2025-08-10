# ByteWise Nutritionist - Complete Architecture Document
## Full Stack Application Structure

---

# 1. Executive Summary

ByteWise Nutritionist is a comprehensive Progressive Web Application (PWA) for nutrition tracking and meal planning. The application features a React-based frontend, Express.js backend API, and Supabase for authentication and database services.

**Production URL**: https://bytewisenutritionist.com  
**Technology Stack**: React, TypeScript, Express.js, PostgreSQL, Supabase

---

# 2. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         USERS                               │
│                    (Web & Mobile PWA)                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                         │
│              Hosted on: Vercel/Netlify                      │
│            Domain: bytewisenutritionist.com                 │
├─────────────────────────────────────────────────────────────┤
│ • React 18 with TypeScript                                  │
│ • Tailwind CSS + shadcn/ui components                       │
│ • TanStack Query for state management                       │
│ • Wouter for routing                                        │
│ • PWA with service workers                                  │
└─────────────────────────────────────────────────────────────┘
                            │
                    API Requests (HTTPS)
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (Express.js)                      │
│              Hosted on: Render/Railway                      │
│            URL: api.bytewisenutritionist.com                │
├─────────────────────────────────────────────────────────────┤
│ • Express.js server with TypeScript                         │
│ • RESTful API endpoints                                     │
│ • JWT authentication via Supabase                           │
│ • CORS configured for production                            │
│ • Drizzle ORM for database operations                       │
└─────────────────────────────────────────────────────────────┘
                            │
                    Database Queries
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                DATABASE & AUTH (Supabase)                   │
│                   PostgreSQL Database                       │
│                 Row Level Security (RLS)                    │
├─────────────────────────────────────────────────────────────┤
│ • User authentication & management                          │
│ • Meals, recipes, foods data                                │
│ • Real-time subscriptions                                   │
│ • File storage for images                                   │
└─────────────────────────────────────────────────────────────┘
```

---

# 3. Frontend Structure

## 3.1 Directory Structure

```
client/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/              # shadcn/ui base components
│   │   ├── WeeklyCaloriesCard.tsx
│   │   ├── MicronutrientCards.tsx
│   │   ├── CalorieCalculator.tsx
│   │   ├── UserSettingsManager.tsx
│   │   ├── FastingTracker.tsx
│   │   └── AwardsAchievements.tsx
│   │
│   ├── pages/               # Route components
│   │   ├── ModernFoodLayout.tsx    # Main dashboard
│   │   ├── RecipeBuilder.tsx       # Recipe creation
│   │   ├── MealPlanner.tsx         # Meal planning
│   │   └── ProfilePage.tsx         # User profile
│   │
│   ├── lib/                 # Utilities and configuration
│   │   ├── config.ts        # App configuration
│   │   ├── supabase.ts      # Supabase client
│   │   ├── queryClient.ts   # TanStack Query setup
│   │   └── utils.ts         # Helper functions
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts       # Authentication hook
│   │   ├── useToast.ts      # Toast notifications
│   │   └── useMeals.ts      # Meal data management
│   │
│   ├── services/            # API service layers
│   │   ├── mealsService.ts  # Meal operations
│   │   ├── userService.ts   # User operations
│   │   └── recipeService.ts # Recipe operations
│   │
│   ├── types/               # TypeScript definitions
│   │   ├── database.ts      # Database types
│   │   └── api.ts           # API response types
│   │
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # App entry point
│   └── index.css            # Global styles
│
├── public/                  # Static assets
│   ├── manifest.json        # PWA manifest
│   ├── sw.js               # Service worker
│   └── icons/              # App icons
│
└── index.html              # HTML entry point
```

## 3.2 Key Frontend Components

### Authentication Flow
- **useAuth Hook**: Manages user session with Supabase
- **SignOnModule**: Handles login/signup/password reset
- **Protected Routes**: Wrapper for authenticated pages

### Data Management
- **TanStack Query**: Caches and synchronizes server state
- **Optimistic Updates**: Immediate UI feedback
- **Real-time Subscriptions**: Live data updates via Supabase

### UI/UX Features
- **Responsive Design**: Mobile-first approach
- **Dark/Light Mode**: Theme switching support
- **Touch Gestures**: Swipe navigation for mobile
- **Offline Support**: Service worker caching

---

# 4. Backend Structure

## 4.1 Directory Structure

```
server/
├── index.ts                 # Server entry point
├── routes.ts                # API route definitions
├── storage.ts               # Database operations
├── supabaseAuth.ts          # Authentication middleware
├── vite.ts                  # Vite dev server setup
│
├── services/                # Business logic
│   ├── usdaService.ts       # USDA food data API
│   ├── nutritionService.ts  # Nutrition calculations
│   └── achievementService.ts # Achievement system
│
├── middleware/              # Express middleware
│   ├── cors.ts             # CORS configuration
│   ├── rateLimit.ts        # Rate limiting
│   └── errorHandler.ts     # Error handling
│
└── types/                   # TypeScript types
    └── express.d.ts        # Express type extensions
```

## 4.2 API Endpoints

### Authentication Endpoints
```
POST   /api/auth/signin         # User login
POST   /api/auth/signup         # User registration
POST   /api/auth/signout        # User logout
GET    /api/auth/user          # Get current user
POST   /api/auth/reset-password # Password reset
```

### Meal Management
```
GET    /api/meals/logged       # Get user's meals
POST   /api/meals/logged       # Log new meal
PUT    /api/meals/:id          # Update meal
DELETE /api/meals/:id          # Delete meal
GET    /api/meals/stats        # Get meal statistics
```

### Recipe Management
```
GET    /api/recipes            # Get user's recipes
POST   /api/recipes            # Create recipe
PUT    /api/recipes/:id        # Update recipe
DELETE /api/recipes/:id        # Delete recipe
GET    /api/recipes/public     # Get public recipes
```

### Food Database
```
GET    /api/foods/search       # Search foods
GET    /api/foods/:id          # Get food details
GET    /api/foods/popular      # Get popular foods
POST   /api/foods/custom       # Create custom food
```

### User Profile
```
GET    /api/profile            # Get user profile
PUT    /api/profile            # Update profile
PUT    /api/profile/goals      # Update nutrition goals
GET    /api/profile/achievements # Get achievements
```

### Analytics
```
GET    /api/analytics/weekly   # Weekly summary
GET    /api/analytics/monthly  # Monthly summary
GET    /api/analytics/progress # Progress tracking
POST   /api/analytics/export   # Export data as PDF
```

---

# 5. Database Schema

## 5.1 Core Tables

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100),
    daily_calorie_goal INTEGER DEFAULT 2000,
    daily_protein_goal INTEGER DEFAULT 50,
    daily_carbs_goal INTEGER DEFAULT 300,
    daily_fat_goal INTEGER DEFAULT 65,
    height INTEGER,
    weight INTEGER,
    activity_level VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Meals Table
```sql
CREATE TABLE meals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    date TIMESTAMP NOT NULL,
    meal_type VARCHAR(20),
    name VARCHAR(255),
    total_calories DECIMAL(10,2),
    total_protein DECIMAL(10,2),
    total_carbs DECIMAL(10,2),
    total_fat DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Foods Table
```sql
CREATE TABLE foods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255),
    calories_per_100g DECIMAL(10,2),
    protein_per_100g DECIMAL(10,2),
    carbs_per_100g DECIMAL(10,2),
    fat_per_100g DECIMAL(10,2),
    serving_size DECIMAL(10,2),
    serving_unit VARCHAR(50),
    usda_fdc_id VARCHAR(50),
    is_custom BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES users(id)
);
```

### Recipes Table
```sql
CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    ingredients JSONB,
    instructions TEXT[],
    total_calories DECIMAL(10,2),
    total_protein DECIMAL(10,2),
    total_carbs DECIMAL(10,2),
    total_fat DECIMAL(10,2),
    servings INTEGER DEFAULT 1,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Achievements Table
```sql
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    type VARCHAR(50),
    name VARCHAR(255),
    description TEXT,
    earned_at TIMESTAMP DEFAULT NOW(),
    metadata JSONB
);
```

## 5.2 Database Security

### Row Level Security (RLS) Policies
- Users can only read/write their own data
- Public recipes visible to all authenticated users
- Achievements are private to each user
- Admin override for system operations

---

# 6. Deployment Architecture

## 6.1 Production Environment

### Frontend Deployment (Vercel)
```yaml
Platform: Vercel
Domain: bytewisenutritionist.com
Build Command: npm run build
Output Directory: dist
Framework: Vite
Node Version: 20.x
Environment Variables:
  - VITE_API_BASE_URL
  - VITE_SUPABASE_URL
  - VITE_SUPABASE_ANON_KEY
```

### Backend Deployment (Render)
```yaml
Platform: Render.com
Service Type: Web Service
Build Command: npm install && npm run build
Start Command: npm start
Port: 10000
Health Check Path: /api/health
Environment Variables:
  - NODE_ENV=production
  - DATABASE_URL
  - SUPABASE_URL
  - SUPABASE_SERVICE_ROLE_KEY
  - CORS_ORIGIN
```

### Database & Auth (Supabase)
```yaml
Platform: Supabase
Database: PostgreSQL 15
Authentication: JWT-based
Real-time: Enabled
Storage: For user uploads
Backup: Daily automated
```

## 6.2 CI/CD Pipeline

### Automated Deployment Flow
1. **Code Push to GitHub**
   - Triggers automated builds
   - Runs test suite
   - Checks linting rules

2. **Frontend Pipeline (Vercel)**
   - Automatic deployment on main branch
   - Preview deployments for PRs
   - Rollback capability

3. **Backend Pipeline (Render)**
   - Auto-deploy from main branch
   - Health check validation
   - Zero-downtime deployments

---

# 7. Security Measures

## 7.1 Authentication & Authorization
- **JWT Tokens**: Secure token-based auth
- **Refresh Tokens**: Automatic token renewal
- **Session Management**: Secure cookie handling
- **Password Hashing**: Bcrypt with salt rounds

## 7.2 Data Protection
- **HTTPS Only**: Enforced SSL/TLS
- **CORS Policy**: Strict origin validation
- **Rate Limiting**: API request throttling
- **Input Validation**: Zod schema validation
- **SQL Injection Prevention**: Parameterized queries

## 7.3 Environment Security
- **Secret Management**: Environment variables
- **API Key Rotation**: Regular key updates
- **Audit Logging**: Track sensitive operations
- **Error Handling**: No sensitive data in errors

---

# 8. Performance Optimization

## 8.1 Frontend Optimization
- **Code Splitting**: Dynamic imports
- **Bundle Optimization**: Tree shaking
- **Image Optimization**: WebP format, lazy loading
- **Caching Strategy**: Service worker caching
- **CDN Distribution**: Global edge servers

## 8.2 Backend Optimization
- **Database Indexing**: Optimized queries
- **Connection Pooling**: Efficient DB connections
- **Response Compression**: Gzip compression
- **Query Optimization**: N+1 query prevention
- **Caching Layer**: Redis for frequent data

---

# 9. Monitoring & Maintenance

## 9.1 Monitoring Tools
- **Frontend**: Vercel Analytics
- **Backend**: Render metrics
- **Database**: Supabase dashboard
- **Error Tracking**: Sentry integration
- **Uptime Monitoring**: Better Uptime

## 9.2 Maintenance Tasks
- **Daily**: Monitor error logs
- **Weekly**: Review performance metrics
- **Monthly**: Update dependencies
- **Quarterly**: Security audit
- **Yearly**: Major version upgrades

---

# 10. Disaster Recovery

## 10.1 Backup Strategy
- **Database**: Daily automated backups
- **Code**: Git version control
- **Assets**: CDN redundancy
- **Configurations**: Documented settings

## 10.2 Recovery Procedures
1. **Database Failure**: Restore from backup
2. **Service Outage**: Failover to backup service
3. **Data Corruption**: Point-in-time recovery
4. **Security Breach**: Incident response plan

---

# 11. API Integration

## 11.1 External Services

### USDA FoodData Central
- **Purpose**: Nutrition data
- **Endpoint**: https://api.nal.usda.gov/fdc/v1
- **Rate Limit**: 1000 requests/hour
- **Caching**: 24-hour cache

### Stripe Payment Processing
- **Purpose**: Premium subscriptions
- **Integration**: Server-side SDK
- **Webhooks**: Payment events
- **Security**: PCI compliance

---

# 12. Mobile Support

## 12.1 Progressive Web App (PWA)
- **Installable**: Add to home screen
- **Offline Mode**: Service worker caching
- **Push Notifications**: Meal reminders
- **App Icons**: Multiple resolutions
- **Splash Screens**: Native app feel

## 12.2 Capacitor Integration
- **iOS Support**: Native iOS build
- **Android Support**: Native Android build
- **Plugins**: Camera, notifications, storage
- **Distribution**: App stores ready

---

# 13. Development Workflow

## 13.1 Local Development
```bash
# Install dependencies
npm install

# Start development servers
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## 13.2 Git Workflow
- **Main Branch**: Production-ready code
- **Develop Branch**: Integration branch
- **Feature Branches**: Individual features
- **Hotfix Branches**: Urgent fixes

---

# 14. Future Roadmap

## Planned Features
1. **AI Meal Suggestions**: ML-based recommendations
2. **Social Features**: Share recipes, compete
3. **Wearable Integration**: Fitness tracker sync
4. **Voice Commands**: Hands-free logging
5. **Barcode Scanner**: Quick food entry

## Technical Improvements
1. **GraphQL API**: More efficient queries
2. **Microservices**: Service separation
3. **Kubernetes**: Container orchestration
4. **WebAssembly**: Performance boost
5. **Edge Computing**: Reduced latency

---

# 15. Contact & Support

**Project Repository**: [GitHub Repository URL]  
**Documentation**: https://docs.bytewisenutritionist.com  
**Support Email**: support@bytewisenutritionist.com  
**Status Page**: https://status.bytewisenutritionist.com  

---

## Document Version
**Version**: 1.0.0  
**Last Updated**: August 10, 2025  
**Author**: ByteWise Development Team  

---

*This document represents the complete architecture of ByteWise Nutritionist as a fully independent, production-ready application.*