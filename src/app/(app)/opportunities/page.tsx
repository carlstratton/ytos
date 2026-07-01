import { createClient } from '@/lib/supabase/server'
import { OpportunitiesBoard } from './opportunities-board'

export default async function OpportunitiesPage() {
  const supabase = await createClient()

  const { data: channel } = await supabase
    .from('channels').select('id').order('created_at', { ascending: true }).limit(1).single()

  const { data: opportunities } = channel
    ? await supabase.from('opportunities').select('*').eq('channel_id', channel.id).order('opportunity_score', { ascending: false })
    : { data: [] }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-100">Opportunities</h1>
        <p className="text-sm text-zinc-400 mt-1">Move ideas from draft to approved and into production.</p>
      </div>
      <OpportunitiesBoard opportunities={opportunities ?? []} />
    </div>
  )
}
