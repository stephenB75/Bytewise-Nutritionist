-- Wrap auth.uid()/auth.role() in a subselect so Postgres evaluates them once per
-- statement instead of once per row. Access rules are unchanged.

alter policy achievements_policy on public.achievements using ((select auth.uid()) = user_id);
alter policy fasting_sessions_policy on public.fasting_sessions using ((select auth.uid()) = user_id);
alter policy food_suggestions_policy on public.food_suggestions using ((select auth.uid()) = user_id);
alter policy foods_insert_policy on public.foods with check ((select auth.role()) = 'authenticated');
alter policy meals_policy on public.meals using ((select auth.uid()) = user_id);
alter policy recipes_policy on public.recipes using ((select auth.uid()) = user_id);
alter policy subscription_transactions_policy on public.subscription_transactions using ((select auth.uid()) = user_id);
alter policy subscriptions_policy on public.subscriptions using ((select auth.uid()) = user_id);
alter policy user_photos_policy on public.user_photos using ((select auth.uid()) = user_id);
alter policy users_policy on public.users using ((select auth.uid()) = id);
alter policy water_intake_policy on public.water_intake using ((select auth.uid()) = user_id);

alter policy meal_foods_policy on public.meal_foods using (
  exists (select 1 from public.meals where meals.id = meal_foods.meal_id and meals.user_id = (select auth.uid()))
);
alter policy recipe_ingredients_policy on public.recipe_ingredients using (
  exists (select 1 from public.recipes where recipes.id = recipe_ingredients.recipe_id and recipes.user_id = (select auth.uid()))
);

-- meals_policy (ALL) already covers these.
drop policy if exists meals_insert_own on public.meals;
drop policy if exists meals_select_own on public.meals;

create index if not exists recipes_user_id_idx on public.recipes (user_id);
create index if not exists recipe_ingredients_food_id_idx on public.recipe_ingredients (food_id);
create index if not exists recipe_ingredients_recipe_id_idx on public.recipe_ingredients (recipe_id);
create index if not exists meal_foods_food_id_idx on public.meal_foods (food_id);
create index if not exists meal_foods_recipe_id_idx on public.meal_foods (recipe_id);
create index if not exists fasting_sessions_user_id_idx on public.fasting_sessions (user_id);
create index if not exists subscriptions_user_id_idx on public.subscriptions (user_id);
create index if not exists subscription_transactions_subscription_id_idx on public.subscription_transactions (subscription_id);
create index if not exists food_suggestions_user_id_idx on public.food_suggestions (user_id);
