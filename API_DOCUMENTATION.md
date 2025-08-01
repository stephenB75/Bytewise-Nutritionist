# Bytewise API Documentation

## API Architecture Overview

Bytewise uses a serverless architecture with Supabase as the backend-as-a-service, providing REST API endpoints, real-time subscriptions, and authentication services.

## Authentication API

### Supabase Auth Integration
```typescript
// Base Configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Authentication Endpoints

#### Sign Up
```typescript
POST /auth/v1/signup
{
  email: string,
  password: string,
  data?: {
    first_name?: string,
    last_name?: string
  }
}

// Response:
{
  user: User,
  session: Session,
  error?: AuthError
}
```

#### Sign In
```typescript
POST /auth/v1/token?grant_type=password
{
  email: string,
  password: string
}

// Response:
{
  access_token: string,
  refresh_token: string,
  expires_in: number,
  user: User
}
```

#### OAuth Providers
```typescript
// Google OAuth
GET /auth/v1/authorize?provider=google

// GitHub OAuth  
GET /auth/v1/authorize?provider=github

// Response: Redirect to provider with callback
```

#### Session Management
```typescript
// Get Current User
GET /auth/v1/user
Authorization: Bearer <access_token>

// Refresh Token
POST /auth/v1/token?grant_type=refresh_token
{
  refresh_token: string
}

// Sign Out
POST /auth/v1/logout
Authorization: Bearer <access_token>
```

## Database API Endpoints

### Users API

#### Get User Profile
```typescript
GET /rest/v1/users?id=eq.<user_id>
Authorization: Bearer <access_token>

// Response:
{
  id: string,
  email: string,
  first_name: string,
  last_name: string,
  profile_image_url: string,
  personal_info: object,
  privacy_settings: object,
  notification_settings: object,
  display_settings: object,
  daily_calorie_goal: number,
  daily_protein_goal: number,
  daily_carb_goal: number,
  daily_fat_goal: number,
  daily_water_goal: number,
  created_at: string,
  updated_at: string
}
```

#### Update User Profile
```typescript
PATCH /rest/v1/users?id=eq.<user_id>
Authorization: Bearer <access_token>
Content-Type: application/json

{
  first_name?: string,
  last_name?: string,
  personal_info?: object,
  daily_calorie_goal?: number,
  daily_protein_goal?: number,
  daily_carb_goal?: number,
  daily_fat_goal?: number,
  daily_water_goal?: number
}
```

### Foods API

#### Search Foods
```typescript
GET /rest/v1/foods?name=ilike.*<search_term>*&limit=20
Authorization: Bearer <access_token>

// Response:
[{
  id: number,
  fdc_id: number,
  name: string,
  brand: string,
  category: string,
  serving_size: string,
  serving_size_grams: number,
  calories: number,
  protein: number,
  carbs: number,
  fat: number,
  fiber: number,
  sugar: number,
  sodium: number,
  all_nutrients: object,
  verified: boolean,
  is_from_usda: boolean
}]
```

#### Get Food Details
```typescript
GET /rest/v1/foods?id=eq.<food_id>
Authorization: Bearer <access_token>

// Response: Single food item with complete nutrition data
```

#### Add Custom Food
```typescript
POST /rest/v1/foods
Authorization: Bearer <access_token>
Content-Type: application/json

{
  name: string,
  brand?: string,
  category?: string,
  serving_size: string,
  serving_size_grams?: number,
  calories: number,
  protein?: number,
  carbs?: number,
  fat?: number,
  fiber?: number,
  sugar?: number,
  sodium?: number,
  verified: false
}
```

### Meals API

#### Get User Meals
```typescript
GET /rest/v1/meals?user_id=eq.<user_id>&scheduled_for=gte.<date>
Authorization: Bearer <access_token>

// Response:
[{
  id: number,
  user_id: string,
  name: string,
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack',
  scheduled_for: string,
  created_at: string,
  updated_at: string,
  meal_foods: [{
    id: number,
    food_id: number,
    quantity: number,
    unit: string,
    foods: Food
  }]
}]
```

#### Create Meal
```typescript
POST /rest/v1/meals
Authorization: Bearer <access_token>
Content-Type: application/json

{
  name: string,
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack',
  scheduled_for: string,
  meal_foods: [{
    food_id: number,
    quantity: number,
    unit: string
  }]
}
```

#### Update Meal
```typescript
PATCH /rest/v1/meals?id=eq.<meal_id>
Authorization: Bearer <access_token>
Content-Type: application/json

{
  name?: string,
  meal_type?: string,
  scheduled_for?: string
}
```

#### Delete Meal
```typescript
DELETE /rest/v1/meals?id=eq.<meal_id>
Authorization: Bearer <access_token>
```

### Recipes API

#### Get User Recipes
```typescript
GET /rest/v1/recipes?user_id=eq.<user_id>
Authorization: Bearer <access_token>

// Response:
[{
  id: number,
  user_id: string,
  name: string,
  description: string,
  instructions: string,
  servings: number,
  prep_time: number,
  cook_time: number,
  difficulty: 'easy' | 'medium' | 'hard',
  cuisine: string,
  dietary_tags: object,
  created_at: string,
  updated_at: string,
  recipe_ingredients: [{
    id: number,
    food_id: number,
    quantity: number,
    unit: string,
    notes: string,
    foods: Food
  }]
}]
```

#### Create Recipe
```typescript
POST /rest/v1/recipes
Authorization: Bearer <access_token>
Content-Type: application/json

{
  name: string,
  description?: string,
  instructions?: string,
  servings?: number,
  prep_time?: number,
  cook_time?: number,
  difficulty?: 'easy' | 'medium' | 'hard',
  cuisine?: string,
  dietary_tags?: object,
  recipe_ingredients: [{
    food_id: number,
    quantity: number,
    unit: string,
    notes?: string
  }]
}
```

### Water Intake API

#### Get Water Intake History
```typescript
GET /rest/v1/water_intake?user_id=eq.<user_id>&logged_at=gte.<date>
Authorization: Bearer <access_token>

// Response:
[{
  id: number,
  user_id: string,
  glasses: number,
  logged_at: string,
  notes: string
}]
```

#### Log Water Intake
```typescript
POST /rest/v1/water_intake
Authorization: Bearer <access_token>
Content-Type: application/json

{
  glasses: number,
  notes?: string
}
```

### Achievements API

#### Get User Achievements
```typescript
GET /rest/v1/achievements?user_id=eq.<user_id>&order=earned_at.desc
Authorization: Bearer <access_token>

// Response:
[{
  id: number,
  user_id: string,
  achievement_type: string,
  achievement_data: object,
  earned_at: string,
  viewed: boolean
}]
```

#### Mark Achievement as Viewed
```typescript
PATCH /rest/v1/achievements?id=eq.<achievement_id>
Authorization: Bearer <access_token>
Content-Type: application/json

{
  viewed: true
}
```

### Calorie Calculations API

#### Get Calculation History
```typescript
GET /rest/v1/calorie_calculations?user_id=eq.<user_id>&calculated_at=gte.<date>
Authorization: Bearer <access_token>

// Response:
[{
  id: number,
  user_id: string,
  food_name: string,
  quantity: number,
  unit: string,
  calculated_calories: number,
  nutrition_data: object,
  calculated_at: string
}]
```

#### Save Calculation
```typescript
POST /rest/v1/calorie_calculations
Authorization: Bearer <access_token>
Content-Type: application/json

{
  food_name: string,
  quantity: number,
  unit: string,
  calculated_calories: number,
  nutrition_data?: object
}
```

## Real-time Subscriptions

### Supabase Realtime Integration
```typescript
// Subscribe to meal changes
const subscription = supabase
  .channel('meal-changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'meals',
    filter: {user_id: {eq: userId}}
  }, (payload) => {
    // Handle real-time meal updates
    handleMealUpdate(payload)
  })
  .subscribe()

// Subscribe to achievement notifications
const achievementSub = supabase
  .channel('achievements')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'achievements',
    filter: {user_id: {eq: userId}}
  }, (payload) => {
    // Show achievement notification
    showAchievementNotification(payload.new)
  })
  .subscribe()
```

## External API Integration

### USDA FoodData Central API
```typescript
// Base URL
const USDA_API_BASE = 'https://api.nal.usda.gov/fdc/v1'
const API_KEY = process.env.VITE_USDA_API_KEY

// Search Foods
GET ${USDA_API_BASE}/foods/search?query=<search_term>&api_key=${API_KEY}

// Response:
{
  foods: [{
    fdcId: number,
    description: string,
    brandOwner: string,
    gtinUpc: string,
    ingredients: string,
    servingSize: number,
    servingSizeUnit: string,
    foodNutrients: [{
      nutrientId: number,
      nutrientName: string,
      nutrientNumber: string,
      unitName: string,
      value: number
    }]
  }],
  totalHits: number,
  currentPage: number,
  totalPages: number
}

// Get Food Details
GET ${USDA_API_BASE}/food/<fdc_id>?api_key=${API_KEY}

// Response: Complete food nutrition data
```

## Error Handling

### Standard Error Responses
```typescript
// Authentication Errors
{
  error: {
    status: 401,
    message: "Invalid JWT token",
    code: "invalid_token"
  }
}

// Validation Errors
{
  error: {
    status: 400,
    message: "Validation failed",
    details: [{
      field: "email",
      message: "Invalid email format"
    }]
  }
}

// Database Errors
{
  error: {
    status: 500,
    message: "Database operation failed",
    code: "database_error"
  }
}

// Rate Limiting
{
  error: {
    status: 429,
    message: "Too many requests",
    retry_after: 60
  }
}
```

### Client-Side Error Handling
```typescript
// API Request Helper with Error Handling
async function apiRequest(endpoint: string, options?: RequestInit) {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...options?.headers
      }
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`${response.status}: ${error.message}`)
    }

    return await response.json()
  } catch (error) {
    // Handle network errors, token refresh, etc.
    throw error
  }
}
```

## Rate Limiting and Quotas

### Supabase Limits (Free Tier)
- **API Requests**: 50,000 per month
- **Database Reads**: Unlimited
- **Database Writes**: Unlimited
- **Storage**: 1GB total
- **Bandwidth**: 5GB per month

### USDA API Limits
- **Requests per Hour**: 1,000
- **Requests per Day**: 10,000
- **Search Results**: 200 per request
- **Concurrent Requests**: 10

## Security Considerations

### Row Level Security (RLS)
```sql
-- Users can only access their own data
CREATE POLICY users_policy ON users FOR ALL USING (auth.uid() = id);
CREATE POLICY meals_policy ON meals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY recipes_policy ON recipes FOR ALL USING (auth.uid() = user_id);

-- Foods table is publicly readable but requires authentication to modify
CREATE POLICY foods_policy ON foods FOR SELECT USING (true);
CREATE POLICY foods_insert_policy ON foods FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

### API Key Security
- USDA API keys are stored in environment variables
- Supabase keys use service role for server operations
- Client keys (anon) are safe for public exposure
- JWT tokens have automatic expiration and refresh

This API documentation provides comprehensive coverage of all endpoints and integration patterns used in the Bytewise nutrition tracking application.