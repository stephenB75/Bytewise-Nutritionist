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

-- User recipes
CREATE TABLE recipes (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  instructions TEXT,
  servings INTEGER,
  prep_time INTEGER, -- minutes
  cook_time INTEGER, -- minutes
  difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
  cuisine VARCHAR(100),
  dietary_tags JSONB, -- vegetarian, vegan, gluten-free, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipe ingredients
CREATE TABLE recipe_ingredients (
  id SERIAL PRIMARY KEY,
  recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
  food_id INTEGER REFERENCES foods(id) ON DELETE CASCADE,
  quantity DECIMAL(8,2) NOT NULL,
  unit VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User meals (planned or logged)
CREATE TABLE meals (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  meal_type VARCHAR(50) NOT NULL, -- breakfast, lunch, dinner, snack
  scheduled_for TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Foods in meals
CREATE TABLE meal_foods (
  id SERIAL PRIMARY KEY,
  meal_id INTEGER REFERENCES meals(id) ON DELETE CASCADE,
  food_id INTEGER REFERENCES foods(id) ON DELETE CASCADE,
  quantity DECIMAL(8,2) NOT NULL,
  unit VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Water intake tracking
CREATE TABLE water_intake (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  glasses INTEGER NOT NULL DEFAULT 1,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);

-- User achievements
CREATE TABLE achievements (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_type VARCHAR(100) NOT NULL,
  achievement_data JSONB,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  viewed BOOLEAN DEFAULT FALSE
);

-- Calorie calculations (logged from calculator)
CREATE TABLE calorie_calculations (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  food_name VARCHAR(255) NOT NULL,
  quantity DECIMAL(8,2) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  calculated_calories DECIMAL(8,2) NOT NULL,
  nutrition_data JSONB,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_foods_name ON foods(name);
CREATE INDEX idx_foods_fdc_id ON foods(fdc_id);
CREATE INDEX idx_foods_category ON foods(category);
CREATE INDEX idx_meals_user_id ON meals(user_id);
CREATE INDEX idx_meals_scheduled_for ON meals(scheduled_for);
CREATE INDEX idx_meal_foods_meal_id ON meal_foods(meal_id);
CREATE INDEX idx_achievements_user_id ON achievements(user_id);
CREATE INDEX idx_water_intake_user_id ON water_intake(user_id);
CREATE INDEX idx_water_intake_logged_at ON water_intake(logged_at);
CREATE INDEX idx_calorie_calculations_user_id ON calorie_calculations(user_id);
CREATE INDEX idx_calorie_calculations_calculated_at ON calorie_calculations(calculated_at);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_intake ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE calorie_calculations ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY users_policy ON users FOR ALL USING (auth.uid() = id);
CREATE POLICY recipes_policy ON recipes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY meals_policy ON meals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY water_intake_policy ON water_intake FOR ALL USING (auth.uid() = user_id);
CREATE POLICY achievements_policy ON achievements FOR ALL USING (auth.uid() = user_id);
CREATE POLICY calorie_calculations_policy ON calorie_calculations FOR ALL USING (auth.uid() = user_id);

-- Recipe ingredients can be accessed by recipe owner
CREATE POLICY recipe_ingredients_policy ON recipe_ingredients FOR ALL USING (
  EXISTS (SELECT 1 FROM recipes WHERE recipes.id = recipe_ingredients.recipe_id AND recipes.user_id = auth.uid())
);

-- Meal foods can be accessed by meal owner
CREATE POLICY meal_foods_policy ON meal_foods FOR ALL USING (
  EXISTS (SELECT 1 FROM meals WHERE meals.id = meal_foods.meal_id AND meals.user_id = auth.uid())
);

-- Foods table is public read, but only authenticated users can add
CREATE POLICY foods_policy ON foods FOR SELECT USING (true);
CREATE POLICY foods_insert_policy ON foods FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Functions for updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_meals_updated_at BEFORE UPDATE ON meals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();