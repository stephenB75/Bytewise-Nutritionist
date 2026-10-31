-- Dietary sugar (grams) logged with each meal for the dashboard Sugar card.
-- Not blood glucose / CGM.

alter table public.meals
  add column if not exists total_sugar numeric(8, 2) default 0;
