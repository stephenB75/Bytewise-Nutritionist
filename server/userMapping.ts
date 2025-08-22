/**
 * User ID Mapping Utility
 * Handles mapping between Supabase user IDs and database user IDs
 */

import { storage } from "./storage";
import { supabaseAdmin } from "./supabaseAuth";

/**
 * Maps Supabase user ID to database user ID by looking up user by email
 */
export async function mapSupabaseIdToDatabaseId(supabaseUserId: string): Promise<string> {
  try {
    // First, try to find user directly by Supabase ID
    const directUser = await storage.getUser(supabaseUserId);
    if (directUser) {
      return supabaseUserId; // User exists with Supabase ID
    }

    // If not found, try to map via email
    const { data: supabaseUser } = await supabaseAdmin.auth.admin.getUserById(supabaseUserId);
    if (supabaseUser?.user?.email) {
      const allUsers = await storage.getAllUsers();
      const userByEmail = allUsers.find(u => u.email === supabaseUser.user.email);
      if (userByEmail) {
        console.log('📍 Mapped Supabase ID to database ID:', {
          supabaseId: supabaseUserId.substring(0, 8) + '...',
          databaseId: userByEmail.id.substring(0, 8) + '...',
          email: supabaseUser.user.email
        });
        return userByEmail.id;
      }
    }

    // If no mapping found, return original ID
    return supabaseUserId;
  } catch (error) {
    console.log('⚠️ Failed to map user ID:', error);
    return supabaseUserId; // Fallback to original ID
  }
}