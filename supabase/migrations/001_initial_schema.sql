-- ============================================================
-- Media OS — Initial Schema
-- ============================================================

-- Channels
create table if not exists channels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  platform text not null default 'YouTube',
  niche text,
  target_audience text,
  primary_goal text,
  revenue_goal text,
  publishing_cadence text,
  created_at timestamptz not null default now()
);

-- Competitors
create table if not exists competitors (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references channels(id) on delete cascade,
  name text not null,
  platform text not null default 'YouTube',
  url text,
  notes text,
  average_views integer,
  upload_frequency text,
  created_at timestamptz not null default now()
);

-- Daily Reports
create table if not exists daily_reports (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references channels(id) on delete cascade,
  report_date date not null default current_date,
  summary text,
  emerging_topics jsonb,
  competitor_activity text,
  outperforming_videos text,
  thumbnail_trends text,
  format_trends text,
  recommended_actions jsonb,
  created_at timestamptz not null default now()
);

-- Opportunities
create table if not exists opportunities (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references channels(id) on delete cascade,
  daily_report_id uuid references daily_reports(id) on delete set null,
  title text not null,
  concept text,
  target_audience text,
  estimated_views integer,
  affiliate_potential_score integer,
  competition_score integer,
  evergreen_score integer,
  production_effort_score integer,
  opportunity_score numeric(6,2),
  confidence_score integer,
  rationale text,
  status text not null default 'draft'
    check (status in ('draft','shortlisted','approved','rejected','in_production','published','analysed')),
  created_at timestamptz not null default now()
);

-- Production Packs
create table if not exists production_packs (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references opportunities(id) on delete cascade,
  title_options jsonb,
  thumbnail_concepts jsonb,
  hook text,
  script text,
  voiceover_script text,
  b_roll_list jsonb,
  image_prompts jsonb,
  editing_notes text,
  description text,
  tags jsonb,
  cta text,
  affiliate_notes text,
  status text not null default 'draft'
    check (status in ('draft','approved','needs_revision')),
  created_at timestamptz not null default now()
);

-- Experiments
create table if not exists experiments (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references opportunities(id) on delete cascade,
  production_pack_id uuid references production_packs(id) on delete set null,
  hypothesis text,
  predicted_views integer,
  predicted_ctr numeric(5,2),
  predicted_retention numeric(5,2),
  predicted_affiliate_revenue numeric(10,2),
  actual_views integer,
  actual_ctr numeric(5,2),
  actual_retention numeric(5,2),
  actual_affiliate_revenue numeric(10,2),
  result_summary text,
  learning_summary text,
  created_at timestamptz not null default now()
);

-- Learnings
create table if not exists learnings (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references channels(id) on delete cascade,
  experiment_id uuid references experiments(id) on delete set null,
  learning text not null,
  evidence text,
  confidence integer,
  created_at timestamptz not null default now()
);

-- Rules
create table if not exists rules (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references channels(id) on delete cascade,
  rule_text text not null,
  applies_to text,
  weight_adjustment numeric(5,2),
  confidence integer,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Indexes
-- ============================================================
create index if not exists idx_competitors_channel_id on competitors(channel_id);
create index if not exists idx_daily_reports_channel_id_date on daily_reports(channel_id, report_date desc);
create index if not exists idx_opportunities_channel_id on opportunities(channel_id);
create index if not exists idx_opportunities_status on opportunities(status);
create index if not exists idx_opportunities_score on opportunities(opportunity_score desc nulls last);
create index if not exists idx_production_packs_opportunity_id on production_packs(opportunity_id);
create index if not exists idx_experiments_opportunity_id on experiments(opportunity_id);
create index if not exists idx_learnings_channel_id on learnings(channel_id);
create index if not exists idx_rules_channel_id on rules(channel_id);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table channels enable row level security;
alter table competitors enable row level security;
alter table daily_reports enable row level security;
alter table opportunities enable row level security;
alter table production_packs enable row level security;
alter table experiments enable row level security;
alter table learnings enable row level security;
alter table rules enable row level security;

-- Authenticated users can access all data (single-user MVP)
create policy "Authenticated users can read channels" on channels
  for select to authenticated using (true);
create policy "Authenticated users can modify channels" on channels
  for all to authenticated using (true) with check (true);

create policy "Authenticated users can read competitors" on competitors
  for select to authenticated using (true);
create policy "Authenticated users can modify competitors" on competitors
  for all to authenticated using (true) with check (true);

create policy "Authenticated users can read daily_reports" on daily_reports
  for select to authenticated using (true);
create policy "Authenticated users can modify daily_reports" on daily_reports
  for all to authenticated using (true) with check (true);

create policy "Authenticated users can read opportunities" on opportunities
  for select to authenticated using (true);
create policy "Authenticated users can modify opportunities" on opportunities
  for all to authenticated using (true) with check (true);

create policy "Authenticated users can read production_packs" on production_packs
  for select to authenticated using (true);
create policy "Authenticated users can modify production_packs" on production_packs
  for all to authenticated using (true) with check (true);

create policy "Authenticated users can read experiments" on experiments
  for select to authenticated using (true);
create policy "Authenticated users can modify experiments" on experiments
  for all to authenticated using (true) with check (true);

create policy "Authenticated users can read learnings" on learnings
  for select to authenticated using (true);
create policy "Authenticated users can modify learnings" on learnings
  for all to authenticated using (true) with check (true);

create policy "Authenticated users can read rules" on rules
  for select to authenticated using (true);
create policy "Authenticated users can modify rules" on rules
  for all to authenticated using (true) with check (true);
