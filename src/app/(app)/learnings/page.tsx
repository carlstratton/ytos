import { createClient } from '@/lib/supabase/server'
import { LearningsClient } from './learnings-client'

export default async function LearningsPage() {
  const supabase = await createClient()

  const { data: channel } = await supabase
    .from('channels').select('id').order('created_at', { ascending: true }).limit(1).single()

  const [{ data: learnings }, { data: rules }] = await Promise.all([
    channel
      ? supabase.from('learnings').select('*').eq('channel_id', channel.id).order('created_at', { ascending: false })
      : { data: [] },
    channel
      ? supabase.from('rules').select('*').eq('channel_id', channel.id).order('created_at', { ascending: false })
      : { data: [] },
  ])

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-100">Knowledge Base</h1>
        <p className="text-sm text-zinc-400 mt-1">Learnings and rules that shape future content strategy.</p>
      </div>
      <LearningsClient
        channelId={channel?.id ?? ''}
        learnings={learnings ?? []}
        rules={rules ?? []}
      />
    </div>
  )
}
