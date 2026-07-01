'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getProductionPack(id: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('production_packs')
    .select('*, opportunities(*)')
    .eq('id', id)
    .single()
  return data
}

export async function getProductionPackByOpportunity(opportunityId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('production_packs')
    .select('*')
    .eq('opportunity_id', opportunityId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  return data
}

export async function getAllProductionPacks(channelId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('production_packs')
    .select('*, opportunities!inner(channel_id, title, status)')
    .eq('opportunities.channel_id', channelId)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function updatePackStatus(id: string, status: 'draft' | 'approved' | 'needs_revision') {
  const supabase = await createClient()
  const { error } = await supabase.from('production_packs').update({ status }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(`/production/${id}`)
}

export async function markAsPublished(packId: string, opportunityId: string) {
  const supabase = await createClient()

  const { error: packError } = await supabase
    .from('production_packs')
    .update({ status: 'approved' })
    .eq('id', packId)

  const { error: oppError } = await supabase
    .from('opportunities')
    .update({ status: 'published' })
    .eq('id', opportunityId)

  if (packError || oppError) throw new Error('Failed to mark as published')

  // Create an experiment record
  const { data: pack } = await supabase
    .from('production_packs')
    .select('opportunity_id')
    .eq('id', packId)
    .single()

  if (pack) {
    await supabase.from('experiments').insert({
      opportunity_id: opportunityId,
      production_pack_id: packId,
      hypothesis: 'This video will perform in line with predicted metrics.',
    })
  }

  revalidatePath(`/production/${packId}`)
  revalidatePath('/experiments')
  revalidatePath('/opportunities')
}
