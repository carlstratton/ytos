'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getChannel() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('channels')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(1)
    .single()
  return data
}

export async function updateChannel(id: string, updates: Record<string, string>) {
  const supabase = await createClient()
  const { error } = await supabase.from('channels').update(updates).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}

export async function createChannel(data: {
  name: string
  platform: string
  niche: string
  target_audience: string
  primary_goal: string
  revenue_goal: string
  publishing_cadence: string
}) {
  const supabase = await createClient()
  const { error } = await supabase.from('channels').insert(data)
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}
