/**
 * User ID Mapping Utility
 * Handles mapping between Supabase user IDs and database user IDs
 */

import { storage } from "./storage";
import { getSupabaseAdmin } from "./supabaseAuth";

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
    const admin = getSupabaseAdmin();
    if (!admin) {
      // Supabase not available in preview mode, return original ID
      return supabaseUserId;
    }
    const { data: supabaseUser } = await admin.auth.admin.getUserById(supabaseUserId);
    if (supabaseUser?.user?.email) {
      const allUsers = await storage.getAllUsers();
      const userByEmail = allUsers.find(u => u.email === supabaseUser.user.email);
      if (userByEmail) {
        // Successfully mapped user ID
        return userByEmail.id;
      }
    }

    // If no mapping found, return original ID
    return supabaseUserId;
  } catch (error) {
    // User ID mapping failed, using fallback
    return supabaseUserId; // Fallback to original ID
  }
}