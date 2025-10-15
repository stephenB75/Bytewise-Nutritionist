# ByteWise Nutritionist - Product Requirements Document

**Version:** 4.1  
**Last Updated:** September 30, 2025  
**Document Owner:** Product Team  
**Status:** Active Development

---

## 1. Executive Summary

ByteWise Nutritionist is a comprehensive Progressive Web App (PWA) designed to revolutionize personal nutrition management through AI-powered food recognition, intelligent meal tracking, and data-driven insights. The application combines modern web technologies with advanced AI capabilities to provide users with an intuitive, accurate, and engaging nutrition tracking experience.

### Vision Statement
To provide the most intelligent and user-friendly nutrition tracking platform that empowers users to make informed dietary choices through AI-powered analysis, accurate nutritional data, and personalized insights.

### Key Differentiators
- **AI-Powered Food Recognition**: Google Gemini Vision API for photo-based food identification
- **USDA Integration**: Access to 600,000+ verified food items with comprehensive nutritional data
- **Cross-Platform PWA**: Single codebase for web, iOS, and Android with offline capabilities
- **Intelligent Insights**: AI-driven food suggestions and personalized recommendations
- **Premium Monetization**: RevenueCat-powered subscription system for advanced features

---

## 2. Problem Statement

### Current Market Challenges
1. **Manual Entry Burden**: Traditional nutrition apps require tedious manual food logging
2. **Data Accuracy Issues**: Inconsistent nutritional databases lead to unreliable tracking
3. **Poor User Engagement**: Complex interfaces and slow workflows reduce retention
4. **Limited Intelligence**: Lack of personalized recommendations based on user patterns
5. **Platform Fragmentation**: Separate apps for different platforms increase development costs

### User Pain Points
- "I don't have time to manually log every meal"
- "The nutrition data seems inaccurate or outdated"
- "The app is too complicated to use daily"
- "I need better insights into my eating habits"
- "I want the same experience on my phone and computer"

---

## 3. Target Users

### Primary Personas

#### 1. Health-Conscious Professional (35-45 years)
- **Goals**: Maintain healthy weight, track macros for fitness
- **Behavior**: Meal preps, tracks calories daily, uses fitness apps
- **Pain Points**: Limited time for manual entry, needs quick logging
- **Premium Potential**: High - values time-saving features

#### 2. Fitness Enthusiast (25-35 years)
- **Goals**: Build muscle, optimize protein intake, track performance
- **Behavior**: Weighs food, uses supplements, tracks workouts
- **Pain Points**: Needs accurate macro tracking, wants detailed nutrition data
- **Premium Potential**: Very High - willing to pay for precision

#### 3. Weight Management User (30-50 years)
- **Goals**: Lose weight sustainably, understand calorie intake
- **Behavior**: Follows diets, seeks accountability, tracks progress
- **Pain Points**: Overwhelmed by complex apps, needs encouragement
- **Premium Potential**: Medium - seeks proven results first

#### 4. Intermittent Faster (28-45 years)
- **Goals**: Track fasting windows, maintain eating discipline
- **Behavior**: Uses timer apps, tracks fasting streaks
- **Pain Points**: Needs integrated fasting and nutrition tracking
- **Premium Potential**: High - values comprehensive tracking

---

## 4. Product Goals & Success Metrics

### Business Goals
1. **User Acquisition**: 100,000 active users in Year 1
2. **Premium Conversion**: 8-12% free-to-paid conversion rate
3. **Retention**: 40% D30 retention, 25% D90 retention
4. **Revenue**: $50K MRR by end of Year 1
5. **Platform Expansion**: iOS App Store and Google Play Store launch

### User Success Metrics
1. **Engagement**: Average 4+ meals logged per day
2. **Accuracy**: 95%+ AI food recognition accuracy
3. **Speed**: <30 seconds to log a meal via photo
4. **Satisfaction**: 4.5+ star rating across platforms
5. **Value**: Users report measurable health improvements

### Technical Metrics
1. **Performance**: <2s page load time, 60fps animations
2. **Reliability**: 99.9% uptime, <1% error rate
3. **Scalability**: Support 1M+ daily API requests
4. **Offline**: 100% core features available offline
5. **Security**: SOC 2 compliance, GDPR/CCPA adherence

---

## 5. Core Features & Requirements

### 5.1 Authentication & User Management

#### Priority: P0 (Must Have)

**Requirements:**
- Email/password authentication with email verification (Supabase Auth)
- OAuth support for Google and GitHub providers
- JWT token-based session management with 24-hour expiry
- Secure password reset flow with email confirmation
- User profile management (name, photo, preferences)
- Profile icons (male/female avatar selection)
- Privacy settings and data preferences
- Notification preferences (meal reminders, achievements)

**Acceptance Criteria:**
- ✅ Users can sign up with email verification required
- ✅ OAuth login works for Google and GitHub
- ✅ Sessions expire after 24 hours of inactivity
- ✅ Password reset emails are delivered within 2 minutes
- ✅ Profile updates sync across all devices in <5 seconds

---

### 5.2 AI Food Recognition & Analysis

#### Priority: P0 (Must Have)

**Requirements:**
- **Photo Upload**: Click or drag-and-drop interface
- **AI Analysis**: Google Gemini Vision API integration
- **Food Identification**: Global cuisine database support
- **Nutritional Analysis**: Automatic calorie and macro calculation
- **Composite Foods**: Handle multi-ingredient dishes
- **Automatic Logging**: Direct save to daily meal tracker (no manual confirmation)
- **Photo Management**: Track uploaded photos for privacy compliance
- **Visual Instructions**: Emoji-based user guidance

**Technical Specifications:**
- Image formats: JPEG, PNG, HEIC (max 10MB)
- Processing time: <5 seconds for analysis
- Accuracy target: 90%+ for common foods
- USDA database integration for nutrient lookup
- Supabase storage for photo persistence

**Acceptance Criteria:**
- ✅ Users can upload photos via camera or file picker
- ✅ AI identifies food within 5 seconds
- ✅ Nutrition data is auto-calculated and logged
- ✅ Handles complex dishes (e.g., ethnic foods, restaurant meals)
- ✅ Photos are stored securely with user ownership

---

### 5.3 Meal Logging & Tracking

#### Priority: P0 (Must Have)

**Requirements:**
- **Daily View**: Track breakfast, lunch, dinner, snacks
- **Weekly View**: 7-day calendar with aggregated stats
- **Manual Entry**: CalorieCalculator for manual food input
- **USDA Search**: Search 600,000+ verified food items
- **Custom Foods**: Add user-created foods to database
- **Portion Control**: Flexible serving size adjustments
- **Meal Editing**: Edit or delete logged meals
- **Date Accuracy**: Timezone-aware date handling
- **Data Persistence**: PostgreSQL database-first architecture

**Data Model:**
- Meals table: userId, date, mealType, name, totals
- MealFoods table: mealId, foodId, quantity, unit, nutrients
- Foods table: USDA integration with fdcId, nutrients, verification

**Acceptance Criteria:**
- ✅ Users can log meals manually or via AI
- ✅ Weekly calendar shows accurate daily totals
- ✅ Meal dates match user's local timezone
- ✅ Data persists across devices and sessions
- ✅ Meals can be edited or deleted with confirmation

---

### 5.4 Nutrition Dashboard & Analytics

#### Priority: P0 (Must Have)

**Requirements:**
- **Daily Stats Card**: Calories, protein, carbs, fat
- **Weekly Summary**: 7-day trends and averages
- **Goal Tracking**: Daily calorie and macro goals
- **Progress Visualization**: Charts and graphs (Recharts)
- **Micronutrients**: Vitamins and minerals tracking
- **Water Intake**: 8-glass daily hydration tracker
- **Fasting Integration**: Show fasting status in stats
- **PDF Export**: Generate comprehensive nutrition reports

**Metrics Displayed:**
- Total calories (vs. goal)
- Macros: Protein, Carbs, Fat (grams & %)
- Micros: Vitamins C, D, B12, Folate, Iron, Calcium, Zinc, Magnesium
- Water: Glasses consumed (0-8 daily limit)
- Streaks: Consecutive days meeting goals

**Acceptance Criteria:**
- ✅ Dashboard updates in real-time after meal logging
- ✅ Charts render smoothly with 60fps animations
- ✅ PDF exports include last 7 days of data
- ✅ Goals are editable per user preferences
- ✅ Metrics cache properly with React Query

---

### 5.5 Intermittent Fasting Tracker

#### Priority: P1 (Should Have)

**Requirements:**
- **Fasting Plans**: 16:8, 18:6, 20:4, OMAD, custom
- **Timer Interface**: Live countdown with progress ring
- **Session Management**: Start, pause, complete fasting
- **History Tracking**: Past fasting sessions with stats
- **Status Integration**: Show fasting state in dashboard
- **Achievements**: Fasting streak rewards
- **Notifications**: Fasting start/end reminders

**Data Model:**
- FastingSessions table: userId, planId, startTime, endTime, status
- Status: active, completed, paused
- Duration: targetDuration, actualDuration (milliseconds)

**Acceptance Criteria:**
- ✅ Users can start fasting with plan selection
- ✅ Timer updates every second with visual feedback
- ✅ Fasting history shows all past sessions
- ✅ Dashboard reflects current fasting status
- ✅ Achievements unlock for milestones (7-day streak, etc.)

---

### 5.6 Achievement System

#### Priority: P1 (Should Have)

**Requirements:**
- **Achievement Types**: Daily goals, weekly goals, milestones, special
- **Unlocking Logic**: Automatic detection based on user behavior
- **Notifications**: Bell icon badge, toast messages, modal celebrations
- **Confetti Animations**: Visual celebrations for major achievements
- **Achievement Gallery**: View all earned achievements
- **Icons & Badges**: Visual rewards (trophy, star, flame icons)
- **Points System**: Track achievement points

**Achievement Categories:**
1. **Daily Goals**: "Met calorie goal", "Hit protein target"
2. **Streaks**: "7-day streak", "30-day streak"
3. **Milestones**: "100 meals logged", "50 days tracked"
4. **Fasting**: "First fast completed", "Longest fast"
5. **Hydration**: "8 glasses daily", "7-day hydration streak"
6. **Special**: "Early adopter", "Weekend warrior"

**Acceptance Criteria:**
- ✅ Achievements unlock automatically when earned
- ✅ Notification bell shows unread count
- ✅ Confetti plays for major achievements
- ✅ Gallery displays all achievements with dates
- ✅ Achievement data syncs to database

---

### 5.7 Recipe Management

#### Priority: P2 (Nice to Have)

**Requirements:**
- **Recipe Creation**: Add custom recipes with ingredients
- **Ingredient Management**: Link to foods database
- **Serving Calculations**: Auto-calculate per-serving nutrition
- **Instructions**: Step-by-step recipe instructions
- **Prep/Cook Time**: Track recipe timing
- **Recipe Library**: Save and organize recipes
- **Quick Logging**: Log recipe as meal with one click

**Data Model:**
- Recipes table: userId, name, description, servings, instructions, totals
- RecipeIngredients table: recipeId, foodId, quantity, unit, order

**Acceptance Criteria:**
- ✅ Users can create recipes with multiple ingredients
- ✅ Nutrition auto-calculates based on ingredients
- ✅ Recipes can be logged as meals
- ✅ Recipe library is searchable and filterable
- ✅ Servings adjustment updates nutrition proportionally

---

### 5.8 Food Suggestions & Recommendations

#### Priority: P2 (Nice to Have)

**Requirements:**
- **AI Analysis**: Analyze user eating patterns
- **Personalized Suggestions**: Recommend foods based on deficiencies
- **Priority Ranking**: 1-5 priority for suggestions
- **Reasoning Display**: Show why food is recommended
- **Active Management**: Enable/disable suggestions
- **Category Types**: Improve protein, reduce sodium, add fiber, etc.

**Data Model:**
- FoodSuggestions table: userId, suggestionType, title, description, recommendedFoods, reasoningData, priority

**Acceptance Criteria:**
- ✅ Suggestions appear when user has nutrient gaps
- ✅ Recommendations are actionable and specific
- ✅ Users can dismiss or hide suggestions
- ✅ AI learns from user acceptance/rejection patterns

---

### 5.9 Premium Subscription (RevenueCat)

#### Priority: P1 (Should Have)

**Requirements:**
- **Subscription Tiers**: Free, Premium Monthly, Premium Yearly
- **Payment Processing**: Apple In-App Purchase via RevenueCat
- **Feature Gating**: Premium features locked for free users
- **Subscription Management**: View status, renewal date, cancel
- **Webhook Integration**: Handle RevenueCat events
- **Transaction History**: Track all purchases
- **Grace Period**: Handle failed payments gracefully
- **Restore Purchases**: Cross-device subscription sync

**Premium Features:**
- AI Food Recognition (unlimited vs. 10/month free)
- PDF Export (unlimited vs. 1/week free)
- Advanced Analytics (trends, predictions)
- Recipe Management (unlimited vs. 5 recipes free)
- Priority Support
- Ad-free experience

**Data Model:**
- Subscriptions table: userId, productId, status, tier, expiresAt, renewsAt
- SubscriptionTransactions table: subscriptionId, transactionId, eventType, revenue

**Acceptance Criteria:**
- ✅ Free users see premium feature gates
- ✅ Subscription purchase flow is seamless
- ✅ Premium features unlock immediately after purchase
- ✅ Webhooks update subscription status in real-time
- ✅ Subscription restores across devices

---

### 5.10 Progressive Web App (PWA)

#### Priority: P0 (Must Have)

**Requirements:**
- **Service Worker**: Offline caching, background sync
- **App Manifest**: Install to home screen
- **Offline Mode**: Core features work without internet
- **Push Notifications**: Meal reminders, achievement alerts (web & mobile)
- **App-like UX**: Full-screen, no browser chrome
- **Update Notifications**: Prompt for app updates
- **Local Storage**: Cache user data for offline access

**Technical Specifications:**
- Service worker caching: API responses, static assets
- IndexedDB: Offline meal storage
- Background sync: Queue offline actions
- Web Push API: Notification delivery

**Acceptance Criteria:**
- ✅ Users can install app on iOS, Android, desktop
- ✅ App works offline for meal logging and viewing
- ✅ Push notifications work on all platforms
- ✅ Updates install automatically with user prompt
- ✅ App feels native on mobile devices

---

### 5.11 Mobile App (iOS & Android via Capacitor)

#### Priority: P1 (Should Have)

**Requirements:**
- **Capacitor Integration**: Native app wrapper for PWA
- **Native Plugins**: Camera, Filesystem, Push Notifications, Haptics
- **iOS App Store**: Swift Package Manager (SPM) deployment
- **Google Play Store**: Android deployment
- **App Store Compliance**: Privacy policies, usage descriptions
- **In-App Purchases**: RevenueCat SDK integration
- **Camera Integration**: Native camera for food photos
- **Splash Screen**: Branded launch experience

**iOS Specific:**
- Swift Package Manager (no CocoaPods)
- Privacy usage descriptions for Camera, Photos, Location
- iOS 13+ support
- App Store submission ready

**Android Specific:**
- Android 6.0+ support
- Google Play compliance
- ProGuard configuration

**Acceptance Criteria:**
- ✅ App builds successfully for iOS and Android
- ✅ Native camera opens for photo capture
- ✅ Push notifications work on both platforms
- ✅ In-app purchases process correctly
- ✅ App passes App Store and Play Store review

---

### 5.12 User Settings & Preferences

#### Priority: P0 (Must Have)

**Requirements:**
- **Profile Settings**: Name, email, photo, avatar icon
- **Nutrition Goals**: Daily calories, protein, carbs, fat, water
- **Display Settings**: Theme (light/dark), units (metric/imperial), language
- **Notification Settings**: Meal reminders, achievement alerts, frequency
- **Privacy Settings**: Profile visibility, data sharing preferences
- **Data Export**: Download all user data (GDPR compliance)
- **Account Deletion**: Permanent account and data removal

**Data Model:**
- Users table: personalInfo, privacySettings, notificationSettings, displaySettings
- Nutrition goals: dailyCalorieGoal, dailyProteinGoal, dailyCarbGoal, dailyFatGoal, dailyWaterGoal

**Acceptance Criteria:**
- ✅ All settings persist across sessions
- ✅ Goal changes reflect immediately in dashboard
- ✅ Data export completes within 5 minutes
- ✅ Account deletion removes all user data permanently
- ✅ Privacy settings are enforced consistently

---

## 6. Technical Architecture

### 6.1 Technology Stack

**Frontend:**
- React 18 with TypeScript
- Vite (build tool & dev server)
- Tailwind CSS + shadcn/ui (styling)
- Wouter (routing)
- React Query / TanStack Query (state management)
- React Hook Form + Zod (forms & validation)
- Framer Motion (animations)
- Recharts (data visualization)

**Backend:**
- Node.js + Express (API server)
- TypeScript
- Drizzle ORM (database management)
- tsx (TypeScript runtime for production)
- PostgreSQL (Neon Database)

**Authentication & Storage:**
- Supabase Auth (authentication)
- Supabase Storage (file uploads)
- JWT token verification

**AI & External APIs:**
- Google Gemini Vision API (food recognition)
- USDA FoodData Central API (nutrition data)
- RevenueCat (subscription management)

**Mobile:**
- Capacitor 7.4.3 (iOS & Android wrapper)
- Swift Package Manager (iOS dependencies)
- Capacitor plugins: Camera, Filesystem, Push Notifications, Haptics, Keyboard, Local Notifications, Splash Screen, Status Bar

**Deployment:**
- Railway (cloud hosting - Dockerfile-based)
- Vite build for frontend
- tsx runtime for backend (no compilation)
- Custom domain support (bytewisenutritionist.com)

---

### 6.2 Data Architecture

**Database: PostgreSQL (Neon Database)**

**Core Tables:**
1. **users**: User accounts and profile data
2. **meals**: Logged meal entries
3. **mealFoods**: Individual foods within meals
4. **foods**: Food database (USDA + custom)
5. **usdaFoodCache**: Cached USDA API responses
6. **recipes**: User-created recipes
7. **recipeIngredients**: Recipe components
8. **waterIntake**: Daily water tracking
9. **achievements**: Earned achievements
10. **foodSuggestions**: AI-generated recommendations
11. **fastingSessions**: Fasting timer sessions
12. **subscriptions**: Premium subscription status
13. **subscriptionTransactions**: Payment history
14. **userPhotos**: Uploaded food photos

**Data Flow:**
1. User logs meal → Frontend validation
2. Data sent to Express API → Zod validation
3. Storage layer (Drizzle ORM) → PostgreSQL
4. React Query cache invalidation → UI update
5. Background: USDA sync, AI analysis, achievement check

**Database-First Architecture:**
- PostgreSQL is single source of truth
- React Query handles client-side caching
- localStorage used only for offline fallback
- No localStorage-database hybrid complexity

---

### 6.3 API Architecture

**REST Endpoints:**

**Authentication:**
- POST `/api/auth/signup` - Create account
- POST `/api/auth/signin` - Login
- POST `/api/auth/signout` - Logout
- POST `/api/auth/reset-password` - Password reset
- GET `/api/auth/verify-email` - Email verification

**User Management:**
- GET `/api/user` - Get current user
- PATCH `/api/user` - Update profile
- DELETE `/api/user` - Delete account
- POST `/api/user/goals` - Update nutrition goals

**Meal Tracking:**
- POST `/api/meals/logged` - Log meal
- GET `/api/meals` - Get user meals
- GET `/api/meals/:id` - Get specific meal
- DELETE `/api/meals/:id` - Delete meal
- PATCH `/api/meals/:id` - Update meal

**Statistics:**
- GET `/api/stats/daily` - Daily nutrition stats
- GET `/api/daily-stats` - Daily stats with fasting
- GET `/api/stats/weekly` - Weekly aggregates
- POST `/api/daily-stats` - Update daily stats (water, etc.)

**Food Database:**
- GET `/api/foods/search` - Search USDA database
- POST `/api/foods` - Add custom food
- GET `/api/foods/:id` - Get food details

**AI Analysis:**
- POST `/api/ai/analyze-food` - Gemini Vision analysis
- POST `/api/photos/upload` - Upload food photo

**Achievements:**
- GET `/api/achievements` - Get user achievements
- POST `/api/achievements` - Award achievement

**Fasting:**
- POST `/api/fasting/start` - Start fasting session
- POST `/api/fasting/end` - End fasting session
- GET `/api/fasting/history` - Fasting history

**Subscriptions:**
- GET `/api/subscription/status` - Check premium status
- POST `/api/subscription/webhook` - RevenueCat webhook

---

### 6.4 Security & Privacy

**Authentication Security:**
- Supabase Auth for user management
- JWT tokens with 24-hour expiry
- Secure HTTP-only cookies
- Email verification required
- Rate limiting on auth endpoints

**Data Security:**
- HTTPS/TLS encryption (all traffic)
- PostgreSQL row-level security
- User data isolation (userId foreign keys)
- Secure file uploads to Supabase Storage
- API request authentication via Bearer tokens

**Privacy Compliance:**
- GDPR: Right to access, delete, export data
- CCPA: Data sharing preferences
- App Store Privacy Policy
- Photo deletion on account removal
- No third-party data selling

**Input Validation:**
- Zod schemas on all API endpoints
- SQL injection prevention (Drizzle ORM)
- XSS prevention (React escaping)
- File upload restrictions (type, size)
- Rate limiting on expensive operations

---

### 6.5 Performance Optimization

**Frontend Performance:**
- Code splitting (Vite lazy loading)
- Image optimization (WebP, lazy loading)
- React Query caching (5-minute stale time)
- Debounced search inputs
- Virtualized lists for long data
- 60fps animations (GPU-accelerated)

**Backend Performance:**
- Database indexing (userId, date, fdcId)
- Connection pooling (PostgreSQL)
- USDA API response caching
- Background job processing (achievements)
- CDN for static assets

**Offline Capabilities:**
- Service worker caching
- IndexedDB for offline storage
- Background sync queue
- Stale-while-revalidate strategy
- Offline-first meal logging

**Target Metrics:**
- First Contentful Paint: <1.5s
- Time to Interactive: <3.5s
- Core Web Vitals: All "Good"
- API response time: <200ms (p95)
- Database queries: <50ms (p95)

---

## 7. User Experience (UX) Design

### 7.1 Design System

**Color Palette:**
- Primary: Yellow/Amber gradient (`from-amber-50 to-amber-100`)
- Text: Dark gray (`text-gray-900`, `text-gray-950`)
- Accents: Black/white with amber highlights
- Success: Green
- Warning: Orange
- Error: Red

**Typography:**
- Font Family: System fonts (San Francisco, Segoe UI, Roboto)
- Headings: Bold, large sizes
- Body: Regular, 16px base
- Mobile-first sizing

**Components:**
- shadcn/ui component library
- Radix UI primitives (accessible)
- Lucide React icons (primary)
- Phosphor React icons (navigation)
- Framer Motion animations

**Animations:**
- Navigation: Zoom-rotate effects (1.5x scaling)
- Clicks: Pronounced feedback (600ms)
- Transitions: Smooth page changes
- Celebrations: Confetti, trophy popups
- Progress: Animated rings, bars

---

### 7.2 Navigation Structure

**Bottom Navigation (Mobile):**
1. **Home** (House icon) - Dashboard, quick actions
2. **Meals** (ForkKnife icon) - Daily/weekly tracking
3. **Fasting** (Timer icon) - Fasting tracker
4. **Analytics** (ChartBar icon) - Detailed stats
5. **Profile** (User icon) - Settings, achievements

**Desktop Navigation:**
- Top header with logo, search, notifications, profile
- Sidebar with same navigation options
- Responsive breakpoints at 768px, 1024px

**Navigation Behavior:**
- Active tab highlighting (filled icons, glow effect)
- Smooth tab transitions with background changes
- Breadcrumb navigation for deep sections
- Back button where appropriate

---

### 7.3 Key User Flows

**Onboarding Flow:**
1. Landing page → Sign up
2. Email verification prompt
3. Profile completion modal (goals, preferences)
4. Welcome banner with app tour
5. First meal logging tutorial

**Meal Logging Flow (AI):**
1. Click "AI Analyzer" button
2. Upload photo (camera or file)
3. AI analyzes (5s loading)
4. Nutrition displayed automatically
5. Meal saved to database (no confirmation needed)
6. Toast notification confirms save

**Meal Logging Flow (Manual):**
1. Click "Calorie Calculator"
2. Search USDA database
3. Select food and serving size
4. Add to meal
5. Review totals
6. Save meal

**Fasting Flow:**
1. Navigate to Fasting tab
2. Select fasting plan (16:8, 18:6, etc.)
3. Start timer
4. View live countdown with progress ring
5. Receive notifications at milestones
6. Complete or pause session
7. View session in history

**Subscription Flow:**
1. Attempt premium feature (locked)
2. Premium feature gate modal appears
3. View plan comparison
4. Select plan (monthly/yearly)
5. Apple/Google payment processing
6. RevenueCat webhook confirms
7. Premium features unlock immediately

---

## 8. Success Metrics & KPIs

### 8.1 User Engagement Metrics

**Daily Active Users (DAU):**
- Target: 60% of registered users
- Measurement: Unique logins per day

**Meals Logged Per User:**
- Target: 4+ meals/day (breakfast, lunch, dinner, snack)
- Measurement: Average meal entries per active user

**AI Feature Usage:**
- Target: 50% of meals logged via AI
- Measurement: AI photo uploads vs. manual entries

**Session Duration:**
- Target: 8-12 minutes average
- Measurement: Time between login and logout

**Feature Adoption:**
- Fasting Tracker: 30% of users
- Recipe Management: 20% of users
- Achievement Gallery: 70% of users
- PDF Export: 15% of premium users

---

### 8.2 Business Metrics

**Premium Conversion Rate:**
- Target: 8-12% of active users
- Measurement: Paid subscribers / Total active users

**Monthly Recurring Revenue (MRR):**
- Target: $50K by Month 12
- Measurement: Sum of all active subscriptions

**Customer Lifetime Value (LTV):**
- Target: $120 per user
- Measurement: Average revenue per user over lifetime

**Churn Rate:**
- Target: <5% monthly
- Measurement: Cancelled subscriptions / Total subscribers

**Average Revenue Per User (ARPU):**
- Target: $8-12/month
- Measurement: Total revenue / Active users

---

### 8.3 Product Quality Metrics

**App Performance:**
- Page Load Time: <2 seconds (p95)
- API Response Time: <200ms (p95)
- Error Rate: <1% of all requests
- Crash-free Sessions: >99.5%

**User Satisfaction:**
- App Store Rating: 4.5+ stars
- Net Promoter Score (NPS): >50
- Support Ticket Volume: <5% of users
- Feature Request Votes: Track top 10

**Data Accuracy:**
- AI Recognition Accuracy: >90%
- USDA Data Coverage: >95% of searches
- Nutrition Calculation Accuracy: >99%

---

## 9. Release Strategy

### 9.1 Release Phases

**Phase 1: MVP Launch (Completed)**
- ✅ User authentication (email, OAuth)
- ✅ Manual meal logging (USDA search)
- ✅ Daily stats dashboard
- ✅ Basic achievements
- ✅ PWA deployment

**Phase 2: AI & Premium (Current - v4.1)**
- ✅ Google Gemini Vision integration
- ✅ AI food recognition
- ✅ RevenueCat subscriptions
- ✅ Premium feature gates
- ✅ Fasting tracker
- ✅ Weekly analytics
- 🚧 Railway cloud deployment
- 🚧 Custom domain setup

**Phase 3: Mobile Apps (Planned - v5.0)**
- iOS App Store launch (Capacitor + SPM)
- Google Play Store launch
- Native push notifications
- App Store Optimization (ASO)
- Mobile-specific features

**Phase 4: Advanced Features (Planned - v6.0)**
- Recipe recommendations (AI)
- Meal planning automation
- Social features (sharing, challenges)
- Integrations (Fitbit, Apple Health, Google Fit)
- Advanced analytics (trends, predictions)

**Phase 5: Enterprise (Planned - v7.0)**
- Team/family accounts
- Nutritionist dashboard
- White-label solutions
- API access for partners
- Corporate wellness programs

---

### 9.2 Go-to-Market Strategy

**Target Markets:**
1. **Primary**: United States (English)
2. **Secondary**: Canada, UK, Australia
3. **Tertiary**: Europe (multi-language)

**Launch Channels:**
1. **App Stores**: iOS App Store, Google Play Store
2. **Web**: bytewisenutritionist.com
3. **Social Media**: Instagram, TikTok (food photos)
4. **Content Marketing**: Blog (nutrition tips)
5. **Influencers**: Fitness YouTubers, nutritionists
6. **Paid Ads**: Google Ads, Facebook/Instagram Ads

**Pricing Strategy:**
- **Free Tier**: 10 AI scans/month, basic tracking
- **Premium Monthly**: $9.99/month
- **Premium Yearly**: $79.99/year (33% discount)
- **Promotional**: 7-day free trial, first-time user discount

**Growth Tactics:**
1. Referral program (invite friends, get free month)
2. Achievement badges for sharing on social media
3. SEO optimization (nutrition keywords)
4. App Store Optimization (ASO)
5. Partnership with gyms and nutritionists

---

## 10. Technical Debt & Future Improvements

### 10.1 Known Technical Debt

**High Priority:**
1. **Domain Configuration**: Resolve Replit domain CNAME limitation (use www subdomain or transfer to Cloudflare)
2. **Error Handling**: Improve API error messages and user feedback
3. **Testing Coverage**: Add unit tests, integration tests, E2E tests
4. **Performance Monitoring**: Implement Sentry or LogRocket
5. **Database Migrations**: Formalize migration strategy with Drizzle Kit

**Medium Priority:**
1. **Code Splitting**: Further optimize bundle size
2. **Image Optimization**: Implement WebP conversion pipeline
3. **Accessibility**: WCAG 2.1 AA compliance audit
4. **Internationalization**: i18n framework for multi-language
5. **Analytics Integration**: Google Analytics, Mixpanel, or Amplitude

**Low Priority:**
1. **Refactor Legacy Code**: Simplify complex components
2. **Documentation**: API docs, developer guides
3. **Design System**: Formalize component library
4. **Performance Budgets**: Enforce bundle size limits

---

### 10.2 Future Feature Roadmap

**Q1 2026:**
- Barcode scanning for packaged foods
- Voice logging ("Alexa, log my breakfast")
- Meal photo gallery with filters
- Advanced food suggestions (AI-powered)

**Q2 2026:**
- Social features (friends, challenges)
- Meal plan templates (keto, vegan, etc.)
- Restaurant menu integration (API partnerships)
- Wearable device sync (Apple Watch, Fitbit)

**Q3 2026:**
- Nutritionist collaboration tools
- Team/family accounts
- Custom macros calculator
- Advanced data export (CSV, JSON)

**Q4 2026:**
- AI meal planning (auto-generate weekly plans)
- Grocery list generation from meal plans
- Recipe scaling and unit conversion
- Predictive analytics (weight loss forecasts)

---

## 11. Risk Assessment & Mitigation

### 11.1 Technical Risks

**Risk: AI Accuracy Issues**
- **Impact**: High (core feature)
- **Mitigation**: Manual override, user feedback loop, continuous model training

**Risk: USDA API Downtime**
- **Impact**: Medium (data dependency)
- **Mitigation**: Caching layer, fallback to cached data, alternative APIs

**Risk: Scalability Bottlenecks**
- **Impact**: High (growth limiting)
- **Mitigation**: Database indexing, CDN, horizontal scaling on Railway

**Risk: Security Vulnerabilities**
- **Impact**: Critical (user trust)
- **Mitigation**: Regular security audits, penetration testing, bug bounty program

---

### 11.2 Business Risks

**Risk: Low Premium Conversion**
- **Impact**: High (revenue model)
- **Mitigation**: A/B test pricing, improve free tier limitations, add high-value premium features

**Risk: High User Churn**
- **Impact**: High (retention)
- **Mitigation**: Engagement notifications, achievement system, personalized recommendations

**Risk: App Store Rejection**
- **Impact**: Medium (mobile launch)
- **Mitigation**: Strict compliance with guidelines, privacy policy, usage descriptions

**Risk: Competitive Pressure**
- **Impact**: Medium (market share)
- **Mitigation**: Focus on AI differentiation, superior UX, rapid feature iteration

---

### 11.3 Market Risks

**Risk: Regulatory Changes (GDPR, CCPA)**
- **Impact**: Medium (compliance costs)
- **Mitigation**: Privacy-first architecture, data deletion capabilities, legal counsel

**Risk: AI Model Costs (Gemini API)**
- **Impact**: Medium (unit economics)
- **Mitigation**: Rate limiting, caching, explore alternative models, batch processing

**Risk: User Privacy Concerns**
- **Impact**: Medium (reputation)
- **Mitigation**: Transparent data practices, local processing where possible, clear privacy policy

---

## 12. Appendices

### 12.1 Glossary

- **PWA**: Progressive Web App - Web app installable like native app
- **USDA FDC**: United States Department of Agriculture FoodData Central
- **Gemini Vision**: Google's multimodal AI for image analysis
- **RevenueCat**: Subscription management platform for mobile apps
- **Capacitor**: Framework for building native mobile apps from web code
- **SPM**: Swift Package Manager - Apple's dependency manager
- **Drizzle ORM**: TypeScript ORM for SQL databases
- **Supabase**: Open-source Firebase alternative (auth, storage, database)

### 12.2 References

- **USDA FoodData Central**: https://fdc.nal.usda.gov/
- **Google Gemini API**: https://ai.google.dev/
- **RevenueCat Docs**: https://docs.revenuecat.com/
- **Capacitor Docs**: https://capacitorjs.com/
- **Supabase Docs**: https://supabase.com/docs

### 12.3 Changelog

- **v4.1 (Sep 30, 2025)**: Railway deployment, React Query cache fixes, database-first architecture
- **v4.0 (Sep 11, 2025)**: iOS SPM migration, Capacitor 7.4.3 upgrade
- **v3.5 (Aug 25, 2025)**: Timezone accuracy fixes, dynamic day calculation
- **v3.4 (Aug 24, 2025)**: Navigation animations, Phosphor icons integration
- **v3.3 (Aug 24, 2025)**: Database-first migration, localStorage cleanup

---

**Document End**

*This PRD is a living document and will be updated as the product evolves.*
