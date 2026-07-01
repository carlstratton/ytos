'use server'

import { callAgent } from '@/lib/anthropic'
import type { Channel, DailyReport, Learning, Rule } from '@/lib/types'

const SYSTEM_PROMPT = `You are the Opportunity Scoring Agent for Media OS.

Generate exactly 10 video opportunities for the channel.

Score each from 0–100 using these weighted criteria:
- Estimated views: 30% weight (score based on realistic view potential)
- Affiliate potential: 30% weight (how well does it support affiliate revenue?)
- Competition: 20% weight (100 = very low competition, 0 = extremely competitive)
- Evergreen value: 15% weight (will this video perform in 12+ months?)
- Production effort: 5% weight (100 = very easy to produce, 0 = very hard)

Calculate the opportunity_score using: (views*0.30) + (affiliate*0.30) + (competition*0.20) + (evergreen*0.15) + (effort*0.05)

Return a JSON array of exactly 10 objects, each with:
- title: string
- concept: string (2-3 sentences describing the video)
- target_audience: string
- estimated_views: number (realistic integer estimate for first 30 days)
- affiliate_potential_score: number (0-100)
- competition_score: number (0-100, higher = less competition)
- evergreen_score: number (0-100)
- production_effort_score: number (0-100, higher = easier)
- opportunity_score: number (0-100, calculated from formula)
- confidence_score: number (0-100)
- rationale: string (2-3 sentences explaining the recommendation)

Return ONLY the JSON array. No markdown, no code blocks, no preamble.`

interface OpportunityScoringInput {
  channel: Channel
  report: DailyReport
  learnings: Learning[]
  rules: Rule[]
}

export interface ScoredOpportunity {
  title: string
  concept: string
  target_audience: string
  estimated_views: number
  affiliate_potential_score: number
  competition_score: number
  evergreen_score: number
  production_effort_score: number
  opportunity_score: number
  confidence_score: number
  rationale: string
}

export async function generateOpportunities(input: OpportunityScoringInput): Promise<ScoredOpportunity[]> {
  const userMessage = `
Channel Information:
- Name: ${input.channel.name}
- Niche: ${input.channel.niche ?? 'Not specified'}
- Target Audience: ${input.channel.target_audience ?? 'Not specified'}
- Revenue Goal: ${input.channel.revenue_goal ?? 'Not specified'}

Today's Market Report Summary:
${input.report.summary ?? 'Not available'}

Emerging Topics:
${(input.report.emerging_topics ?? []).map(t => `- ${t}`).join('\n')}

Outperforming Video Patterns:
${input.report.outperforming_videos ?? 'Not available'}

Thumbnail Trends:
${input.report.thumbnail_trends ?? 'Not available'}

Format Trends:
${input.report.format_trends ?? 'Not available'}

Recommended Actions from Report:
${(input.report.recommended_actions ?? []).map(a => `- ${a}`).join('\n')}

Active Rules:
${input.rules.length > 0 ? input.rules.map(r => `- ${r.rule_text}`).join('\n') : 'None yet'}

Learnings:
${input.learnings.length > 0 ? input.learnings.slice(0, 10).map(l => `- ${l.learning}`).join('\n') : 'None yet'}

Generate 10 scored video opportunities. Only recommend ideas that could realistically support an affiliate-led channel.
  `.trim()

  const raw = await callAgent(SYSTEM_PROMPT, userMessage)

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : parsed.opportunities ?? []
  } catch {
    const match = raw.match(/\[[\s\S]*\]/)
    if (match) return JSON.parse(match[0])
    throw new Error('Failed to parse opportunity scoring response')
  }
}
