// ÜRETİLEN DOSYA — elle düzenlemeyin.
// Kaynak: supabase/migrations · Yeniden üretmek için: scripts/generate-db-types.sh

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  // supabase-js bu anahtarla istemcinin konuşacağı PostgREST sürümünü seçer.
  __InternalSupabase: {
    PostgrestVersion: '12';
  };
  public: {
    Tables: {
      analytics_events: {
        Row: {
          id: number;
          user_id: string | null;
          name: string;
          properties: Json;
          session_id: string | null;
          app_version: string | null;
          platform: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id?: string | null;
          name: string;
          properties?: Json;
          session_id?: string | null;
          app_version?: string | null;
          platform?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string | null;
          name?: string;
          properties?: Json;
          session_id?: string | null;
          app_version?: string | null;
          platform?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      app_config: {
        Row: {
          key: string;
          value: Json;
          description: string | null;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: Json;
          description?: string | null;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: Json;
          description?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      badges: {
        Row: {
          id: string;
          title_tr: string;
          title_en: string;
          description_tr: string | null;
          description_en: string | null;
          tier: number;
          star_reward: number;
          is_secret: boolean;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          requirement: Json;
        };
        Insert: {
          id: string;
          title_tr: string;
          title_en: string;
          description_tr?: string | null;
          description_en?: string | null;
          tier?: number;
          star_reward?: number;
          is_secret?: boolean;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          requirement: Json;
        };
        Update: {
          id?: string;
          title_tr?: string;
          title_en?: string;
          description_tr?: string | null;
          description_en?: string | null;
          tier?: number;
          star_reward?: number;
          is_secret?: boolean;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          requirement?: Json;
        };
        Relationships: [];
      };
      brain_map: {
        Row: {
          user_id: string;
          memory: number;
          focus: number;
          logic: number;
          speed: number;
          problem_solving: number;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          memory?: number;
          focus?: number;
          logic?: number;
          speed?: number;
          problem_solving?: number;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          memory?: number;
          focus?: number;
          logic?: number;
          speed?: number;
          problem_solving?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      brain_map_history: {
        Row: {
          id: string;
          user_id: string;
          recorded_on: string;
          memory: number;
          focus: number;
          logic: number;
          speed: number;
          problem_solving: number;
          neuropeak_score: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          recorded_on?: string;
          memory: number;
          focus: number;
          logic: number;
          speed: number;
          problem_solving: number;
          neuropeak_score: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          recorded_on?: string;
          memory?: number;
          focus?: number;
          logic?: number;
          speed?: number;
          problem_solving?: number;
          neuropeak_score?: number;
        };
        Relationships: [];
      };
      daily_task_templates: {
        Row: {
          id: string;
          title_tr: string;
          title_en: string;
          metric: string;
          target: number;
          category: Database['public']['Enums']['game_category'] | null;
          star_reward: number;
          weight: number;
          is_active: boolean;
        };
        Insert: {
          id: string;
          title_tr: string;
          title_en: string;
          metric: string;
          target: number;
          category?: Database['public']['Enums']['game_category'] | null;
          star_reward?: number;
          weight?: number;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          title_tr?: string;
          title_en?: string;
          metric?: string;
          target?: number;
          category?: Database['public']['Enums']['game_category'] | null;
          star_reward?: number;
          weight?: number;
          is_active?: boolean;
        };
        Relationships: [];
      };
      game_progress: {
        Row: {
          user_id: string;
          game_id: string;
          best_level: number;
          best_score: number;
          rounds_played: number;
          total_time_ms: number;
          last_played_at: string | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          game_id: string;
          best_level?: number;
          best_score?: number;
          rounds_played?: number;
          total_time_ms?: number;
          last_played_at?: string | null;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          game_id?: string;
          best_level?: number;
          best_score?: number;
          rounds_played?: number;
          total_time_ms?: number;
          last_played_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      game_sessions: {
        Row: {
          id: string;
          user_id: string;
          game_id: string;
          difficulty: Database['public']['Enums']['difficulty'];
          level: number | null;
          score: number;
          duration_ms: number;
          xp_earned: number;
          completed: boolean;
          played_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          game_id: string;
          difficulty?: Database['public']['Enums']['difficulty'];
          level?: number | null;
          score?: number;
          duration_ms: number;
          xp_earned?: number;
          completed?: boolean;
          played_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          game_id?: string;
          difficulty?: Database['public']['Enums']['difficulty'];
          level?: number | null;
          score?: number;
          duration_ms?: number;
          xp_earned?: number;
          completed?: boolean;
          played_at?: string;
        };
        Relationships: [];
      };
      games: {
        Row: {
          id: string;
          category: Database['public']['Enums']['game_category'];
          mode: Database['public']['Enums']['game_mode'];
          title_tr: string;
          title_en: string;
          description_tr: string | null;
          description_en: string | null;
          total_levels: number;
          xp_per_round: number;
          star_reward: number;
          axis_weights: Json;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          instruction_tr: string;
          instruction_en: string;
          skills: Json;
        };
        Insert: {
          id: string;
          category: Database['public']['Enums']['game_category'];
          mode: Database['public']['Enums']['game_mode'];
          title_tr: string;
          title_en: string;
          description_tr?: string | null;
          description_en?: string | null;
          total_levels?: number;
          xp_per_round?: number;
          star_reward?: number;
          axis_weights?: Json;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          instruction_tr?: string;
          instruction_en?: string;
          skills?: Json;
        };
        Update: {
          id?: string;
          category?: Database['public']['Enums']['game_category'];
          mode?: Database['public']['Enums']['game_mode'];
          title_tr?: string;
          title_en?: string;
          description_tr?: string | null;
          description_en?: string | null;
          total_levels?: number;
          xp_per_round?: number;
          star_reward?: number;
          axis_weights?: Json;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          instruction_tr?: string;
          instruction_en?: string;
          skills?: Json;
        };
        Relationships: [];
      };
      league_groups: {
        Row: {
          id: string;
          tier: Database['public']['Enums']['league_tier'];
          week_start: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          tier: Database['public']['Enums']['league_tier'];
          week_start: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          tier?: Database['public']['Enums']['league_tier'];
          week_start?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      league_members: {
        Row: {
          group_id: string;
          user_id: string;
          week_start: string;
          weekly_xp: number;
          joined_at: string;
        };
        Insert: {
          group_id: string;
          user_id: string;
          week_start: string;
          weekly_xp?: number;
          joined_at?: string;
        };
        Update: {
          group_id?: string;
          user_id?: string;
          week_start?: string;
          weekly_xp?: number;
          joined_at?: string;
        };
        Relationships: [];
      };
      onboarding_answers: {
        Row: {
          user_id: string;
          age_range: string | null;
          focus_areas: Database['public']['Enums']['game_category'][];
          daily_goal_minutes: number | null;
          concern: string | null;
          habit: string | null;
          notifications_granted: boolean;
          completed_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          age_range?: string | null;
          focus_areas?: Database['public']['Enums']['game_category'][];
          daily_goal_minutes?: number | null;
          concern?: string | null;
          habit?: string | null;
          notifications_granted?: boolean;
          completed_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          age_range?: string | null;
          focus_areas?: Database['public']['Enums']['game_category'][];
          daily_goal_minutes?: number | null;
          concern?: string | null;
          habit?: string | null;
          notifications_granted?: boolean;
          completed_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          country_code: string | null;
          locale: string;
          is_anonymous: boolean;
          is_pro: boolean;
          pro_expires_at: string | null;
          star_balance: number;
          xp: number;
          level: number;
          neuropeak_score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          country_code?: string | null;
          locale?: string;
          is_anonymous?: boolean;
          is_pro?: boolean;
          pro_expires_at?: string | null;
          star_balance?: number;
          xp?: number;
          level?: number;
          neuropeak_score?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          country_code?: string | null;
          locale?: string;
          is_anonymous?: boolean;
          is_pro?: boolean;
          pro_expires_at?: string | null;
          star_balance?: number;
          xp?: number;
          level?: number;
          neuropeak_score?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      push_campaigns: {
        Row: {
          id: string;
          segment_id: string | null;
          title_tr: string;
          body_tr: string;
          title_en: string;
          body_en: string;
          local_hour: number | null;
          status: Database['public']['Enums']['push_status'];
          scheduled_for: string | null;
          sent_at: string | null;
          recipient_count: number;
          delivered_count: number;
          opened_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          segment_id?: string | null;
          title_tr: string;
          body_tr: string;
          title_en: string;
          body_en: string;
          local_hour?: number | null;
          status?: Database['public']['Enums']['push_status'];
          scheduled_for?: string | null;
          sent_at?: string | null;
          recipient_count?: number;
          delivered_count?: number;
          opened_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          segment_id?: string | null;
          title_tr?: string;
          body_tr?: string;
          title_en?: string;
          body_en?: string;
          local_hour?: number | null;
          status?: Database['public']['Enums']['push_status'];
          scheduled_for?: string | null;
          sent_at?: string | null;
          recipient_count?: number;
          delivered_count?: number;
          opened_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      push_deliveries: {
        Row: {
          campaign_id: string;
          user_id: string;
          sent_at: string;
          opened_at: string | null;
        };
        Insert: {
          campaign_id: string;
          user_id: string;
          sent_at?: string;
          opened_at?: string | null;
        };
        Update: {
          campaign_id?: string;
          user_id?: string;
          sent_at?: string;
          opened_at?: string | null;
        };
        Relationships: [];
      };
      push_tokens: {
        Row: {
          user_id: string;
          token: string;
          platform: string;
          locale: string;
          is_active: boolean;
          last_seen_at: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          token: string;
          platform: string;
          locale?: string;
          is_active?: boolean;
          last_seen_at?: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          token?: string;
          platform?: string;
          locale?: string;
          is_active?: boolean;
          last_seen_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      questions: {
        Row: {
          id: string;
          kind: Database['public']['Enums']['question_kind'];
          prompt_tr: string;
          prompt_en: string;
          image_path: string | null;
          options: Json;
          correct_index: number;
          difficulty_weight: number;
          axis: Database['public']['Enums']['brain_axis'] | null;
          explanation_tr: string | null;
          explanation_en: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          slug: string | null;
          visual: Json | null;
        };
        Insert: {
          id?: string;
          kind: Database['public']['Enums']['question_kind'];
          prompt_tr: string;
          prompt_en: string;
          image_path?: string | null;
          options: Json;
          correct_index: number;
          difficulty_weight?: number;
          axis?: Database['public']['Enums']['brain_axis'] | null;
          explanation_tr?: string | null;
          explanation_en?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          slug?: string | null;
          visual?: Json | null;
        };
        Update: {
          id?: string;
          kind?: Database['public']['Enums']['question_kind'];
          prompt_tr?: string;
          prompt_en?: string;
          image_path?: string | null;
          options?: Json;
          correct_index?: number;
          difficulty_weight?: number;
          axis?: Database['public']['Enums']['brain_axis'] | null;
          explanation_tr?: string | null;
          explanation_en?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          slug?: string | null;
          visual?: Json | null;
        };
        Relationships: [];
      };
      segments: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          match_mode: string;
          rules: Json;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          title: string;
          description?: string | null;
          match_mode?: string;
          rules?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          match_mode?: string;
          rules?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      stars_ledger: {
        Row: {
          id: string;
          user_id: string;
          delta: number;
          reason: Database['public']['Enums']['star_reason'];
          ref: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          delta: number;
          reason: Database['public']['Enums']['star_reason'];
          ref?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          delta?: number;
          reason?: Database['public']['Enums']['star_reason'];
          ref?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      streaks: {
        Row: {
          user_id: string;
          current_days: number;
          longest_days: number;
          last_active_date: string | null;
          freezes_left: number;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          current_days?: number;
          longest_days?: number;
          last_active_date?: string | null;
          freezes_left?: number;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          current_days?: number;
          longest_days?: number;
          last_active_date?: string | null;
          freezes_left?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      test_questions: {
        Row: {
          test_id: string;
          question_id: string;
          sort_order: number;
        };
        Insert: {
          test_id: string;
          question_id: string;
          sort_order?: number;
        };
        Update: {
          test_id?: string;
          question_id?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      test_results: {
        Row: {
          id: string;
          user_id: string;
          test_id: string;
          raw_score: number;
          iq_score: number;
          percentile: number;
          correct_count: number;
          answered_count: number;
          subscores: Json;
          duration_ms: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          test_id: string;
          raw_score: number;
          iq_score: number;
          percentile: number;
          correct_count: number;
          answered_count: number;
          subscores?: Json;
          duration_ms: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          test_id?: string;
          raw_score?: number;
          iq_score?: number;
          percentile?: number;
          correct_count?: number;
          answered_count?: number;
          subscores?: Json;
          duration_ms?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      tests: {
        Row: {
          id: string;
          kind: Database['public']['Enums']['test_kind'];
          title_tr: string;
          title_en: string;
          description_tr: string | null;
          description_en: string | null;
          question_count: number;
          est_minutes_min: number;
          est_minutes_max: number;
          is_pro: boolean;
          norm_mean: number;
          norm_sd: number;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          focus: Database['public']['Enums']['report_dimension'] | null;
        };
        Insert: {
          id: string;
          kind: Database['public']['Enums']['test_kind'];
          title_tr: string;
          title_en: string;
          description_tr?: string | null;
          description_en?: string | null;
          question_count: number;
          est_minutes_min: number;
          est_minutes_max: number;
          is_pro?: boolean;
          norm_mean?: number;
          norm_sd?: number;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          focus?: Database['public']['Enums']['report_dimension'] | null;
        };
        Update: {
          id?: string;
          kind?: Database['public']['Enums']['test_kind'];
          title_tr?: string;
          title_en?: string;
          description_tr?: string | null;
          description_en?: string | null;
          question_count?: number;
          est_minutes_min?: number;
          est_minutes_max?: number;
          is_pro?: boolean;
          norm_mean?: number;
          norm_sd?: number;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          focus?: Database['public']['Enums']['report_dimension'] | null;
        };
        Relationships: [];
      };
      user_badges: {
        Row: {
          user_id: string;
          badge_id: string;
          earned_at: string;
        };
        Insert: {
          user_id: string;
          badge_id: string;
          earned_at?: string;
        };
        Update: {
          user_id?: string;
          badge_id?: string;
          earned_at?: string;
        };
        Relationships: [];
      };
      user_daily_tasks: {
        Row: {
          user_id: string;
          task_date: string;
          template_id: string;
          progress: number;
          target: number;
          claimed_at: string | null;
        };
        Insert: {
          user_id: string;
          task_date?: string;
          template_id: string;
          progress?: number;
          target: number;
          claimed_at?: string | null;
        };
        Update: {
          user_id?: string;
          task_date?: string;
          template_id?: string;
          progress?: number;
          target?: number;
          claimed_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      global_leaderboard: {
        Row: {
          rank: number | null;
          user_id: string | null;
          display_name: string | null;
          country_code: string | null;
          neuropeak_score: number | null;
          level: number | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      [key: string]: never;
    };
    Enums: {
      brain_axis: 'memory' | 'focus' | 'logic' | 'speed' | 'problem_solving';
      difficulty: 'easy' | 'medium' | 'hard';
      game_category: 'memory' | 'attention' | 'logic' | 'math' | 'spatial' | 'speed' | 'verbal';
      game_mode: 'levels' | 'timed';
      league_tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'legend';
      push_status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
      question_kind:
        | 'matrix'
        | 'number_series'
        | 'shape_analogy'
        | 'verbal_analogy'
        | 'logic'
        | 'spatial'
        | 'coding'
        | 'odd_one_out'
        | 'arithmetic';
      report_dimension: 'verbal' | 'numeric' | 'visual' | 'logical';
      star_reason:
        | 'game_complete'
        | 'test_complete'
        | 'daily_task'
        | 'daily_login'
        | 'rewarded_ad'
        | 'level_up'
        | 'badge'
        | 'league_reward'
        | 'spend_hint'
        | 'spend_undo'
        | 'spend_skip'
        | 'spend_streak_freeze'
        | 'spend_unlock'
        | 'admin_grant';
      test_kind: 'iq' | 'fun';
    };
    CompositeTypes: {
      [key: string]: never;
    };
  };
};

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type InsertDto<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type UpdateDto<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];
