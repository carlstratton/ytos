'use server'

import { callAgent } from '@/lib/anthropic'
import type { Channel, Competitor, Learning, Rule } from '@/lib/types'

const SYSTEM_PROMPT = `You are the Market Intelligence Agent for Media OS.

Your job is to identify emerging content opportunities for a faceless YouTube channel.

Analyse the channel niche, target audience, competitor notes, existing learnings and rules.

Return a JSON object with exactly these fields:
- summary: string (2-3 paragraph strategic overview)
- emerging_topics: string[] (array of 5-8 specific topic strings)
- competitor_activity: string (paragraph about what competitors are doing)
- outperforming_videos: string (paragraph about video patterns that are outperforming)
- thumbnail_trends: string (paragraph about thumbnail trends in the niche)
- format_trends: string (paragraph about video format trends)
- recommended_actions: string[] (array of 3-5 specific actionable recommendations)

Return ONLY valid JSON. No markdown, no code blocks, no preamble.`

interface MarketReportInput {
  channel: Channel
  competitors: Competitor[]
  learnings: Learning[]
  rules: Rule[]
}

export interface MarketReportOutput {
  summary: string
  emerging_topics: string[]
  competitor_activity: string
  outperforming_videos: string
  thumbnail_trends: string
  format_trends: string
  recommended_actions: string[]
}

export async function generateMarketReport(input: MarketReportInput): Promise<MarketReportOutput> {
  const userMessage = `
Channel Information:
- Name: ${input.channel.name}
- Platform: ${input.channel.platform}
- Niche: ${input.channel.niche ?? 'Not specified'}
- Target Audience: ${input.channel.target_audience ?? 'Not specified'}
- Primary Goal: ${input.channel.primary_goal ?? 'Not specified'}
- Revenue Goal: ${input.channel.revenue_goal ?? 'Not specified'}
- Publishing Cadence: ${input.channel.publishing_cadence ?? 'Not specified'}

Competitors (${input.competitors.length}):
${input.competitors.map(c => `- ${c.name} (${c.platform}): ${c.url ?? ''} | Avg views: ${c.average_views ?? 'unknown'} | Frequency: ${c.upload_frequency ?? 'unknown'} | Notes: ${c.notes ?? 'none'}`).join('\n')}

Existing Learnings:
${input.learnings.length > 0 ? input.learnings.map(l => `- ${l.learning} (confidence: ${l.confidence ?? 'unknown'})`).join('\n') : 'None yet'}

Active Rules:
${input.rules.length > 0 ? input.rules.map(r => `- ${r.rule_text} (applies to: ${r.applies_to ?? 'general'})`).join('\n') : 'None yet'}

Generate today's market intelligence report. Focus on content opportunities that support affiliate revenue and channel asset value.
  `.trim()

  const raw = await callAgent(SYSTEM_PROMPT, userMessage)
  
  try {
    return JSON.parse(raw) as MarketReportOutput
  } catch {
    // Attempt to extract JSON if model wrapped it
    const match = raw.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0]) as MarketReportOutput
    throw new Error('Failed to parse market report response')
  }
}
