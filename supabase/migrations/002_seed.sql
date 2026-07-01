-- ============================================================
-- Media OS — Seed Data
-- AI Tools Lab channel + example competitors
-- ============================================================

-- Only insert if no channel exists
insert into channels (
  name,
  platform,
  niche,
  target_audience,
  primary_goal,
  revenue_goal,
  publishing_cadence
)
select
  'AI Tools Lab',
  'YouTube',
  'AI tools for productivity, creators, and small businesses',
  'Professionals, creators, founders, and operators who want to save time or make money with AI tools',
  'Build a sellable affiliate-led YouTube asset generating £5,000/month revenue',
  '£5,000/month within six months',
  '5–7 videos per week'
where not exists (select 1 from channels);

-- Seed competitors (only if none exist and the channel was just created)
do $$
declare
  v_channel_id uuid;
begin
  select id into v_channel_id from channels order by created_at asc limit 1;
  
  if v_channel_id is not null and not exists (select 1 from competitors where channel_id = v_channel_id) then
    insert into competitors (channel_id, name, platform, url, average_views, upload_frequency, notes) values
      (v_channel_id, 'AI Advantage', 'YouTube', 'https://youtube.com/@aiadvantage', 85000, '4–5x per week', 'Strong AI tool reviews and comparisons. High production quality. Good affiliate CTAs.'),
      (v_channel_id, 'Matt Wolfe', 'YouTube', 'https://youtube.com/@matthewwolfe', 250000, '3–4x per week', 'AI news and tool overviews. Very broad audience. Large subscriber base.'),
      (v_channel_id, 'The AI Advantage', 'YouTube', null, 45000, '3x per week', 'Tutorial-heavy content. Focus on practical use cases. Good for affiliate.'),
      (v_channel_id, 'Liam Ottley', 'YouTube', 'https://youtube.com/@liamottley', 120000, '2–3x per week', 'AI automation and business focus. Strong in agency/operator niche.'),
      (v_channel_id, 'All About AI', 'YouTube', null, 35000, '3–4x per week', 'Wide AI coverage. Good engagement on comparison content.');
  end if;
end $$;

-- Seed a starter rule
do $$
declare
  v_channel_id uuid;
begin
  select id into v_channel_id from channels order by created_at asc limit 1;
  
  if v_channel_id is not null and not exists (select 1 from rules where channel_id = v_channel_id) then
    insert into rules (channel_id, rule_text, applies_to, confidence) values
      (v_channel_id, 'Prioritise comparison and "vs" content — it drives higher affiliate clicks and has lower competition than single-tool tutorials.', 'content', 80),
      (v_channel_id, 'Always include an affiliate disclosure and a pinned comment with tool links. Missing this reduces conversion rate.', 'production', 90);
  end if;
end $$;
