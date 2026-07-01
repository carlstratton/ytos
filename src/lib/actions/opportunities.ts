'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { generateProductionPack } from '@/lib/agents/production'
import type { OpportunityStatus } from '@/lib/types'

export async function getOpportunities(channelId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('opportunities')
    .select('*')
    .eq('channel_id', channelId)
    .order('opportunity_score', { ascending: false })
  return data ?? []
}

export async function getOpportunity(id: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('opportunities')
    .select('*')
    .eq('id', id)
    .single()
  return data
}

export async function updateOpportunityStatus(id: string, status: OpportunityStatus) {
  const supabase = await createClient()
  const { error } = await supabase.from('opportunities').update({ status }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/opportunities')
  revalidatePath(`/opportunities/${id}`)
}

export async function createProductionPackForOpportunity(
  opportunityId: string
): Promise<{ success: boolean; packId?: string; error?: string }> {
  const supabase = await createClient()

  const [opportunityResult] = await Promise.all([
    supabase.from('opportunities').select('*').eq('id', opportunityId).single(),
  ])

  if (!opportunityResult.data) return { success: false, error: 'Opportunity not found' }

  const channelResult = await supabase
    .from('channels')
    .select('*')
    .eq('id', opportunityResult.data.channel_id)
    .single()

  if (!channelResult.data) return { success: false, error: 'Channel not found' }

  try {
    const pack = await generateProductionPack({
      opportunity: opportunityResult.data,
      channel: channelResult.data,
    })

    const { data, error } = await supabase
      .from('production_packs')
      .insert({
        opportunity_id: opportunityId,
        title_options: pack.title_options,
        thumbnail_concepts: pack.thumbnail_concepts,
        hook: pack.hook,
        script: pack.script,
        voiceover_script: pack.voiceover_script,
        b_roll_list: pack.b_roll_list,
        image_prompts: pack.image_prompts,
        editing_notes: pack.editing_notes,
        description: pack.description,
        tags: pack.tags,
        cta: pack.cta,
        affiliate_notes: pack.affiliate_notes,
        status: 'draft',
      })
      .select('id')
      .single()

    if (error) return { success: false, error: error.message }

    await supabase.from('opportunities').update({ status: 'in_production' }).eq('id', opportunityId)

    revalidatePath('/opportunities')
    revalidatePath(`/opportunities/${opportunityId}`)
    revalidatePath(`/production/${data.id}`)

    return { success: true, packId: data.id }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' }
  }
}
