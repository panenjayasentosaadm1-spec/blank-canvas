/**
 * Corrected database types for the connected external Supabase project.
 *
 * The generated `types.ts` in this directory is stale: it predates column
 * renames in the live database (`anime.poster_url` -> `poster_path`,
 * `episodes.episode_number` -> `number`, `episodes.thumbnail_url` ->
 * `thumbnail_path`, `site_settings.logo_url` -> `logo_path`, removal of
 * `site_settings.created_at`, and the added anime detail columns).
 * This module mirrors the generated file's structure but matches the real
 * schema (verified against live rows via the Data API).
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      allowed_embed_domains: {
        Row: {
          created_at: string
          domain: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          domain: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          domain?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      anime: {
        Row: {
          alt_title: string | null
          created_at: string
          duration_minutes: number | null
          id: string
          is_published: boolean
          poster_path: string | null
          rating: number | null
          season: string | null
          slug: string
          status: Database["public"]["Enums"]["anime_status"]
          studio: string | null
          synopsis: string | null
          title: string
          total_episodes: number | null
          type: Database["public"]["Enums"]["anime_type"]
          updated_at: string
          year: number | null
        }
        Insert: {
          alt_title?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          is_published?: boolean
          poster_path?: string | null
          rating?: number | null
          season?: string | null
          slug: string
          status?: Database["public"]["Enums"]["anime_status"]
          studio?: string | null
          synopsis?: string | null
          title: string
          total_episodes?: number | null
          type?: Database["public"]["Enums"]["anime_type"]
          updated_at?: string
          year?: number | null
        }
        Update: {
          alt_title?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          is_published?: boolean
          poster_path?: string | null
          rating?: number | null
          season?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["anime_status"]
          studio?: string | null
          synopsis?: string | null
          title?: string
          total_episodes?: number | null
          type?: Database["public"]["Enums"]["anime_type"]
          updated_at?: string
          year?: number | null
        }
        Relationships: []
      }
      anime_tags: {
        Row: {
          anime_id: string
          created_at: string
          tag_id: string
        }
        Insert: {
          anime_id: string
          created_at?: string
          tag_id: string
        }
        Update: {
          anime_id?: string
          created_at?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "anime_tags_anime_id_fkey"
            columns: ["anime_id"]
            isOneToOne: false
            referencedRelation: "anime"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anime_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      episodes: {
        Row: {
          anime_id: string
          created_at: string
          embed_url: string | null
          id: string
          is_published: boolean
          number: number
          published_at: string | null
          thumbnail_path: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          anime_id: string
          created_at?: string
          embed_url?: string | null
          id?: string
          is_published?: boolean
          number: number
          published_at?: string | null
          thumbnail_path?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          anime_id?: string
          created_at?: string
          embed_url?: string | null
          id?: string
          is_published?: boolean
          number?: number
          published_at?: string | null
          thumbnail_path?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "episodes_anime_id_fkey"
            columns: ["anime_id"]
            isOneToOne: false
            referencedRelation: "anime"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          ad_slots: Json
          footer_text: string | null
          id: number
          logo_path: string | null
          site_name: string
          tagline: string | null
          updated_at: string
        }
        Insert: {
          ad_slots?: Json
          footer_text?: string | null
          id?: number
          logo_path?: string | null
          site_name?: string
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          ad_slots?: Json
          footer_text?: string | null
          id?: number
          logo_path?: string | null
          site_name?: string
          tagline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          id: string
          name: string
          slug: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      save_ad_slot: {
        Args: { _slot: string; _code: string; _enabled: boolean }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      anime_status: "ongoing" | "completed" | "upcoming"
      anime_type: "tv" | "movie" | "ova" | "ona" | "special"
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      anime_status: ["ongoing", "completed", "upcoming"],
      anime_type: ["tv", "movie", "ova", "ona", "special"],
      app_role: ["admin", "user"],
    },
  },
} as const
