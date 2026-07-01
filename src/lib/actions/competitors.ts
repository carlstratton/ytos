'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getCompetitors(channelId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('competitors')
    .select('*')
    .eq('channel_id', channelId)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function addCompetitor(data: {
  channel_id: string
  name: string
  platform: string
  url?: string
  notes?: string
  average_views?: number
  upload_frequency?: string
}) {
  const supabase = await createClient()
  const { error } = await supabase.from('competitors').insert(data)
  if (error) throw new Error(error.message)
  revalidatePath('/competitors')
}

export async function updateCompetitor(id: string, data: Partial<{
  name: string
  platform: string
  url: string
  notes: string
  average_views: number
  upload_frequency: string
}>) {
  const supabase = await createClient()
  const { error } = await supabase.from('competitors').update(data).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/competitors')
}

export async function deleteCompetitor(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('competitors').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/competitors')
}
