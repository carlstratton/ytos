import { createClient } from '@/lib/supabase/server'
import { CompetitorsClient } from './competitors-client'
import type { Competitor } from '@/lib/types'

export default async function CompetitorsPage() {
  const supabase = await createClient()

  const { data: channelData } = await supabase
    .from('channels')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  const channel = channelData as { id: string; name: string } | null

  const { data: competitorsData } = channel
    ? await supabase.from('competitors').select('*').eq('channel_id', channel.id).order('created_at', { ascending: false })
    : { data: [] }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-100">Competitors</h1>
        <p className="text-sm text-zinc-400 mt-1">Monitor the channels you're competing with and learning from.</p>
      </div>
      <CompetitorsClient
        channelId={channel?.id ?? ''}
        competitors={(competitorsData ?? []) as Competitor[]}
      />
    </div>
  )
}
