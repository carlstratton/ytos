import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ExperimentDetail } from './experiment-detail'

export default async function ExperimentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: experiment } = await supabase
    .from('experiments')
    .select('*, opportunities(*), production_packs(*)')
    .eq('id', id)
    .single()

  if (!experiment) notFound()

  const { data: channel } = await supabase
    .from('channels').select('id').eq('id', experiment.opportunities?.channel_id ?? '').single()

  return (
    <div className="p-8 max-w-3xl">
      <ExperimentDetail experiment={experiment as any} channelId={channel?.id ?? ''} />
    </div>
  )
}
