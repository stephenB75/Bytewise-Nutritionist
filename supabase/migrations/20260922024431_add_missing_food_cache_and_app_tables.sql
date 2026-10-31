-- Missing tables for food cache, photos, subscriptions, and suggestions.
-- Applied to Bytewise-Nutrition (bcfilsryfjwemqytwbvr).
-- user_id columns use uuid to match public.users.id.

CREATE TABLE IF NOT EXISTS user_photos (
  id serial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name varchar NOT NULL,
  storage_path varchar NOT NULL,
  storage_url varchar NOT NULL,
  mime_type varchar NOT NULL,
  file_size integer,
  uploaded_at timestamp DEFAULT now(),
  analysis_id varchar,
  photo_metadata jsonb
);
CREATE INDEX IF NOT EXISTS user_photos_user_id_idx ON user_photos(user_id);
CREATE INDEX IF NOT EXISTS user_photos_uploaded_at_idx ON user_photos(uploaded_at);
CREATE INDEX IF NOT EXISTS user_photos_storage_path_idx ON user_photos(storage_path);

CREATE TABLE IF NOT EXISTS subscriptions (
  id serial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  revenue_cat_user_id varchar,
  original_transaction_id varchar,
  product_id varchar NOT NULL,
  entitlement_id varchar NOT NULL,
  status varchar(50) NOT NULL DEFAULT 'inactive',
  tier varchar(50) NOT NULL DEFAULT 'free',
  purchased_at timestamp,
  expires_at timestamp,
  renews_at timestamp,
  cancelled_at timestamp,
  environment varchar(20) DEFAULT 'production',
  will_renew boolean DEFAULT true,
  grace_period_expires_at timestamp,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subscription_transactions (
  id serial PRIMARY KEY,
  subscription_id integer NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_id varchar NOT NULL,
  original_transaction_id varchar,
  web_order_line_item_id varchar,
  product_id varchar NOT NULL,
  event_type varchar(100) NOT NULL,
  revenue_in_usd numeric(10,2),
  price_in_purchased_currency numeric(10,2),
  currency varchar(10) DEFAULT 'USD',
  webhook_event_id varchar,
  raw_webhook_data jsonb,
  purchased_at timestamp NOT NULL,
  expires_at timestamp,
  created_at timestamp DEFAULT now()
);
CREATE INDEX IF NOT EXISTS subscription_transactions_transaction_id_idx ON subscription_transactions(transaction_id);
CREATE INDEX IF NOT EXISTS subscription_transactions_user_id_idx ON subscription_transactions(user_id);
CREATE INDEX IF NOT EXISTS subscription_transactions_webhook_event_id_idx ON subscription_transactions(webhook_event_id);

CREATE TABLE IF NOT EXISTS food_suggestions (
  id serial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  suggestion_type varchar(100) NOT NULL,
  title varchar(200) NOT NULL,
  description text,
  recommended_foods jsonb,
  reasoning_data jsonb,
  priority integer DEFAULT 1,
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS usda_food_cache (
  id serial PRIMARY KEY,
  fdc_id integer NOT NULL UNIQUE,
  created_at timestamp DEFAULT now(),
  description varchar(500) NOT NULL,
  data_type varchar(50) NOT NULL,
  food_category varchar(200),
  brand_owner varchar(200),
  brand_name varchar(200),
  ingredients text,
  serving_size numeric(8,2),
  serving_size_unit varchar(50),
  household_serving_full_text varchar(200),
  nutrients jsonb NOT NULL,
  last_updated timestamp NOT NULL DEFAULT now(),
  search_count integer DEFAULT 0,
  is_bulk_downloaded boolean DEFAULT false
);
CREATE INDEX IF NOT EXISTS usda_cache_description_idx ON usda_food_cache(description);
CREATE INDEX IF NOT EXISTS usda_cache_category_idx ON usda_food_cache(food_category);
CREATE INDEX IF NOT EXISTS usda_cache_search_count_idx ON usda_food_cache(search_count);

ALTER TABLE user_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usda_food_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_photos_policy ON user_photos FOR ALL TO public USING (auth.uid() = user_id);
CREATE POLICY subscriptions_policy ON subscriptions FOR ALL TO public USING (auth.uid() = user_id);
CREATE POLICY subscription_transactions_policy ON subscription_transactions FOR ALL TO public USING (auth.uid() = user_id);
CREATE POLICY food_suggestions_policy ON food_suggestions FOR ALL TO public USING (auth.uid() = user_id);
CREATE POLICY usda_food_cache_select_policy ON usda_food_cache FOR SELECT TO public USING (true);
CREATE POLICY fasting_sessions_policy ON fasting_sessions FOR ALL TO public USING (auth.uid() = user_id);
