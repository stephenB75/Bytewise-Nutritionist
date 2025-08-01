# 🚀 Complete Database Setup Guide

## Step 1: Access Supabase SQL Editor
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click on your Bytewise project
3. In the left sidebar, click **"SQL Editor"**
4. Click **"New query"**

## Step 2: Copy the Database Schema
The complete schema is in `supabase/migrations/001_initial_schema.sql`

**Copy this entire SQL code:**

```sql
-- Bytewise Nutrition Tracker - Initial Database Schema
-- Serverless Supabase Migration

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (enhanced for nutrition tracking)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR UNIQUE,
  email_verified BOOLEAN DEFAULT FALSE,
  first_name VARCHAR,
  last_name VARCHAR,
  profile_image_url VARCHAR,
  
  -- Enhanced profile information
  personal_info JSONB, -- age, height, weight, activity level, etc.
  privacy_settings JSONB, -- profile visibility, data sharing preferences
  notification_settings JSONB, -- meal reminders, achievement alerts
  display_settings JSONB, -- theme, units (metric/imperial), language
  
  -- Nutrition goals
  daily_calorie_goal INTEGER DEFAULT 2000,
  daily_protein_goal INTEGER DEFAULT 150,
  daily_carb_goal INTEGER DEFAULT 200,
  daily_fat_goal INTEGER DEFAULT 70,
  daily_water_goal INTEGER DEFAULT 8, -- glasses
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Food database - Enhanced with USDA integration
CREATE TABLE foods (
  id SERIAL PRIMARY KEY,
  
  -- USDA FoodData Central integration
  fdc_id INTEGER, -- USDA FDC ID for API reference
  usda_data_type VARCHAR(50), -- Branded, Foundation, Survey, etc.
  
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(255),
  category VARCHAR(100),
  serving_size VARCHAR(100) NOT NULL,
  serving_size_grams DECIMAL(8,2),
  
  -- Basic nutrition (per serving)
  calories DECIMAL(8,2) NOT NULL,
  protein DECIMAL(8,2) DEFAULT 0,
  carbs DECIMAL(8,2) DEFAULT 0,
  fat DECIMAL(8,2) DEFAULT 0,
  fiber DECIMAL(8,2) DEFAULT 0,
  sugar DECIMAL(8,2) DEFAULT 0,
  sodium DECIMAL(8,2) DEFAULT 0, -- in mg
  
  -- Additional USDA nutrients
  all_nutrients JSONB, -- Complete USDA nutrient data
  
  verified BOOLEAN DEFAULT FALSE,
  is_from_usda BOOLEAN DEFAULT FALSE,
  last_usda_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Continue with the rest of the schema from the migration file...
```

## Step 3: Execute the Schema
1. Paste the complete SQL code into the Supabase SQL Editor
2. Click the **"Run"** button (or press Ctrl+Enter)
3. Wait for "Success. No rows returned" message

## Step 4: Verify Setup
After running the SQL:
1. Go to **"Table Editor"** in your Supabase dashboard
2. You should see all these tables:
   - users
   - foods  
   - recipes
   - recipe_ingredients
   - meals
   - meal_foods
   - water_intake
   - achievements
   - calorie_calculations

## Step 5: Test Your App
1. Return to your Replit project
2. Refresh the app
3. You should now see the Bytewise login screen!

## What This Creates:
- **Complete user authentication system**
- **Nutrition tracking database with USDA integration**
- **Recipe management and meal planning**
- **Water intake monitoring** 
- **Achievement system**
- **Secure Row Level Security policies**

Your Bytewise nutrition tracker will be fully operational with all features enabled!

---

## Troubleshooting:
- **"relation already exists" errors**: Ignore these, they're safe
- **Permission errors**: Make sure you're the project owner
- **Timeout**: Try running the schema in smaller sections

Need help? Just let me know!