import { createClient } from '@/lib/supabase/server'
import { ChannelForm } from './channel-form'

export default async function ChannelPage() {
  const supabase = await createClient()
  const { data: channel } = await supabase
    .from('channels')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-100">Channel Settings</h1>
        <p className="text-sm text-zinc-400 mt-1">Configure your channel's goal, niche, and publishing strategy.</p>
      </div>
      <ChannelForm channel={channel} />
    </div>
  )
}
