'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { generateMarketReport } from '@/lib/agents/market-intelligence'
import { generateOpportunities, type ScoredOpportunity } from '@/lib/agents/opportunity-scoring'

export async function getDailyReports(channelId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('daily_reports')
    .select('*')
    .eq('channel_id', channelId)
    .order('report_date', { ascending: false })
  return data ?? []
}

export async function getLatestReport(channelId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('daily_reports')
    .select('*')
    .eq('channel_id', channelId)
    .order('report_date', { ascending: false })
    .limit(1)
    .single()
  return data
}

export async function generateReport(channelId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const [channelResult, competitorsResult, learningsResult, rulesResult] = await Promise.all([
    supabase.from('channels').select('*').eq('id', channelId).single(),
    supabase.from('competitors').select('*').eq('channel_id', channelId),
    supabase.from('learnings').select('*').eq('channel_id', channelId).order('created_at', { ascending: false }).limit(20),
    supabase.from('rules').select('*').eq('channel_id', channelId).order('created_at', { ascending: false }).limit(20),
  ])

  if (!channelResult.data) return { success: false, error: 'Channel not found' }

  try {
    const report = await generateMarketReport({
      channel: channelResult.data,
      competitors: competitorsResult.data ?? [],
      learnings: learningsResult.data ?? [],
      rules: rulesResult.data ?? [],
    })

    const { error } = await supabase.from('daily_reports').insert({
      channel_id: channelId,
      report_date: new Date().toISOString().split('T')[0],
      summary: report.summary,
      emerging_topics: report.emerging_topics,
      competitor_activity: report.competitor_activity,
      outperforming_videos: report.outperforming_videos,
      thumbnail_trends: report.thumbnail_trends,
      format_trends: report.format_trends,
      recommended_actions: report.recommended_actions,
    })

    if (error) return { success: false, error: error.message }

    revalidatePath('/daily-report')
    revalidatePath('/')
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' }
  }
}

export async function generateOpportunitiesFromReport(
  reportId: string,
  channelId: string
): Promise<{ success: boolean; count?: number; error?: string }> {
  const supabase = await createClient()

  const [channelResult, reportResult, learningsResult, rulesResult] = await Promise.all([
    supabase.from('channels').select('*').eq('id', channelId).single(),
    supabase.from('daily_reports').select('*').eq('id', reportId).single(),
    supabase.from('learnings').select('*').eq('channel_id', channelId).order('created_at', { ascending: false }).limit(20),
    supabase.from('rules').select('*').eq('channel_id', channelId).order('created_at', { ascending: false }).limit(20),
  ])

  if (!channelResult.data || !reportResult.data) {
    return { success: false, error: 'Channel or report not found' }
  }

  try {
    const opportunities = await generateOpportunities({
      channel: channelResult.data,
      report: reportResult.data,
      learnings: learningsResult.data ?? [],
      rules: rulesResult.data ?? [],
    })

    const toInsert = opportunities.map((o: ScoredOpportunity) => ({
      channel_id: channelId,
      daily_report_id: reportId,
      title: o.title,
      concept: o.concept,
      target_audience: o.target_audience,
      estimated_views: o.estimated_views,
      affiliate_potential_score: o.affiliate_potential_score,
      competition_score: o.competition_score,
      evergreen_score: o.evergreen_score,
      production_effort_score: o.production_effort_score,
      opportunity_score: o.opportunity_score,
      confidence_score: o.confidence_score,
      rationale: o.rationale,
      status: 'draft',
    }))

    const { error } = await supabase.from('opportunities').insert(toInsert)
    if (error) return { success: false, error: error.message }

    revalidatePath('/opportunities')
    revalidatePath('/daily-report')
    return { success: true, count: opportunities.length }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' }
  }
}
