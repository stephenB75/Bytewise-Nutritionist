# Bytewise Components Documentation

## Component Architecture Overview

Bytewise follows a modular component architecture with clear separation of concerns, type safety, and reusable design patterns.

## Core Application Components

### App.tsx
**Purpose**: Main application entry point and state management
```typescript
// Key Features:
- Tab-based navigation system
- Global state management
- Authentication wrapper integration
- Image rotation system initialization
- PWA install prompt management

// Props: None (root component)
// State: activeTab, showNotifications, notificationCount
// Hooks: useImageRotation()
```

### AuthWrapper.tsx / SupabaseAuthWrapper.tsx
**Purpose**: Authentication state management and route protection
```typescript
// Key Features:
- Supabase authentication integration
- Session persistence and management
- Protected route handling
- User profile data loading
- Authentication error handling

// Props: { children: React.ReactNode }
// Context: Provides user authentication state
// API: Supabase Auth service
```

## Page Components

### Dashboard.tsx
**Purpose**: Main nutrition tracking dashboard with daily overview
```typescript
// Key Features:
- Daily calorie progress visualization
- Recent meals display
- Quick action buttons
- Water intake tracking
- Achievement notifications

// Data Sources:
- User profile and goals
- Daily meal logs
- Water intake records
- Achievement progress

// Child Components:
- CalorieProgressRing
- RecentMealsList
- QuickActionButtons
- WaterIntakeWidget
```

### CalorieCalculator.tsx / CalorieCalculatorWrapper.tsx
**Purpose**: Food search and nutrition calculation tool
```typescript
// Key Features:
- USDA food database search
- Serving size conversion
- Real-time calorie calculation
- Nutrition facts display
- Food logging functionality

// API Integration:
- USDA FoodData Central API
- Local food database caching
- Measurement unit conversions

// Child Components:
- FoodSearchInput
- FoodResultsList
- ServingSizeSelector
- NutritionDisplay
- LogMealButton
```

### WeeklyLogger.tsx
**Purpose**: Weekly meal planning and nutrition overview
```typescript
// Key Features:
- Calendar-based meal planning
- Weekly nutrition aggregation
- Meal scheduling interface
- Drag-and-drop meal organization
- Shopping list generation

// Data Management:
- Weekly meal schedules
- Nutrition goal tracking
- Meal template system
- Historical data analysis

// Child Components:
- WeeklyCalendar
- MealPlanningGrid
- NutritionSummary
- ShoppingListGenerator
```

### ProfileEnhanced.tsx
**Purpose**: User profile management and settings
```typescript
// Key Features:
- Personal information editing
- Nutrition goal setting
- Privacy settings management
- Theme preference selection
- Account management

// Settings Categories:
- Personal Info (age, height, weight)
- Nutrition Goals (calories, macros)
- Privacy Settings (data sharing)
- Display Settings (theme, units)
- Notification Settings

// Child Components:
- PersonalInfoForm
- NutritionGoalsForm
- PrivacySettings
- ThemeSelector
- NotificationSettings
```

## Navigation Components

### Navigation.tsx
**Purpose**: Bottom tab navigation system
```typescript
// Key Features:
- Mobile-first bottom tab design
- Active state management
- Smooth transition animations
- Badge notifications
- Touch-optimized interface

// Navigation Items:
- Dashboard (home)
- Calculator (search)
- Weekly Logger (calendar)
- Profile (user)

// Props: { activeTab: string, onTabChange: (tab: string) => void }
// State: Tab selection and animation states
```

### Header.tsx
**Purpose**: Application header with branding and actions
```typescript
// Key Features:
- Bytewise branding and logo
- User avatar and menu
- Notification bell with count
- Search functionality
- Settings access

// Props: { 
//   user?: User, 
//   notificationCount: number,
//   onNotificationClick: () => void 
// }
// Child Components:
- BrandLogo
- UserAvatar
- NotificationBell
- HeaderActions
```

## Utility Components

### Brand.tsx / LogoBrand.tsx
**Purpose**: Consistent branding and logo display
```typescript
// Key Features:
- CSS-based geometric logo
- Responsive sizing
- Theme-aware colors
- Animation support
- Accessibility compliance

// Variants:
- Full logo with text
- Icon-only version
- Monochrome versions
- Different sizes (sm, md, lg, xl)

// Props: { size?: string, variant?: string, className?: string }
```

### PWAInstallPrompt.tsx
**Purpose**: Progressive Web App installation interface
```typescript
// Key Features:
- Cross-platform install detection
- iOS-specific instructions
- Install prompt triggering
- Installation status tracking
- User dismissal handling

// Platform Support:
- Chrome/Edge (beforeinstallprompt)
- Safari iOS (Add to Home Screen)
- Firefox (manual instructions)
- Samsung Internet

// Props: { onInstall?: () => void, onDismiss?: () => void }
```

### NotificationDropdown.tsx / NotificationSystem.tsx
**Purpose**: Notification management and display
```typescript
// Key Features:
- Achievement notifications
- Meal reminders
- Goal progress alerts
- System notifications
- Notification history

// Notification Types:
- Achievement earned
- Daily goal reached
- Meal reminder
- Weekly summary
- System updates

// Props: { 
//   notifications: Notification[], 
//   onMarkRead: (id: string) => void,
//   onClearAll: () => void 
// }
```

## Data Management Components

### FoodDatabaseManager.tsx
**Purpose**: USDA food database integration and management
```typescript
// Key Features:
- USDA API integration
- Local food database caching
- Search result optimization
- Nutrition data normalization
- Offline functionality

// API Operations:
- Food search queries
- Nutrition data retrieval
- Serving size conversions
- Brand food lookup
- Recent searches caching

// Methods:
- searchFoods(query: string)
- getFoodDetails(fdcId: number)
- convertServingSize(food: Food, targetUnit: string)
- cacheSearchResults(results: Food[])
```

### MealPlanner.tsx
**Purpose**: Meal planning and scheduling functionality
```typescript
// Key Features:
- Meal template system
- Recipe integration
- Nutrition calculation
- Shopping list generation
- Meal history tracking

// Planning Features:
- Weekly meal scheduling
- Nutrition goal alignment
- Recipe suggestions
- Leftover management
- Grocery list automation

// Data Structures:
- MealPlan interface
- Recipe integration
- Nutrition aggregation
- Shopping list items
```

## UI Library Components

### shadcn/ui Components
**Base Components**: Imported from shadcn/ui library
```typescript
// Form Components:
- Button, Input, Select, Checkbox
- Form, FormField, FormControl, FormLabel
- Dialog, Sheet, Popover, Dropdown

// Display Components:
- Card, Badge, Avatar, Progress
- Table, Tabs, Accordion, Collapsible
- Alert, Toast, Skeleton, Separator

// Navigation Components:
- NavigationMenu, Breadcrumb
- Pagination, Command, MenuBar

// Data Components:
- DataTable, Calendar, DatePicker
- Slider, Toggle, Switch, RadioGroup
```

### Custom UI Components
**Enhanced Components**: Built on top of shadcn/ui
```typescript
// Nutrition-Specific:
- CalorieProgressRing: Circular progress with calorie display
- NutritionFactsPanel: Standardized nutrition information
- MacroBreakdownChart: Protein/carbs/fat visualization
- ServingSizeSelector: Unit conversion interface

// Data Visualization:
- WeeklyProgressChart: Line chart for weekly trends
- CalorieDistributionPie: Meal-based calorie breakdown
- WaterIntakeProgress: Hydration tracking visual
- AchievementBadges: Gamification elements

// Mobile Optimization:
- TouchFriendlyButton: 44px minimum touch target
- SwipeableCard: Left/right swipe actions
- PullToRefresh: Mobile refresh gesture
- BottomSheet: Mobile-first modal interface
```

## Hook Components

### useAuth.ts
**Purpose**: Authentication state management
```typescript
// Features:
- User session management
- Login/logout functionality
- Token refresh handling
- Authentication error recovery

// Returns:
- user: User | null
- isLoading: boolean
- isAuthenticated: boolean
- login: (credentials) => Promise<void>
- logout: () => Promise<void>
```

### useNutrition.ts
**Purpose**: Nutrition data management
```typescript
// Features:
- Daily nutrition calculations
- Goal progress tracking
- Meal aggregation
- Historical data analysis

// Returns:
- dailyNutrition: NutritionSummary
- weeklyTrends: NutritionTrend[]
- addMeal: (meal: Meal) => Promise<void>
- updateGoals: (goals: NutritionGoals) => Promise<void>
```

### useImageRotation.ts
**Purpose**: Dynamic background image management
```typescript
// Features:
- Automatic image rotation
- App open/close detection
- Visibility change tracking
- Image preloading

// Configuration:
- Rotation intervals
- Image pool management
- Performance optimization
- User preference handling
```

## State Management Patterns

### TanStack Query Integration
```typescript
// Query Keys:
- ['/api/user'] - User profile data
- ['/api/meals', userId] - User meal history
- ['/api/foods', searchQuery] - Food search results
- ['/api/achievements', userId] - User achievements

// Mutations:
- logMeal: Add meal to database
- updateProfile: Update user information
- createRecipe: Save new recipe
- trackWater: Log water intake
```

### Local State Management
```typescript
// Component State:
- Form state with react-hook-form
- UI state (modals, dropdowns, loading)
- Temporary data (search queries, drafts)
- Navigation state (active tabs, routes)

// Context Providers:
- AuthContext: User authentication state
- ThemeContext: Light/dark mode preference
- NotificationContext: Notification management
- SettingsContext: User preferences
```

## Component Communication Patterns

### Props and Events
```typescript
// Parent-Child Communication:
- Props for data down
- Callback functions for events up
- Context for deeply nested data
- Custom events for cross-component communication

// Example:
interface MealLoggerProps {
  onMealLogged: (meal: Meal) => void;
  nutritionGoals: NutritionGoals;
  userId: string;
}
```

### Global State Updates
```typescript
// Real-time Updates:
- Supabase real-time subscriptions
- TanStack Query cache invalidation
- Optimistic UI updates
- Error state management

// Event-Driven Architecture:
- Achievement system triggers
- Notification dispatching
- Analytics event tracking
- Background sync operations
```

This component architecture provides a scalable, maintainable, and type-safe foundation for the Bytewise nutrition tracking application.