'use server'

import { callAgent } from '@/lib/anthropic'
import type { Opportunity, Channel } from '@/lib/types'

const SYSTEM_PROMPT = `You are the Production Agent for Media OS.

Create a complete production pack for an approved YouTube video opportunity.

The channel is faceless, fast-moving, and optimised for rapid learning.

Return a JSON object with exactly these fields:
- title_options: string[] (exactly 10 title options, varied hooks and angles)
- thumbnail_concepts: string[] (exactly 5 thumbnail concept descriptions)
- hook: string (the single best opening hook, first 30 seconds)
- script: string (full video script with sections and timestamps)
- voiceover_script: string (clean voiceover-ready version without stage directions)
- b_roll_list: string[] (list of 10-15 specific b-roll shot descriptions)
- image_prompts: string[] (list of 5-8 AI image generation prompts for thumbnails/visuals)
- editing_notes: string (specific editing guidance for pacing, cuts, music, graphics)
- description: string (full YouTube description with timestamps and affiliate links placeholder)
- tags: string[] (20 SEO-optimised tags)
- cta: string (call to action script for the video)
- affiliate_notes: string (where and how to place affiliate mentions naturally)

Return ONLY valid JSON. No markdown, no code blocks, no preamble.`

interface ProductionInput {
  opportunity: Opportunity
  channel: Channel
}

export interface ProductionPackContent {
  title_options: string[]
  thumbnail_concepts: string[]
  hook: string
  script: string
  voiceover_script: string
  b_roll_list: string[]
  image_prompts: string[]
  editing_notes: string
  description: string
  tags: string[]
  cta: string
  affiliate_notes: string
}

export async function generateProductionPack(input: ProductionInput): Promise<ProductionPackContent> {
  const userMessage = `
Channel:
- Name: ${input.channel.name}
- Niche: ${input.channel.niche ?? 'Not specified'}
- Target Audience: ${input.channel.target_audience ?? 'Not specified'}
- Goal: ${input.channel.primary_goal ?? 'Not specified'}

Approved Opportunity:
- Title: ${input.opportunity.title}
- Concept: ${input.opportunity.concept ?? 'Not specified'}
- Target Audience: ${input.opportunity.target_audience ?? 'Not specified'}
- Rationale: ${input.opportunity.rationale ?? 'Not specified'}
- Estimated Views: ${input.opportunity.estimated_views ?? 'Unknown'}
- Affiliate Score: ${input.opportunity.affiliate_potential_score ?? 'Unknown'}/100
- Confidence: ${input.opportunity.confidence_score ?? 'Unknown'}/100

Create a full production pack. The video should be designed for high CTR, strong retention, and affiliate conversion.
Start with tension, curiosity, or a strong promise. Avoid generic intros.
  `.trim()

  const raw = await callAgent(SYSTEM_PROMPT, userMessage)

  try {
    return JSON.parse(raw) as ProductionPackContent
  } catch {
    const match = raw.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0]) as ProductionPackContent
    throw new Error('Failed to parse production pack response')
  }
}
