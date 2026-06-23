export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          assigned_to: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          message: string | null
          notes: string | null
          preferred_date: string | null
          preferred_time: string | null
          service: string
          status: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          message?: string | null
          notes?: string | null
          preferred_date?: string | null
          preferred_time?: string | null
          service: string
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          message?: string | null
          notes?: string | null
          preferred_date?: string | null
          preferred_time?: string | null
          service?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      case_comments: {
        Row: {
          author_id: string
          case_id: string
          content: string
          created_at: string
          id: string
        }
        Insert: {
          author_id: string
          case_id: string
          content: string
          created_at?: string
          id?: string
        }
        Update: {
          author_id?: string
          case_id?: string
          content?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_comments_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_files: {
        Row: {
          case_id: string
          created_at: string
          filename: string
          id: string
          kind: string
          mime_type: string | null
          size_bytes: number | null
          storage_path: string
          uploaded_by: string
        }
        Insert: {
          case_id: string
          created_at?: string
          filename: string
          id?: string
          kind?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path: string
          uploaded_by: string
        }
        Update: {
          case_id?: string
          created_at?: string
          filename?: string
          id?: string
          kind?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_files_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          assigned_at: string | null
          assigned_lawyer_id: string | null
          category: string
          client_id: string
          created_at: string
          description: string | null
          id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_lawyer_id?: string | null
          category?: string
          client_id: string
          created_at?: string
          description?: string | null
          id?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_at?: string | null
          assigned_lawyer_id?: string | null
          category?: string
          client_id?: string
          created_at?: string
          description?: string | null
          id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_analytics: {
        Row: {
          created_at: string
          id: string
          language: string
          query: string
          response_length: number
          success: boolean
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          language?: string
          query: string
          response_length?: number
          success?: boolean
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          language?: string
          query?: string
          response_length?: number
          success?: boolean
          user_id?: string | null
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          language: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          language?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          language?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          language: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          language?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          language?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs: {
        Row: {
          answer: string
          answer_en: string | null
          answer_mn: string | null
          answer_zh: string | null
          category: string
          created_at: string
          display_order: number
          id: string
          published: boolean
          question: string
          question_en: string | null
          question_mn: string | null
          question_zh: string | null
          updated_at: string
        }
        Insert: {
          answer: string
          answer_en?: string | null
          answer_mn?: string | null
          answer_zh?: string | null
          category?: string
          created_at?: string
          display_order?: number
          id?: string
          published?: boolean
          question: string
          question_en?: string | null
          question_mn?: string | null
          question_zh?: string | null
          updated_at?: string
        }
        Update: {
          answer?: string
          answer_en?: string | null
          answer_mn?: string | null
          answer_zh?: string | null
          category?: string
          created_at?: string
          display_order?: number
          id?: string
          published?: boolean
          question?: string
          question_en?: string | null
          question_mn?: string | null
          question_zh?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      lawyer_presence: {
        Row: {
          last_seen: string
          task_id: string
          user_id: string
        }
        Insert: {
          last_seen?: string
          task_id: string
          user_id: string
        }
        Update: {
          last_seen?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lawyer_presence_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
        }
        Relationships: []
      }
      legal_doc_categories: {
        Row: {
          created_at: string
          display_order: number
          icon: string | null
          id: string
          key: string
          name: string
          name_en: string | null
          name_mn: string | null
          name_zh: string | null
          published: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          icon?: string | null
          id?: string
          key: string
          name: string
          name_en?: string | null
          name_mn?: string | null
          name_zh?: string | null
          published?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          icon?: string | null
          id?: string
          key?: string
          name?: string
          name_en?: string | null
          name_mn?: string | null
          name_zh?: string | null
          published?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      legal_doc_purchases: {
        Row: {
          admin_note: string | null
          amount_cents: number
          confirmation_code: string | null
          created_at: string
          currency: string
          document_id: string
          email: string | null
          id: string
          payment_method: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          amount_cents?: number
          confirmation_code?: string | null
          created_at?: string
          currency?: string
          document_id: string
          email?: string | null
          id?: string
          payment_method?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_note?: string | null
          amount_cents?: number
          confirmation_code?: string | null
          created_at?: string
          currency?: string
          document_id?: string
          email?: string | null
          id?: string
          payment_method?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_doc_purchases_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "legal_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_documents: {
        Row: {
          category_id: string | null
          content_en: Json | null
          content_mn: Json | null
          content_zh: Json | null
          created_at: string
          currency: string
          description: string | null
          description_en: string | null
          description_mn: string | null
          description_zh: string | null
          download_count: number
          featured: boolean
          file_path: string | null
          file_size_bytes: number | null
          file_type: string | null
          id: string
          is_free: boolean
          keywords: string[] | null
          languages: string[]
          meta_description: string | null
          meta_title: string | null
          preview: string | null
          preview_en: string | null
          preview_mn: string | null
          preview_zh: string | null
          price_cents: number
          published: boolean
          published_at: string | null
          slug: string
          status: string
          stripe_price_id: string | null
          stripe_product_id: string | null
          summary: string | null
          summary_en: string | null
          summary_mn: string | null
          summary_zh: string | null
          thumbnail_url: string | null
          title: string
          title_en: string | null
          title_mn: string | null
          title_zh: string | null
          trending: boolean
          type: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          content_en?: Json | null
          content_mn?: Json | null
          content_zh?: Json | null
          created_at?: string
          currency?: string
          description?: string | null
          description_en?: string | null
          description_mn?: string | null
          description_zh?: string | null
          download_count?: number
          featured?: boolean
          file_path?: string | null
          file_size_bytes?: number | null
          file_type?: string | null
          id?: string
          is_free?: boolean
          keywords?: string[] | null
          languages?: string[]
          meta_description?: string | null
          meta_title?: string | null
          preview?: string | null
          preview_en?: string | null
          preview_mn?: string | null
          preview_zh?: string | null
          price_cents?: number
          published?: boolean
          published_at?: string | null
          slug: string
          status?: string
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          summary?: string | null
          summary_en?: string | null
          summary_mn?: string | null
          summary_zh?: string | null
          thumbnail_url?: string | null
          title: string
          title_en?: string | null
          title_mn?: string | null
          title_zh?: string | null
          trending?: boolean
          type?: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          content_en?: Json | null
          content_mn?: Json | null
          content_zh?: Json | null
          created_at?: string
          currency?: string
          description?: string | null
          description_en?: string | null
          description_mn?: string | null
          description_zh?: string | null
          download_count?: number
          featured?: boolean
          file_path?: string | null
          file_size_bytes?: number | null
          file_type?: string | null
          id?: string
          is_free?: boolean
          keywords?: string[] | null
          languages?: string[]
          meta_description?: string | null
          meta_title?: string | null
          preview?: string | null
          preview_en?: string | null
          preview_mn?: string | null
          preview_zh?: string | null
          price_cents?: number
          published?: boolean
          published_at?: string | null
          slug?: string
          status?: string
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          summary?: string | null
          summary_en?: string | null
          summary_mn?: string | null
          summary_zh?: string | null
          thumbnail_url?: string | null
          title?: string
          title_en?: string | null
          title_mn?: string | null
          title_zh?: string | null
          trending?: boolean
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_documents_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "legal_doc_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      media_assets: {
        Row: {
          alt: string | null
          bucket: string
          created_at: string
          filename: string
          height: number | null
          id: string
          mime_type: string | null
          path: string
          size_bytes: number | null
          tags: string[]
          updated_at: string
          uploaded_by: string | null
          width: number | null
        }
        Insert: {
          alt?: string | null
          bucket?: string
          created_at?: string
          filename: string
          height?: number | null
          id?: string
          mime_type?: string | null
          path: string
          size_bytes?: number | null
          tags?: string[]
          updated_at?: string
          uploaded_by?: string | null
          width?: number | null
        }
        Update: {
          alt?: string | null
          bucket?: string
          created_at?: string
          filename?: string
          height?: number | null
          id?: string
          mime_type?: string | null
          path?: string
          size_bytes?: number | null
          tags?: string[]
          updated_at?: string
          uploaded_by?: string | null
          width?: number | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          content: string | null
          content_en: string | null
          content_mn: string | null
          content_zh: string | null
          created_at: string
          id: string
          published: boolean
          title: string
          title_en: string | null
          title_mn: string | null
          title_zh: string | null
          updated_at: string
        }
        Insert: {
          content?: string | null
          content_en?: string | null
          content_mn?: string | null
          content_zh?: string | null
          created_at?: string
          id?: string
          published?: boolean
          title: string
          title_en?: string | null
          title_mn?: string | null
          title_zh?: string | null
          updated_at?: string
        }
        Update: {
          content?: string | null
          content_en?: string | null
          content_mn?: string | null
          content_zh?: string | null
          created_at?: string
          id?: string
          published?: boolean
          title?: string
          title_en?: string | null
          title_mn?: string | null
          title_zh?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      publications: {
        Row: {
          category: string
          created_at: string
          date: string
          file_url: string | null
          id: string
          title: string
          title_en: string | null
          title_mn: string | null
          title_zh: string | null
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          date?: string
          file_url?: string | null
          id?: string
          title: string
          title_en?: string | null
          title_mn?: string | null
          title_zh?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          date?: string
          file_url?: string | null
          id?: string
          title?: string
          title_en?: string | null
          title_mn?: string | null
          title_zh?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      seo_settings: {
        Row: {
          canonical_url: string | null
          created_at: string
          description: string | null
          description_en: string | null
          description_mn: string | null
          description_zh: string | null
          id: string
          keywords: string | null
          keywords_en: string | null
          keywords_mn: string | null
          keywords_zh: string | null
          og_image: string | null
          page_key: string
          title: string | null
          title_en: string | null
          title_mn: string | null
          title_zh: string | null
          updated_at: string
        }
        Insert: {
          canonical_url?: string | null
          created_at?: string
          description?: string | null
          description_en?: string | null
          description_mn?: string | null
          description_zh?: string | null
          id?: string
          keywords?: string | null
          keywords_en?: string | null
          keywords_mn?: string | null
          keywords_zh?: string | null
          og_image?: string | null
          page_key: string
          title?: string | null
          title_en?: string | null
          title_mn?: string | null
          title_zh?: string | null
          updated_at?: string
        }
        Update: {
          canonical_url?: string | null
          created_at?: string
          description?: string | null
          description_en?: string | null
          description_mn?: string | null
          description_zh?: string | null
          id?: string
          keywords?: string | null
          keywords_en?: string | null
          keywords_mn?: string | null
          keywords_zh?: string | null
          og_image?: string | null
          page_key?: string
          title?: string | null
          title_en?: string | null
          title_mn?: string | null
          title_zh?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          benefits_en: string[]
          benefits_mn: string[]
          benefits_zh: string[]
          created_at: string
          description: string | null
          description_en: string | null
          description_mn: string | null
          description_zh: string | null
          detail_included_en: string[]
          detail_included_mn: string[]
          detail_included_zh: string[]
          detail_intro_en: string | null
          detail_intro_mn: string | null
          detail_intro_zh: string | null
          detail_overview_en: string | null
          detail_overview_mn: string | null
          detail_overview_zh: string | null
          detail_process_en: Json
          detail_process_mn: Json
          detail_process_zh: Json
          detail_why_en: string | null
          detail_why_mn: string | null
          detail_why_zh: string | null
          display_order: number
          full_en: string | null
          full_mn: string | null
          full_zh: string | null
          id: string
          image_url: string | null
          key: string | null
          published: boolean
          title: string
          title_en: string | null
          title_mn: string | null
          title_zh: string | null
          updated_at: string
        }
        Insert: {
          benefits_en?: string[]
          benefits_mn?: string[]
          benefits_zh?: string[]
          created_at?: string
          description?: string | null
          description_en?: string | null
          description_mn?: string | null
          description_zh?: string | null
          detail_included_en?: string[]
          detail_included_mn?: string[]
          detail_included_zh?: string[]
          detail_intro_en?: string | null
          detail_intro_mn?: string | null
          detail_intro_zh?: string | null
          detail_overview_en?: string | null
          detail_overview_mn?: string | null
          detail_overview_zh?: string | null
          detail_process_en?: Json
          detail_process_mn?: Json
          detail_process_zh?: Json
          detail_why_en?: string | null
          detail_why_mn?: string | null
          detail_why_zh?: string | null
          display_order?: number
          full_en?: string | null
          full_mn?: string | null
          full_zh?: string | null
          id?: string
          image_url?: string | null
          key?: string | null
          published?: boolean
          title: string
          title_en?: string | null
          title_mn?: string | null
          title_zh?: string | null
          updated_at?: string
        }
        Update: {
          benefits_en?: string[]
          benefits_mn?: string[]
          benefits_zh?: string[]
          created_at?: string
          description?: string | null
          description_en?: string | null
          description_mn?: string | null
          description_zh?: string | null
          detail_included_en?: string[]
          detail_included_mn?: string[]
          detail_included_zh?: string[]
          detail_intro_en?: string | null
          detail_intro_mn?: string | null
          detail_intro_zh?: string | null
          detail_overview_en?: string | null
          detail_overview_mn?: string | null
          detail_overview_zh?: string | null
          detail_process_en?: Json
          detail_process_mn?: Json
          detail_process_zh?: Json
          detail_why_en?: string | null
          detail_why_mn?: string | null
          detail_why_zh?: string | null
          display_order?: number
          full_en?: string | null
          full_mn?: string | null
          full_zh?: string | null
          id?: string
          image_url?: string | null
          key?: string | null
          published?: boolean
          title?: string
          title_en?: string | null
          title_mn?: string | null
          title_zh?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      site_pages: {
        Row: {
          content: Json
          content_en: Json
          content_mn: Json
          content_zh: Json
          created_at: string
          id: string
          page_key: string
          published: boolean
          title: string | null
          title_en: string | null
          title_mn: string | null
          title_zh: string | null
          updated_at: string
        }
        Insert: {
          content?: Json
          content_en?: Json
          content_mn?: Json
          content_zh?: Json
          created_at?: string
          id?: string
          page_key: string
          published?: boolean
          title?: string | null
          title_en?: string | null
          title_mn?: string | null
          title_zh?: string | null
          updated_at?: string
        }
        Update: {
          content?: Json
          content_en?: Json
          content_mn?: Json
          content_zh?: Json
          created_at?: string
          id?: string
          page_key?: string
          published?: boolean
          title?: string | null
          title_en?: string | null
          title_mn?: string | null
          title_zh?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      task_activity: {
        Row: {
          action: string
          actor_id: string
          created_at: string
          detail: Json | null
          id: string
          task_id: string
        }
        Insert: {
          action: string
          actor_id: string
          created_at?: string
          detail?: Json | null
          id?: string
          task_id: string
        }
        Update: {
          action?: string
          actor_id?: string
          created_at?: string
          detail?: Json | null
          id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_activity_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          task_id: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          task_id: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          assigned_to: string | null
          category: string
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          priority: Database["public"]["Enums"]["task_priority"]
          related_case_id: string | null
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          assigned_to?: string | null
          category?: string
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          related_case_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          assigned_to?: string | null
          category?: string
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          related_case_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_related_case_id_fkey"
            columns: ["related_case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          bio: string | null
          bio_en: string | null
          bio_mn: string | null
          bio_zh: string | null
          created_at: string
          display_order: number
          email: string | null
          featured: boolean
          id: string
          linkedin_url: string | null
          name: string
          photo_url: string | null
          published: boolean
          role: string | null
          role_en: string | null
          role_mn: string | null
          role_zh: string | null
          specialty: string | null
          specialty_en: string | null
          specialty_mn: string | null
          specialty_zh: string | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          bio_en?: string | null
          bio_mn?: string | null
          bio_zh?: string | null
          created_at?: string
          display_order?: number
          email?: string | null
          featured?: boolean
          id?: string
          linkedin_url?: string | null
          name: string
          photo_url?: string | null
          published?: boolean
          role?: string | null
          role_en?: string | null
          role_mn?: string | null
          role_zh?: string | null
          specialty?: string | null
          specialty_en?: string | null
          specialty_mn?: string | null
          specialty_zh?: string | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          bio_en?: string | null
          bio_mn?: string | null
          bio_zh?: string | null
          created_at?: string
          display_order?: number
          email?: string | null
          featured?: boolean
          id?: string
          linkedin_url?: string | null
          name?: string
          photo_url?: string | null
          published?: boolean
          role?: string | null
          role_en?: string | null
          role_mn?: string | null
          role_zh?: string | null
          specialty?: string | null
          specialty_en?: string | null
          specialty_mn?: string | null
          specialty_zh?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_order: number
          id: string
          name: string
          published: boolean
          quote: string
          quote_en: string | null
          quote_mn: string | null
          quote_zh: string | null
          rating: number
          role: string | null
          role_en: string | null
          role_mn: string | null
          role_zh: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_order?: number
          id?: string
          name: string
          published?: boolean
          quote: string
          quote_en?: string | null
          quote_mn?: string | null
          quote_zh?: string | null
          rating?: number
          role?: string | null
          role_en?: string | null
          role_mn?: string | null
          role_zh?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_order?: number
          id?: string
          name?: string
          published?: boolean
          quote?: string
          quote_en?: string | null
          quote_mn?: string | null
          quote_zh?: string | null
          rating?: number
          role?: string | null
          role_en?: string | null
          role_mn?: string | null
          role_zh?: string | null
          updated_at?: string
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
      visitors: {
        Row: {
          created_at: string
          first_visit: string
          id: string
          last_visit: string
          pages_visited: string[]
          visitor_id: string
        }
        Insert: {
          created_at?: string
          first_visit?: string
          id?: string
          last_visit?: string
          pages_visited?: string[]
          visitor_id: string
        }
        Update: {
          created_at?: string
          first_visit?: string
          id?: string
          last_visit?: string
          pages_visited?: string[]
          visitor_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_task: {
        Args: { _task_id: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_or_super: { Args: { _user_id: string }; Returns: boolean }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      slugify: { Args: { input: string }; Returns: string }
    }
    Enums: {
      app_role: "admin" | "user" | "lawyer" | "super_admin"
      task_priority: "low" | "medium" | "high" | "urgent"
      task_status:
        | "open"
        | "assigned"
        | "in_progress"
        | "under_review"
        | "completed"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      app_role: ["admin", "user", "lawyer", "super_admin"],
      task_priority: ["low", "medium", "high", "urgent"],
      task_status: [
        "open",
        "assigned",
        "in_progress",
        "under_review",
        "completed",
      ],
    },
  },
} as const
