'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { analysePerformance } from '@/lib/agents/performance-analyst'

export async function getExperiments(channelId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('experiments')
    .select('*, opportunities!inner(channel_id, title, concept)')
    .eq('opportunities.channel_id', channelId)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function getExperiment(id: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('experiments')
    .select('*, opportunities(*), production_packs(*)')
    .eq('id', id)
    .single()
  return data
}

export async function updateExperimentActuals(
  id: string,
  actuals: {
    actual_views?: number
    actual_ctr?: number
    actual_retention?: number
    actual_affiliate_revenue?: number
    hypothesis?: string
    predicted_views?: number
    predicted_ctr?: number
    predicted_retention?: number
    predicted_affiliate_revenue?: number
  }
) {
  const supabase = await createClient()
  const { error } = await supabase.from('experiments').update(actuals).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/experiments/${id}`)
}

export async function analyseExperiment(
  experimentId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const result = await supabase
    .from('experiments')
    .select('*, opportunities(*), production_packs(*)')
    .eq('id', experimentId)
    .single()

  if (!result.data) return { success: false, error: 'Experiment not found' }

  const { opportunities, production_packs, ...experiment } = result.data

  try {
    const analysis = await analysePerformance({
      experiment,
      opportunity: opportunities,
      productionPack: production_packs,
    })

    await supabase.from('experiments').update({
      result_summary: analysis.result_summary,
      learning_summary: analysis.learning_summary,
    }).eq('id', experimentId)

    await supabase.from('opportunities').update({ status: 'analysed' }).eq('id', opportunities.id)

    revalidatePath(`/experiments/${experimentId}`)
    revalidatePath('/experiments')

    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' }
  }
}

export async function saveLearningFromExperiment(
  experimentId: string,
  channelId: string,
  learning: string,
  evidence: string,
  confidence: number
) {
  const supabase = await createClient()
  const { error } = await supabase.from('learnings').insert({
    channel_id: channelId,
    experiment_id: experimentId,
    learning,
    evidence,
    confidence,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/learnings')
  revalidatePath(`/experiments/${experimentId}`)
}

export async function saveRuleFromExperiment(
  channelId: string,
  ruleText: string,
  appliesTo: string,
  confidence: number
) {
  const supabase = await createClient()
  const { error } = await supabase.from('rules').insert({
    channel_id: channelId,
    rule_text: ruleText,
    applies_to: appliesTo,
    confidence,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/learnings')
}
