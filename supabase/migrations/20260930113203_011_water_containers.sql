-- What each day's water was drunk from, keyed by container size in ounces, e.g. {"8": 1, "16": 2}.
-- glasses stays the source of truth for the total (in 8 oz glasses).

alter table public.water_intake
  add column if not exists containers jsonb;
