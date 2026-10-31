-- Profiles must belong to a login account; user data rows must belong to a profile.

-- Remove profiles whose login account no longer exists (their data cascades).
DELETE FROM public.users p
WHERE NOT EXISTS (SELECT 1 FROM auth.users a WHERE a.id = p.id);

ALTER TABLE public.users
  ADD CONSTRAINT users_id_auth_users_fkey
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.meals ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.water_intake ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.fasting_sessions ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.achievements ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.recipes ALTER COLUMN user_id SET NOT NULL;

-- Water is stored as one row per user per day, dated at midnight UTC.
ALTER TABLE public.water_intake
  ADD CONSTRAINT water_intake_user_id_date_key UNIQUE (user_id, date);
