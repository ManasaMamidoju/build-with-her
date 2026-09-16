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
      band_rules: {
        Row: {
          active: boolean
          band: string
          created_at: string
          headline: string | null
          id: string
          line: string | null
          max_score: number
          min_score: number
          primary_service_slug: string | null
          secondary_service_slug: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          band: string
          created_at?: string
          headline?: string | null
          id?: string
          line?: string | null
          max_score: number
          min_score: number
          primary_service_slug?: string | null
          secondary_service_slug?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          band?: string
          created_at?: string
          headline?: string | null
          id?: string
          line?: string | null
          max_score?: number
          min_score?: number
          primary_service_slug?: string | null
          secondary_service_slug?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "band_rules_primary_service_slug_fkey"
            columns: ["primary_service_slug"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "band_rules_secondary_service_slug_fkey"
            columns: ["secondary_service_slug"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["slug"]
          },
        ]
      }
      blog_post_views: {
        Row: {
          slug: string
          updated_at: string
          views: number
        }
        Insert: {
          slug: string
          updated_at?: string
          views?: number
        }
        Update: {
          slug?: string
          updated_at?: string
          views?: number
        }
        Relationships: []
      }
      bookings: {
        Row: {
          cancelled_at: string | null
          created_at: string
          ends_at: string
          google_event_id: string | null
          id: string
          intake: Json
          meet_link: string | null
          person_id: string | null
          reschedule_count: number
          service_slug: string
          starts_at: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          cancelled_at?: string | null
          created_at?: string
          ends_at: string
          google_event_id?: string | null
          id?: string
          intake?: Json
          meet_link?: string | null
          person_id?: string | null
          reschedule_count?: number
          service_slug: string
          starts_at: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          cancelled_at?: string | null
          created_at?: string
          ends_at?: string
          google_event_id?: string | null
          id?: string
          intake?: Json
          meet_link?: string | null
          person_id?: string | null
          reschedule_count?: number
          service_slug?: string
          starts_at?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      deliverable_notes: {
        Row: {
          author_id: string | null
          author_role: string
          body: string
          created_at: string
          deliverable_id: string
          id: string
        }
        Insert: {
          author_id?: string | null
          author_role?: string
          body: string
          created_at?: string
          deliverable_id: string
          id?: string
        }
        Update: {
          author_id?: string | null
          author_role?: string
          body?: string
          created_at?: string
          deliverable_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliverable_notes_deliverable_id_fkey"
            columns: ["deliverable_id"]
            isOneToOne: false
            referencedRelation: "deliverables"
            referencedColumns: ["id"]
          },
        ]
      }
      deliverable_reviews: {
        Row: {
          action: string
          comment: string | null
          created_at: string
          deliverable_id: string
          id: string
          reviewer_id: string
        }
        Insert: {
          action: string
          comment?: string | null
          created_at?: string
          deliverable_id: string
          id?: string
          reviewer_id: string
        }
        Update: {
          action?: string
          comment?: string | null
          created_at?: string
          deliverable_id?: string
          id?: string
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliverable_reviews_deliverable_id_fkey"
            columns: ["deliverable_id"]
            isOneToOne: false
            referencedRelation: "deliverables"
            referencedColumns: ["id"]
          },
        ]
      }
      deliverables: {
        Row: {
          admin_approved: boolean
          approved_for_posting: boolean
          assigned_to: string | null
          cm_approved: boolean
          created_at: string
          edited_url: string | null
          editor_due_at: string | null
          final_url: string | null
          frameio_url: string | null
          id: string
          internal_notes: string | null
          kind: string
          project_id: string
          published_url: string | null
          raw_url: string | null
          review_due_at: string | null
          revisions_allowed: number
          revisions_used: number
          stage: string
          team_notes: string | null
          title: string
          updated_at: string
        }
        Insert: {
          admin_approved?: boolean
          approved_for_posting?: boolean
          assigned_to?: string | null
          cm_approved?: boolean
          created_at?: string
          edited_url?: string | null
          editor_due_at?: string | null
          final_url?: string | null
          frameio_url?: string | null
          id?: string
          internal_notes?: string | null
          kind?: string
          project_id: string
          published_url?: string | null
          raw_url?: string | null
          review_due_at?: string | null
          revisions_allowed?: number
          revisions_used?: number
          stage?: string
          team_notes?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          admin_approved?: boolean
          approved_for_posting?: boolean
          assigned_to?: string | null
          cm_approved?: boolean
          created_at?: string
          edited_url?: string | null
          editor_due_at?: string | null
          final_url?: string | null
          frameio_url?: string | null
          id?: string
          internal_notes?: string | null
          kind?: string
          project_id?: string
          published_url?: string | null
          raw_url?: string | null
          review_due_at?: string | null
          revisions_allowed?: number
          revisions_used?: number
          stage?: string
          team_notes?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliverables_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
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
      episodes: {
        Row: {
          article_md: string | null
          collaborator_added: boolean
          created_at: string
          guest_person_id: string | null
          guest_profile_id: string | null
          id: string
          interview_id: string | null
          is_public: boolean
          note_image_url: string | null
          project_id: string | null
          published_at: string | null
          slug: string
          summary: string | null
          title: string
          transcript_url: string | null
          updated_at: string
          youtube_url: string | null
        }
        Insert: {
          article_md?: string | null
          collaborator_added?: boolean
          created_at?: string
          guest_person_id?: string | null
          guest_profile_id?: string | null
          id?: string
          interview_id?: string | null
          is_public?: boolean
          note_image_url?: string | null
          project_id?: string | null
          published_at?: string | null
          slug: string
          summary?: string | null
          title: string
          transcript_url?: string | null
          updated_at?: string
          youtube_url?: string | null
        }
        Update: {
          article_md?: string | null
          collaborator_added?: boolean
          created_at?: string
          guest_person_id?: string | null
          guest_profile_id?: string | null
          id?: string
          interview_id?: string | null
          is_public?: boolean
          note_image_url?: string | null
          project_id?: string | null
          published_at?: string | null
          slug?: string
          summary?: string | null
          title?: string
          transcript_url?: string | null
          updated_at?: string
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "episodes_guest_person_id_fkey"
            columns: ["guest_person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "episodes_guest_profile_id_fkey"
            columns: ["guest_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "episodes_interview_id_fkey"
            columns: ["interview_id"]
            isOneToOne: false
            referencedRelation: "interviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "episodes_interview_id_fkey"
            columns: ["interview_id"]
            isOneToOne: false
            referencedRelation: "interviews_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "episodes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
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
          person_id: string | null
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
          person_id?: string | null
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
          person_id?: string | null
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
            foreignKeyName: "event_attendees_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
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
      guest_pages: {
        Row: {
          bio: string | null
          business_name: string | null
          city: string | null
          created_at: string
          episode_id: string | null
          full_name: string
          id: string
          interview_id: string | null
          is_public: boolean
          links: Json
          person_id: string | null
          photo_url: string | null
          profile_id: string | null
          slug: string
          updated_at: string
          website: string | null
        }
        Insert: {
          bio?: string | null
          business_name?: string | null
          city?: string | null
          created_at?: string
          episode_id?: string | null
          full_name: string
          id?: string
          interview_id?: string | null
          is_public?: boolean
          links?: Json
          person_id?: string | null
          photo_url?: string | null
          profile_id?: string | null
          slug: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          bio?: string | null
          business_name?: string | null
          city?: string | null
          created_at?: string
          episode_id?: string | null
          full_name?: string
          id?: string
          interview_id?: string | null
          is_public?: boolean
          links?: Json
          person_id?: string | null
          photo_url?: string | null
          profile_id?: string | null
          slug?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guest_pages_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_pages_interview_id_fkey"
            columns: ["interview_id"]
            isOneToOne: false
            referencedRelation: "interviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_pages_interview_id_fkey"
            columns: ["interview_id"]
            isOneToOne: false
            referencedRelation: "interviews_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_pages_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_pages_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
          person_id: string | null
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
          person_id?: string | null
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
          person_id?: string | null
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
            foreignKeyName: "interviews_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interviews_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      metrics_entries: {
        Row: {
          created_at: string
          id: string
          metric_key: string
          period: string
          person_id: string | null
          profile_id: string
          source: string
          stage: string
          updated_at: string
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          metric_key: string
          period: string
          person_id?: string | null
          profile_id: string
          source?: string
          stage: string
          updated_at?: string
          value?: number
        }
        Update: {
          created_at?: string
          id?: string
          metric_key?: string
          period?: string
          person_id?: string | null
          profile_id?: string
          source?: string
          stage?: string
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "metrics_entries_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metrics_entries_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          active: boolean
          commission_pct: number
          company: string | null
          contact_email: string | null
          created_at: string
          id: string
          name: string
          notes: string | null
          referral_code: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          commission_pct?: number
          company?: string | null
          contact_email?: string | null
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          referral_code: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          commission_pct?: number
          company?: string | null
          contact_email?: string | null
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          referral_code?: string
          updated_at?: string
        }
        Relationships: []
      }
      people: {
        Row: {
          blocked: boolean
          blocked_reason: string | null
          business_name: string | null
          business_type: string | null
          city: string | null
          consent_confirmed: boolean
          consent_confirmed_at: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          identity_status: string
          industry_id: string | null
          lead_stage: string
          phone: string | null
          photo_url: string | null
          primary_source: string | null
          profile_id: string | null
          research_status: string
          research_summary: string | null
          source_detail: string | null
          tags: string[]
          updated_at: string
          website: string | null
        }
        Insert: {
          blocked?: boolean
          blocked_reason?: string | null
          business_name?: string | null
          business_type?: string | null
          city?: string | null
          consent_confirmed?: boolean
          consent_confirmed_at?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          identity_status?: string
          industry_id?: string | null
          lead_stage?: string
          phone?: string | null
          photo_url?: string | null
          primary_source?: string | null
          profile_id?: string | null
          research_status?: string
          research_summary?: string | null
          source_detail?: string | null
          tags?: string[]
          updated_at?: string
          website?: string | null
        }
        Update: {
          blocked?: boolean
          blocked_reason?: string | null
          business_name?: string | null
          business_type?: string | null
          city?: string | null
          consent_confirmed?: boolean
          consent_confirmed_at?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          identity_status?: string
          industry_id?: string | null
          lead_stage?: string
          phone?: string | null
          photo_url?: string | null
          primary_source?: string | null
          profile_id?: string | null
          research_status?: string
          research_summary?: string | null
          source_detail?: string | null
          tags?: string[]
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "people_industry_id_fkey"
            columns: ["industry_id"]
            isOneToOne: false
            referencedRelation: "industries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "people_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
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
          person_id: string | null
          platform: string
          profile_id: string | null
        }
        Insert: {
          created_at?: string
          handle: string
          id?: string
          person_id?: string | null
          platform: string
          profile_id?: string | null
        }
        Update: {
          created_at?: string
          handle?: string
          id?: string
          person_id?: string | null
          platform?: string
          profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "person_handles_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
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
          person_id: string | null
          profile_id: string | null
        }
        Insert: {
          author_id?: string | null
          body: string
          created_at?: string
          id?: string
          person_id?: string | null
          profile_id?: string | null
        }
        Update: {
          author_id?: string | null
          body?: string
          created_at?: string
          id?: string
          person_id?: string | null
          profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "person_notes_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "person_notes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      podcast_applications: {
        Row: {
          answers: Json
          business_name: string | null
          city: string | null
          created_at: string
          email: string
          format: string
          full_name: string
          id: string
          instagram: string | null
          notes: string | null
          person_id: string | null
          phone: string | null
          profile_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          source: string | null
          status: string
          updated_at: string
          website: string | null
        }
        Insert: {
          answers?: Json
          business_name?: string | null
          city?: string | null
          created_at?: string
          email: string
          format?: string
          full_name: string
          id?: string
          instagram?: string | null
          notes?: string | null
          person_id?: string | null
          phone?: string | null
          profile_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source?: string | null
          status?: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          answers?: Json
          business_name?: string | null
          city?: string | null
          created_at?: string
          email?: string
          format?: string
          full_name?: string
          id?: string
          instagram?: string | null
          notes?: string | null
          person_id?: string | null
          phone?: string | null
          profile_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source?: string | null
          status?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "podcast_applications_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "podcast_applications_profile_id_fkey"
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
          id?: string
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
      project_stages: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          name: string
          project_id: string
          sort_order: number
          status: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          name: string
          project_id: string
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          name?: string
          project_id?: string
          sort_order?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_stages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          due_at: string | null
          id: string
          interview_id: string | null
          name: string
          notes: string | null
          owner_id: string | null
          person_id: string | null
          profile_id: string | null
          stage: string | null
          started_at: string | null
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          due_at?: string | null
          id?: string
          interview_id?: string | null
          name: string
          notes?: string | null
          owner_id?: string | null
          person_id?: string | null
          profile_id?: string | null
          stage?: string | null
          started_at?: string | null
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          due_at?: string | null
          id?: string
          interview_id?: string | null
          name?: string
          notes?: string | null
          owner_id?: string | null
          person_id?: string | null
          profile_id?: string | null
          stage?: string | null
          started_at?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_interview_id_fkey"
            columns: ["interview_id"]
            isOneToOne: false
            referencedRelation: "interviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_interview_id_fkey"
            columns: ["interview_id"]
            isOneToOne: false
            referencedRelation: "interviews_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          attributed_at: string
          commission_cents: number
          converted: boolean
          created_at: string
          email: string | null
          id: string
          partner_id: string
          person_id: string | null
          profile_id: string | null
        }
        Insert: {
          attributed_at?: string
          commission_cents?: number
          converted?: boolean
          created_at?: string
          email?: string | null
          id?: string
          partner_id: string
          person_id?: string | null
          profile_id?: string | null
        }
        Update: {
          attributed_at?: string
          commission_cents?: number
          converted?: boolean
          created_at?: string
          email?: string | null
          id?: string
          partner_id?: string
          person_id?: string | null
          profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          person_id: string | null
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
          person_id?: string | null
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
          person_id?: string | null
          phone?: string | null
          primary_source?: string | null
          token?: string
          top_fixes?: Json
          total_score?: number
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "score_submissions_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          active: boolean
          best_for: string | null
          created_at: string
          cta_label: string | null
          cta_note: string | null
          duration: string | null
          faqs: Json
          id: string
          includes: string[]
          name: string
          price: string | null
          price_note: string | null
          requires: string[]
          slug: string
          sort_order: number
          step: string | null
          summary: string | null
          updated_at: string
          waitlist: boolean
        }
        Insert: {
          active?: boolean
          best_for?: string | null
          created_at?: string
          cta_label?: string | null
          cta_note?: string | null
          duration?: string | null
          faqs?: Json
          id?: string
          includes?: string[]
          name: string
          price?: string | null
          price_note?: string | null
          requires?: string[]
          slug: string
          sort_order?: number
          step?: string | null
          summary?: string | null
          updated_at?: string
          waitlist?: boolean
        }
        Update: {
          active?: boolean
          best_for?: string | null
          created_at?: string
          cta_label?: string | null
          cta_note?: string | null
          duration?: string | null
          faqs?: Json
          id?: string
          includes?: string[]
          name?: string
          price?: string | null
          price_note?: string | null
          requires?: string[]
          slug?: string
          sort_order?: number
          step?: string | null
          summary?: string | null
          updated_at?: string
          waitlist?: boolean
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
          person_id: string | null
          profile_id: string | null
          source: string | null
        }
        Insert: {
          created_at?: string
          detail?: Json
          email?: string | null
          id?: string
          kind: string
          person_id?: string | null
          profile_id?: string | null
          source?: string | null
        }
        Update: {
          created_at?: string
          detail?: Json
          email?: string | null
          id?: string
          kind?: string
          person_id?: string | null
          profile_id?: string | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "touchpoints_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
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
          person_id: string | null
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
          person_id?: string | null
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
          person_id?: string | null
          phone?: string | null
          service_slug?: string
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "waitlists_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      interviews_public: {
        Row: {
          business_name: string | null
          event_name: string | null
          final_video_link: string | null
          full_name: string | null
          id: string | null
          instagram: string | null
          interview_date: string | null
          posted_links: string | null
          slug: string | null
        }
        Insert: {
          business_name?: string | null
          event_name?: string | null
          final_video_link?: string | null
          full_name?: string | null
          id?: string | null
          instagram?: string | null
          interview_date?: string | null
          posted_links?: string | null
          slug?: string | null
        }
        Update: {
          business_name?: string | null
          event_name?: string | null
          final_video_link?: string | null
          full_name?: string | null
          id?: string | null
          instagram?: string | null
          interview_date?: string | null
          posted_links?: string | null
          slug?: string | null
        }
        Relationships: []
      }
      people_merge_candidates: {
        Row: {
          name_similarity: number | null
          person_a_email: string | null
          person_a_id: string | null
          person_a_identity: string | null
          person_a_name: string | null
          person_b_email: string | null
          person_b_id: string | null
          person_b_identity: string | null
          person_b_name: string | null
          reason: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_blog_post_view: { Args: { _slug: string }; Returns: undefined }
      people_find_or_create: {
        Args: {
          _business_name?: string
          _email?: string
          _full_name: string
          _handle?: string
          _phone?: string
          _platform?: string
          _profile_id?: string
          _source?: string
        }
        Returns: string
      }
      people_merge: {
        Args: { _keep_id: string; _merge_id: string }
        Returns: string
      }
      people_normalize_email: { Args: { _value: string }; Returns: string }
      people_normalize_handle: { Args: { _value: string }; Returns: string }
      people_normalize_name: { Args: { _value: string }; Returns: string }
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
