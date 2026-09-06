export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      availability_rules: {
        Row: {
          active: boolean
          buffer_minutes: number
          created_at: string
          end_minute: number
          id: string
          min_notice_hours: number
          slot_minutes: number
          start_minute: number
          timezone: string
          updated_at: string
          weekday: number
        }
        Insert: {
          active?: boolean
          buffer_minutes?: number
          created_at?: string
          end_minute: number
          id?: string
          min_notice_hours?: number
          slot_minutes?: number
          start_minute: number
          timezone?: string
          updated_at?: string
          weekday: number
        }
        Update: {
          active?: boolean
          buffer_minutes?: number
          created_at?: string
          end_minute?: number
          id?: string
          min_notice_hours?: number
          slot_minutes?: number
          start_minute?: number
          timezone?: string
          updated_at?: string
          weekday?: number
        }
        Relationships: []
      }
      bookings: {
        Row: {
          cancelled_at: string | null
          created_at: string
          ends_at: string
          id: string
          intake: Json
          reschedule_count: number
          service_slug: string
          starts_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cancelled_at?: string | null
          created_at?: string
          ends_at: string
          id?: string
          intake?: Json
          reschedule_count?: number
          service_slug: string
          starts_at: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cancelled_at?: string | null
          created_at?: string
          ends_at?: string
          id?: string
          intake?: Json
          reschedule_count?: number
          service_slug?: string
          starts_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          active: boolean
          body: string
          created_at: string
          id: string
          slug: string
          subject: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          body: string
          created_at?: string
          id?: string
          slug: string
          subject: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          body?: string
          created_at?: string
          id?: string
          slug?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      event_attendees: {
        Row: {
          answers: Json
          business_name: string | null
          consent_email: boolean
          consent_sms: boolean
          created_at: string
          email: string | null
          event_id: string
          full_name: string | null
          id: string
          profile_id: string | null
        }
        Insert: {
          answers?: Json
          business_name?: string | null
          consent_email?: boolean
          consent_sms?: boolean
          created_at?: string
          email?: string | null
          event_id: string
          full_name?: string | null
          id?: string
          profile_id?: string | null
        }
        Update: {
          answers?: Json
          business_name?: string | null
          consent_email?: boolean
          consent_sms?: boolean
          created_at?: string
          email?: string | null
          event_id?: string
          full_name?: string | null
          id?: string
          profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_attendees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_attendees_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          city: string | null
          created_at: string
          description: string | null
          ends_at: string | null
          id: string
          published: boolean
          slug: string
          starts_at: string
          title: string
          updated_at: string
          venue: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          published?: boolean
          slug: string
          starts_at: string
          title: string
          updated_at?: string
          venue?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          published?: boolean
          slug?: string
          starts_at?: string
          title?: string
          updated_at?: string
          venue?: string | null
        }
        Relationships: []
      }
      industries: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      interviews: {
        Row: {
          approved_for_posting: boolean
          business_name: string | null
          caption: string | null
          consent_confirmed: boolean
          created_at: string
          editing_notes: string | null
          editing_status: string | null
          email: string | null
          event_name: string | null
          final_video_link: string | null
          full_name: string
          id: string
          instagram: string | null
          interview_date: string | null
          notes: string | null
          other_links: string | null
          overall_status: string | null
          phone: string | null
          photo_link: string | null
          posted_links: string | null
          posting_status: string | null
          profile_id: string | null
          slug: string
          updated_at: string
          video_approved: boolean
          video_link: string | null
        }
        Insert: {
          approved_for_posting?: boolean
          business_name?: string | null
          caption?: string | null
          consent_confirmed?: boolean
          created_at?: string
          editing_notes?: string | null
          editing_status?: string | null
          email?: string | null
          event_name?: string | null
          final_video_link?: string | null
          full_name: string
          id?: string
          instagram?: string | null
          interview_date?: string | null
          notes?: string | null
          other_links?: string | null
          overall_status?: string | null
          phone?: string | null
          photo_link?: string | null
          posted_links?: string | null
          posting_status?: string | null
          profile_id?: string | null
          slug: string
          updated_at?: string
          video_approved?: boolean
          video_link?: string | null
        }
        Update: {
          approved_for_posting?: boolean
          business_name?: string | null
          caption?: string | null
          consent_confirmed?: boolean
          created_at?: string
          editing_notes?: string | null
          editing_status?: string | null
          email?: string | null
          event_name?: string | null
          final_video_link?: string | null
          full_name?: string
          id?: string
          instagram?: string | null
          interview_date?: string | null
          notes?: string | null
          other_links?: string | null
          overall_status?: string | null
          phone?: string | null
          photo_link?: string | null
          posted_links?: string | null
          posting_status?: string | null
          profile_id?: string | null
          slug?: string
          updated_at?: string
          video_approved?: boolean
          video_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interviews_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      person_handles: {
        Row: {
          created_at: string
          handle: string
          id: string
          platform: string
          profile_id: string
        }
        Insert: {
          created_at?: string
          handle: string
          id?: string
          platform: string
          profile_id: string
        }
        Update: {
          created_at?: string
          handle?: string
          id?: string
          platform?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "person_handles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      person_notes: {
        Row: {
          author_id: string | null
          body: string
          created_at: string
          id: string
          profile_id: string
        }
        Insert: {
          author_id?: string | null
          body: string
          created_at?: string
          id?: string
          profile_id: string
        }
        Update: {
          author_id?: string | null
          body?: string
          created_at?: string
          id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "person_notes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          business_name: string | null
          consent_community: boolean
          consent_email: boolean
          consent_sms: boolean
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          industry_id: string | null
          lead_stage: string
          phone: string | null
          primary_source: string | null
          tags: string[]
          updated_at: string
        }
        Insert: {
          business_name?: string | null
          consent_community?: boolean
          consent_email?: boolean
          consent_sms?: boolean
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          industry_id?: string | null
          lead_stage?: string
          phone?: string | null
          primary_source?: string | null
          tags?: string[]
          updated_at?: string
        }
        Update: {
          business_name?: string | null
          consent_community?: boolean
          consent_email?: boolean
          consent_sms?: boolean
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          industry_id?: string | null
          lead_stage?: string
          phone?: string | null
          primary_source?: string | null
          tags?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_industry_id_fkey"
            columns: ["industry_id"]
            isOneToOne: false
            referencedRelation: "industries"
            referencedColumns: ["id"]
          },
        ]
      }
      score_submissions: {
        Row: {
          answers: Json
          area_scores: Json
          band: string
          business_name: string | null
          claimed_by: string | null
          consent_community: boolean
          consent_email: boolean
          consent_sms: boolean
          consent_terms_at: string | null
          created_at: string
          email: string
          full_name: string
          handles: Json
          id: string
          phone: string | null
          primary_source: string | null
          token: string
          top_fixes: Json
          total_score: number
          updated_at: string
          website: string | null
        }
        Insert: {
          answers?: Json
          area_scores?: Json
          band: string
          business_name?: string | null
          claimed_by?: string | null
          consent_community?: boolean
          consent_email?: boolean
          consent_sms?: boolean
          consent_terms_at?: string | null
          created_at?: string
          email: string
          full_name: string
          handles?: Json
          id?: string
          phone?: string | null
          primary_source?: string | null
          token: string
          top_fixes?: Json
          total_score: number
          updated_at?: string
          website?: string | null
        }
        Update: {
          answers?: Json
          area_scores?: Json
          band?: string
          business_name?: string | null
          claimed_by?: string | null
          consent_community?: boolean
          consent_email?: boolean
          consent_sms?: boolean
          consent_terms_at?: string | null
          created_at?: string
          email?: string
          full_name?: string
          handles?: Json
          id?: string
          phone?: string | null
          primary_source?: string | null
          token?: string
          top_fixes?: Json
          total_score?: number
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      touchpoints: {
        Row: {
          created_at: string
          detail: Json
          email: string | null
          id: string
          kind: string
          profile_id: string | null
          source: string | null
        }
        Insert: {
          created_at?: string
          detail?: Json
          email?: string | null
          id?: string
          kind: string
          profile_id?: string | null
          source?: string | null
        }
        Update: {
          created_at?: string
          detail?: Json
          email?: string | null
          id?: string
          kind?: string
          profile_id?: string | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "touchpoints_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      waitlists: {
        Row: {
          business_name: string | null
          consent_email: boolean
          created_at: string
          email: string
          full_name: string
          id: string
          note: string | null
          phone: string | null
          service_slug: string
          source: string | null
        }
        Insert: {
          business_name?: string | null
          consent_email?: boolean
          created_at?: string
          email: string
          full_name: string
          id?: string
          note?: string | null
          phone?: string | null
          service_slug: string
          source?: string | null
        }
        Update: {
          business_name?: string | null
          consent_email?: boolean
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          note?: string | null
          phone?: string | null
          service_slug?: string
          source?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "visitor"
        | "client"
        | "network_member"
        | "content_manager"
        | "editor"
        | "admin"
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
      app_role: [
        "visitor",
        "client",
        "network_member",
        "content_manager",
        "editor",
        "admin",
      ],
    },
  },
} as const
