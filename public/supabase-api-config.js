/**
 * Stale-deploy shim.
 * Older production HTML still loads this file and previously rewrote /api
 * requests to missing Supabase functions. This no-op keeps fetch pointed
 * at the Express server.
 */
(function () {
  // Intentionally empty: Express owns /api, /health, and /ready.
})();
