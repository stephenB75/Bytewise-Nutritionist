-- Opt into Supabase's new Data API default: new objects in public are not
-- auto-exposed to anon / authenticated / service_role.
--
-- Existing tables, sequences, and functions keep their current grants.
-- After this, any new public table, sequence, or function needs an explicit
-- GRANT before supabase-js / PostgREST can use it. Example:
--
--   grant select, insert, update, delete on public.your_table to service_role;
--   grant select on public.your_table to authenticated;

alter default privileges for role postgres in schema public
  revoke select, insert, update, delete on tables from anon, authenticated, service_role;

alter default privileges for role postgres in schema public
  revoke execute on functions from anon, authenticated, service_role;

alter default privileges for role postgres in schema public
  revoke usage, select on sequences from anon, authenticated, service_role;

alter default privileges for role postgres in schema public
  revoke execute on functions from public;
