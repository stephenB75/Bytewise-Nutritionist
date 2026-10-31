-- Fix signup "Database error" when public.users already has the email (legacy row without auth.users).
CREATE OR REPLACE FUNCTION public.relink_user_references(old_id uuid, new_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF old_id IS NULL OR new_id IS NULL OR old_id = new_id THEN
    RETURN;
  END IF;

  UPDATE public.achievements SET user_id = new_id WHERE user_id = old_id;
  UPDATE public.fasting_sessions SET user_id = new_id WHERE user_id = old_id;
  UPDATE public.meals SET user_id = new_id WHERE user_id = old_id;
  UPDATE public.recipes SET user_id = new_id WHERE user_id = old_id;
  UPDATE public.water_intake SET user_id = new_id WHERE user_id = old_id;
  UPDATE public.user_photos SET user_id = new_id WHERE user_id = old_id;
  UPDATE public.subscriptions SET user_id = new_id WHERE user_id = old_id;
  UPDATE public.subscription_transactions SET user_id = new_id WHERE user_id = old_id;
  UPDATE public.food_suggestions SET user_id = new_id WHERE user_id = old_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  legacy_id uuid;
BEGIN
  SELECT id INTO legacy_id
  FROM public.users
  WHERE email IS NOT NULL
    AND lower(trim(email)) = lower(trim(NEW.email))
    AND id <> NEW.id
  LIMIT 1;

  IF legacy_id IS NOT NULL THEN
    PERFORM public.relink_user_references(legacy_id, NEW.id);
    DELETE FROM public.users WHERE id = legacy_id;
  END IF;

  INSERT INTO public.users (id, email, email_verified, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.email_confirmed_at IS NOT NULL,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    email_verified = EXCLUDED.email_verified,
    updated_at = now();

  RETURN NEW;
END;
$$;
