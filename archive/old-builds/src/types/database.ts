/**
 * Supabase Database Types
 * Auto-generated types for Bytewise nutrition tracker
 */

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string | null;
          email_verified: boolean | null;
          first_name: string | null;
          last_name: string | null;
          profile_image_url: string | null;
          personal_info: Json | null;
          privacy_settings: Json | null;
          notification_settings: Json | null;
          display_settings: Json | null;
          created_at: string | null;
          updated_at: string | null;
          daily_calorie_goal: number | null;
          daily_protein_goal: number | null;
          daily_carb_goal: number | null;
          daily_fat_goal: number | null;
          daily_water_goal: number | null;
        };
        Insert: {
          id?: string;
          email?: string | null;
          email_verified?: boolean | null;
          first_name?: string | null;
          last_name?: string | null;
          profile_image_url?: string | null;
          personal_info?: Json | null;
          privacy_settings?: Json | null;
          notification_settings?: Json | null;
          display_settings?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
          daily_calorie_goal?: number | null;
          daily_protein_goal?: number | null;
          daily_carb_goal?: number | null;
          daily_fat_goal?: number | null;
          daily_water_goal?: number | null;
        };
        Update: {
          id?: string;
          email?: string | null;
          email_verified?: boolean | null;
          first_name?: string | null;
          last_name?: string | null;
          profile_image_url?: string | null;
          personal_info?: Json | null;
          privacy_settings?: Json | null;
          notification_settings?: Json | null;
          display_settings?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
          daily_calorie_goal?: number | null;
          daily_protein_goal?: number | null;
          daily_carb_goal?: number | null;
          daily_fat_goal?: number | null;
          daily_water_goal?: number | null;
        };
      };
      foods: {
        Row: {
          id: number;
          fdc_id: number | null;
          usda_data_type: string | null;
          name: string;
          brand: string | null;
          category: string | null;
          serving_size: string;
          serving_size_grams: string | null;
          calories: string;
          protein: string | null;
          carbs: string | null;
          fat: string | null;
          fiber: string | null;
          sugar: string | null;
          sodium: string | null;
          all_nutrients: Json | null;
          verified: boolean | null;
          is_from_usda: boolean | null;
          last_usda_sync: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: number;
          fdc_id?: number | null;
          usda_data_type?: string | null;
          name: string;
          brand?: string | null;
          category?: string | null;
          serving_size: string;
          serving_size_grams?: string | null;
          calories: string;
          protein?: string | null;
          carbs?: string | null;
          fat?: string | null;
          fiber?: string | null;
          sugar?: string | null;
          sodium?: string | null;
          all_nutrients?: Json | null;
          verified?: boolean | null;
          is_from_usda?: boolean | null;
          last_usda_sync?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: number;
          fdc_id?: number | null;
          usda_data_type?: string | null;
          name?: string;
          brand?: string | null;
          category?: string | null;
          serving_size?: string;
          serving_size_grams?: string | null;
          calories?: string;
          protein?: string | null;
          carbs?: string | null;
          fat?: string | null;
          fiber?: string | null;
          sugar?: string | null;
          sodium?: string | null;
          all_nutrients?: Json | null;
          verified?: boolean | null;
          is_from_usda?: boolean | null;
          last_usda_sync?: string | null;
          created_at?: string | null;
        };
      };
      meals: {
        Row: {
          id: number;
          user_id: string;
          name: string;
          meal_type: string;
          scheduled_for: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: number;
          user_id: string;
          name: string;
          meal_type: string;
          scheduled_for?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: number;
          user_id?: string;
          name?: string;
          meal_type?: string;
          scheduled_for?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      meal_foods: {
        Row: {
          id: number;
          meal_id: number;
          food_id: number;
          quantity: string;
          unit: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: number;
          meal_id: number;
          food_id: number;
          quantity: string;
          unit?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: number;
          meal_id?: number;
          food_id?: number;
          quantity?: string;
          unit?: string | null;
          created_at?: string | null;
        };
      };
      recipes: {
        Row: {
          id: number;
          user_id: string;
          name: string;
          description: string | null;
          instructions: string | null;
          servings: number | null;
          prep_time: number | null;
          cook_time: number | null;
          difficulty: string | null;
          cuisine: string | null;
          dietary_tags: Json | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: number;
          user_id: string;
          name: string;
          description?: string | null;
          instructions?: string | null;
          servings?: number | null;
          prep_time?: number | null;
          cook_time?: number | null;
          difficulty?: string | null;
          cuisine?: string | null;
          dietary_tags?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: number;
          user_id?: string;
          name?: string;
          description?: string | null;
          instructions?: string | null;
          servings?: number | null;
          prep_time?: number | null;
          cook_time?: number | null;
          difficulty?: string | null;
          cuisine?: string | null;
          dietary_tags?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never;