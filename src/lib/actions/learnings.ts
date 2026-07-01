'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getLearnings(channelId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('learnings')
    .select('*')
    .eq('channel_id', channelId)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function getRules(channelId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('rules')
    .select('*')
    .eq('channel_id', channelId)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function addLearning(data: {
  channel_id: string
  learning: string
  evidence?: string
  confidence?: number
}) {
  const supabase = await createClient()
  const { error } = await supabase.from('learnings').insert(data)
  if (error) throw new Error(error.message)
  revalidatePath('/learnings')
}

export async function addRule(data: {
  channel_id: string
  rule_text: string
  applies_to?: string
  weight_adjustment?: number
  confidence?: number
}) {
  const supabase = await createClient()
  const { error } = await supabase.from('rules').insert(data)
  if (error) throw new Error(error.message)
  revalidatePath('/learnings')
}

export async function deleteLearning(id: string) {
  const supabase = await createClient()
  await supabase.from('learnings').delete().eq('id', id)
  revalidatePath('/learnings')
}

export async function deleteRule(id: string) {
  const supabase = await createClient()
  await supabase.from('rules').delete().eq('id', id)
  revalidatePath('/learnings')
}
