export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      huggingface_api_keys: {
        Row: {
          api_key: string
          created_at: string | null
          id: string
          is_active: boolean | null
          last_used_at: string | null
        }
        Insert: {
          api_key: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
        }
        Update: {
          api_key?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          image_url: string | null
          is_read: boolean | null
          link: string | null
          link_names: string | null
          message: string
          read_at: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_read?: boolean | null
          link?: string | null
          link_names?: string | null
          message: string
          read_at?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_read?: boolean | null
          link?: string | null
          link_names?: string | null
          message?: string
          read_at?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bonus_credits: number
          created_at: string | null
          credit_count: number
          display_name: string | null
          followers_count: number | null
          following_count: number | null
          id: string
          is_admin: boolean | null
          is_pro: boolean | null
          is_pro_request: boolean | null
          last_refill_time: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bonus_credits?: number
          created_at?: string | null
          credit_count?: number
          display_name?: string | null
          followers_count?: number | null
          following_count?: number | null
          id: string
          is_admin?: boolean | null
          is_pro?: boolean | null
          is_pro_request?: boolean | null
          last_refill_time?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bonus_credits?: number
          created_at?: string | null
          credit_count?: number
          display_name?: string | null
          followers_count?: number | null
          following_count?: number | null
          id?: string
          is_admin?: boolean | null
          is_pro?: boolean | null
          is_pro_request?: boolean | null
          last_refill_time?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_follows: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_image_likes: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          image_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          image_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          image_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_image_likes_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "user_images"
            referencedColumns: ["id"]
          },
        ]
      }
      user_images: {
        Row: {
          aspect_ratio: string
          created_at: string | null
          height: number
          id: string
          image_url: string | null
          is_hot: boolean
          is_private: boolean
          is_trending: boolean
          like_count: number
          model: string
          negative_prompt: string | null
          prompt: string
          quality: string
          seed: number
          status: string | null
          storage_path: string
          user_id: string | null
          width: number
        }
        Insert: {
          aspect_ratio: string
          created_at?: string | null
          height: number
          id?: string
          image_url?: string | null
          is_hot?: boolean
          is_private?: boolean
          is_trending?: boolean
          like_count?: number
          model: string
          negative_prompt?: string | null
          prompt: string
          quality: string
          seed: number
          status?: string | null
          storage_path: string
          user_id?: string | null
          width: number
        }
        Update: {
          aspect_ratio?: string
          created_at?: string | null
          height?: number
          id?: string
          image_url?: string | null
          is_hot?: boolean
          is_private?: boolean
          is_trending?: boolean
          like_count?: number
          model?: string
          negative_prompt?: string | null
          prompt?: string
          quality?: string
          seed?: number
          status?: string | null
          storage_path?: string
          user_id?: string | null
          width?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_bonus_credits: {
        Args: {
          p_user_id: string
          p_bonus_amount: number
        }
        Returns: number
      }
      delete_old_read_notifications: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_random_huggingface_api_key: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      refill_user_credits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      similarity: {
        Args: {
          query: string
          document: string
        }
        Returns: number
      }
      update_trending_and_hot_status: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
