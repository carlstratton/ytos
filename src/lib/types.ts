export interface Channel {
  id: string
  name: string
  platform: string
  niche: string | null
  target_audience: string | null
  primary_goal: string | null
  revenue_goal: string | null
  publishing_cadence: string | null
  created_at: string
}

export interface Competitor {
  id: string
  channel_id: string
  name: string
  platform: string
  url: string | null
  notes: string | null
  average_views: number | null
  upload_frequency: string | null
  created_at: string
}

export interface DailyReport {
  id: string
  channel_id: string
  report_date: string
  summary: string | null
  emerging_topics: string[] | null
  competitor_activity: string | null
  outperforming_videos: string | null
  thumbnail_trends: string | null
  format_trends: string | null
  recommended_actions: string[] | null
  created_at: string
}

export type OpportunityStatus =
  | 'draft'
  | 'shortlisted'
  | 'approved'
  | 'rejected'
  | 'in_production'
  | 'published'
  | 'analysed'

export interface Opportunity {
  id: string
  channel_id: string
  daily_report_id: string | null
  title: string
  concept: string | null
  target_audience: string | null
  estimated_views: number | null
  affiliate_potential_score: number | null
  competition_score: number | null
  evergreen_score: number | null
  production_effort_score: number | null
  opportunity_score: number | null
  confidence_score: number | null
  rationale: string | null
  status: OpportunityStatus
  created_at: string
}

export type ProductionPackStatus = 'draft' | 'approved' | 'needs_revision'

export interface ProductionPack {
  id: string
  opportunity_id: string
  title_options: string[] | null
  thumbnail_concepts: string[] | null
  hook: string | null
  script: string | null
  voiceover_script: string | null
  b_roll_list: string[] | null
  image_prompts: string[] | null
  editing_notes: string | null
  description: string | null
  tags: string[] | null
  cta: string | null
  affiliate_notes: string | null
  status: ProductionPackStatus
  created_at: string
}

export interface Experiment {
  id: string
  opportunity_id: string
  production_pack_id: string | null
  hypothesis: string | null
  predicted_views: number | null
  predicted_ctr: number | null
  predicted_retention: number | null
  predicted_affiliate_revenue: number | null
  actual_views: number | null
  actual_ctr: number | null
  actual_retention: number | null
  actual_affiliate_revenue: number | null
  result_summary: string | null
  learning_summary: string | null
  created_at: string
}

export interface Learning {
  id: string
  channel_id: string
  experiment_id: string | null
  learning: string
  evidence: string | null
  confidence: number | null
  created_at: string
}

export interface Rule {
  id: string
  channel_id: string
  rule_text: string
  applies_to: string | null
  weight_adjustment: number | null
  confidence: number | null
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      channels: { Row: Channel; Insert: Omit<Channel, 'id' | 'created_at'>; Update: Partial<Omit<Channel, 'id' | 'created_at'>> }
      competitors: { Row: Competitor; Insert: Omit<Competitor, 'id' | 'created_at'>; Update: Partial<Omit<Competitor, 'id' | 'created_at'>> }
      daily_reports: { Row: DailyReport; Insert: Omit<DailyReport, 'id' | 'created_at'>; Update: Partial<Omit<DailyReport, 'id' | 'created_at'>> }
      opportunities: { Row: Opportunity; Insert: Omit<Opportunity, 'id' | 'created_at'>; Update: Partial<Omit<Opportunity, 'id' | 'created_at'>> }
      production_packs: { Row: ProductionPack; Insert: Omit<ProductionPack, 'id' | 'created_at'>; Update: Partial<Omit<ProductionPack, 'id' | 'created_at'>> }
      experiments: { Row: Experiment; Insert: Omit<Experiment, 'id' | 'created_at'>; Update: Partial<Omit<Experiment, 'id' | 'created_at'>> }
      learnings: { Row: Learning; Insert: Omit<Learning, 'id' | 'created_at'>; Update: Partial<Omit<Learning, 'id' | 'created_at'>> }
      rules: { Row: Rule; Insert: Omit<Rule, 'id' | 'created_at'>; Update: Partial<Omit<Rule, 'id' | 'created_at'>> }
    }
  }
}
