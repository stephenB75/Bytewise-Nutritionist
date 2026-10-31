-- One-time: remove public.users rows with no auth.users account (blocks sign-up email unique constraint).
DELETE FROM public.users p
WHERE p.email IS NOT NULL
  AND trim(p.email) <> ''
  AND NOT EXISTS (
    SELECT 1 FROM auth.users a WHERE a.id = p.id
  );
