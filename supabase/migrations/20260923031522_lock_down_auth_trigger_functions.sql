-- Trigger helpers run as SECURITY DEFINER; they must not be callable via /rest/v1/rpc.
REVOKE EXECUTE ON FUNCTION public.relink_user_references(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
