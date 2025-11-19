// Supabase Edge Function: API Proxy
// Routes /api/* requests to appropriate Supabase operations
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const path = url.pathname

    // Get authorization header
    const authHeader = req.headers.get('Authorization') || 
                      req.headers.get('authorization') ||
                      `Bearer ${req.headers.get('apikey') || ''}`

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
    
    const supabaseClient = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: authHeader ? { Authorization: authHeader } : {},
      },
    })

    // Get user if authenticated
    let user = null
    if (authHeader && authHeader !== 'Bearer ') {
      const { data: { user: authUser } } = await supabaseClient.auth.getUser()
      user = authUser
    }

    // Route: /api/auth/user
    if (path === '/api/auth/user' || path.endsWith('/api/auth/user')) {
      if (!user) {
        return new Response(
          JSON.stringify({ user: null, offline: false }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      return new Response(
        JSON.stringify({ user }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Route: /api/meals/logged
    if (path === '/api/meals/logged' || path.endsWith('/api/meals/logged')) {
      if (!user) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { data: meals, error } = await supabaseClient
        .from('meals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify(meals || []),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Route: /api/user/photos
    if (path === '/api/user/photos' || path.endsWith('/api/user/photos')) {
      if (!user) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (req.method === 'GET') {
        const { data: photos, error } = await supabaseClient
          .from('user_photos')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify(photos || []),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (req.method === 'DELETE') {
        const photoId = url.searchParams.get('id')
        if (!photoId) {
          return new Response(
            JSON.stringify({ error: 'Photo ID required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { error } = await supabaseClient
          .from('user_photos')
          .delete()
          .eq('id', photoId)
          .eq('user_id', user.id)

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Route: /api/user/sync-data
    if (path === '/api/user/sync-data' || path.endsWith('/api/user/sync-data')) {
      if (!user) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (req.method === 'POST') {
        const body = await req.json()
        const { key, data, timestamp } = body

        if (!key || !data) {
          return new Response(
            JSON.stringify({ error: 'Key and data required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const { error } = await supabaseClient
          .from('user_sync_data')
          .upsert({
            user_id: user.id,
            sync_key: key,
            data: data,
            last_synced: timestamp || new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,sync_key'
          })

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        const itemsBackedUp = Array.isArray(data) ? data.length : 1

        return new Response(
          JSON.stringify({ 
            success: true, 
            itemsBackedUp,
            syncedAt: new Date().toISOString()
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Route: /api/version
    if (path === '/api/version' || path.endsWith('/api/version')) {
      return new Response(
        JSON.stringify({
          version: '1.0.0',
          api: 'supabase-edge-functions',
          supabase: true,
          timestamp: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Route: /api/foods or /api/usda/search (placeholder - can be extended)
    if (path.includes('/api/foods') || path.includes('/api/usda/search')) {
      // This would typically call an external USDA API or use Supabase storage
      // For now, return empty array
      return new Response(
        JSON.stringify([]),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 404 for unknown routes
    return new Response(
      JSON.stringify({ error: 'Not found', path }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

