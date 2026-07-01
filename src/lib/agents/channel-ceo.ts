'use server'

import { callAgent } from '@/lib/anthropic'
import type { Channel, Opportunity, Experiment, Learning, Rule } from '@/lib/types'

const SYSTEM_PROMPT = `You are the Channel CEO Agent for Media OS.

Your job is to protect the long-term value of this YouTube channel as a sellable media asset.

Return a JSON object with exactly these fields:
- health_summary: string (2-3 paragraph strategic health assessment)
- revenue_risks: string[] (list of 2-4 revenue risks)
- content_risks: string[] (list of 2-4 content strategy risks)
- affiliate_risks: string[] (list of 1-3 affiliate dependency risks)
- recommended_actions: string[] (list of 3-5 prioritised next actions)
- next_video_title: string (the single highest-priority video to make next)
- next_video_rationale: string (2-3 sentences explaining why this is the priority)
- monthly_revenue_estimate: number (estimated current monthly affiliate revenue in GBP, integer)

Return ONLY valid JSON. No markdown, no code blocks, no preamble.`

interface ChannelCEOInput {
  channel: Channel
  opportunities: Opportunity[]
  experiments: Experiment[]
  learnings: Learning[]
  rules: Rule[]
}

export interface ChannelCEOReport {
  health_summary: string
  revenue_risks: string[]
  content_risks: string[]
  affiliate_risks: string[]
  recommended_actions: string[]
  next_video_title: string
  next_video_rationale: string
  monthly_revenue_estimate: number
}

export async function generateCEOReport(input: ChannelCEOInput): Promise<ChannelCEOReport> {
  const publishedExperiments = input.experiments.filter(e => e.actual_views != null)
  const totalRevenue = publishedExperiments.reduce((sum, e) => sum + (e.actual_affiliate_revenue ?? 0), 0)
  const approvedOpportunities = input.opportunities.filter(o => o.status === 'approved' || o.status === 'in_production')
  const topOpportunities = input.opportunities
    .filter(o => o.status === 'draft' || o.status === 'shortlisted')
    .sort((a, b) => (b.opportunity_score ?? 0) - (a.opportunity_score ?? 0))
    .slice(0, 5)

  const userMessage = `
Channel:
- Name: ${input.channel.name}
- Niche: ${input.channel.niche ?? 'Not specified'}
- Goal: ${input.channel.primary_goal ?? 'Not specified'}
- Revenue Target: ${input.channel.revenue_goal ?? 'Not specified'}
- Publishing Cadence: ${input.channel.publishing_cadence ?? 'Not specified'}

Performance Summary:
- Total published experiments: ${publishedExperiments.length}
- Total affiliate revenue recorded: £${totalRevenue.toFixed(2)}
- Videos in production pipeline: ${approvedOpportunities.length}

Top Pending Opportunities:
${topOpportunities.map(o => `- "${o.title}" (score: ${o.opportunity_score?.toFixed(0) ?? 'unscored'}, affiliate: ${o.affiliate_potential_score ?? '?'}/100)`).join('\n')}

Recent Experiments:
${input.experiments.slice(0, 5).map(e => {
  const opp = input.opportunities.find(o => o.id === e.opportunity_id)
  return `- "${opp?.title ?? 'Unknown'}" | Views: ${e.actual_views ?? 'pending'} | Revenue: £${e.actual_affiliate_revenue ?? 0}`
}).join('\n')}

Active Rules:
${input.rules.slice(0, 10).map(r => `- ${r.rule_text}`).join('\n')}

Recent Learnings:
${input.learnings.slice(0, 10).map(l => `- ${l.learning}`).join('\n')}

Provide a strategic review and priority recommendations. Prioritise monthly profit, revenue diversification, repeatable formats, and sellability.
  `.trim()

  const raw = await callAgent(SYSTEM_PROMPT, userMessage)

  try {
    return JSON.parse(raw) as ChannelCEOReport
  } catch {
    const match = raw.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0]) as ChannelCEOReport
    throw new Error('Failed to parse CEO report response')
  }
}
