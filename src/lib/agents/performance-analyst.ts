'use server'

import { callAgent } from '@/lib/anthropic'
import type { Experiment, Opportunity, ProductionPack } from '@/lib/types'

const SYSTEM_PROMPT = `You are the Performance Analyst Agent for Media OS.

Compare predicted performance with actual results for a published YouTube video.

Return a JSON object with exactly these fields:
- result_summary: string (2-3 paragraph analysis comparing predictions to actuals)
- learning_summary: string (1-2 paragraphs of key learnings from this video)
- what_worked: string[] (list of 3-5 things that worked)
- what_failed: string[] (list of 2-4 things that didn't work or underperformed)
- hypothesis_validated: boolean (was the original hypothesis validated?)
- hypothesis_verdict: string (1-2 sentences explaining the verdict)
- suggested_learning: string (one reusable learning statement to save to the knowledge base)
- suggested_rule: string (one reusable rule that should be applied to future scoring, or null if none)
- next_recommendation: string (what should be done next based on this performance)

Return ONLY valid JSON. No markdown, no code blocks, no preamble.`

interface AnalysisInput {
  experiment: Experiment
  opportunity: Opportunity
  productionPack: ProductionPack | null
}

export interface PerformanceAnalysis {
  result_summary: string
  learning_summary: string
  what_worked: string[]
  what_failed: string[]
  hypothesis_validated: boolean
  hypothesis_verdict: string
  suggested_learning: string
  suggested_rule: string | null
  next_recommendation: string
}

export async function analysePerformance(input: AnalysisInput): Promise<PerformanceAnalysis> {
  const userMessage = `
Video: "${input.opportunity.title}"
Concept: ${input.opportunity.concept ?? 'Not specified'}
Original Rationale: ${input.opportunity.rationale ?? 'Not specified'}

Predictions:
- Views: ${input.experiment.predicted_views ?? 'Not predicted'}
- CTR: ${input.experiment.predicted_ctr ?? 'Not predicted'}%
- Retention: ${input.experiment.predicted_retention ?? 'Not predicted'}%
- Affiliate Revenue: £${input.experiment.predicted_affiliate_revenue ?? 'Not predicted'}

Actuals:
- Views: ${input.experiment.actual_views ?? 'Not recorded'}
- CTR: ${input.experiment.actual_ctr ?? 'Not recorded'}%
- Retention: ${input.experiment.actual_retention ?? 'Not recorded'}%
- Affiliate Revenue: £${input.experiment.actual_affiliate_revenue ?? 'Not recorded'}

Original Hypothesis: ${input.experiment.hypothesis ?? 'Not specified'}

Analyse performance, identify learnings, and recommend next actions. Optimise for learning velocity, affiliate revenue, and channel resale value.
  `.trim()

  const raw = await callAgent(SYSTEM_PROMPT, userMessage)

  try {
    return JSON.parse(raw) as PerformanceAnalysis
  } catch {
    const match = raw.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0]) as PerformanceAnalysis
    throw new Error('Failed to parse performance analysis response')
  }
}
