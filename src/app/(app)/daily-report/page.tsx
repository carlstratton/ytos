import { createClient } from '@/lib/supabase/server'
import { DailyReportClient } from './daily-report-client'

export default async function DailyReportPage() {
  const supabase = await createClient()

  const { data: channel } = await supabase
    .from('channels').select('id, name').order('created_at', { ascending: true }).limit(1).single()

  const { data: reports } = channel
    ? await supabase.from('daily_reports').select('*').eq('channel_id', channel.id).order('report_date', { ascending: false })
    : { data: [] }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">Daily Intelligence Report</h1>
          <p className="text-sm text-zinc-400 mt-1">Market analysis, competitor insights, and content opportunities.</p>
        </div>
      </div>
      <DailyReportClient channelId={channel?.id ?? ''} reports={reports ?? []} />
    </div>
  )
}
