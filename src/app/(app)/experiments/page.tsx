import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { formatDate, formatNumber, formatCurrency, scoreColor } from '@/lib/utils'
import { ArrowRight, FlaskConical } from 'lucide-react'

export default async function ExperimentsPage() {
  const supabase = await createClient()

  const { data: channel } = await supabase
    .from('channels').select('id').order('created_at', { ascending: true }).limit(1).single()

  const { data: experiments } = channel
    ? await supabase
        .from('experiments')
        .select('*, opportunities!inner(channel_id, title)')
        .eq('opportunities.channel_id', channel.id)
        .order('created_at', { ascending: false })
    : { data: [] }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-100">Experiments</h1>
        <p className="text-sm text-zinc-400 mt-1">Track every published video as a learning experiment.</p>
      </div>

      {(!experiments || experiments.length === 0) ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FlaskConical className="h-8 w-8 text-zinc-600 mx-auto mb-3" />
            <p className="text-sm text-zinc-400">No experiments yet.</p>
            <p className="text-xs text-zinc-500 mt-1">Mark a production pack as published to create your first experiment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {(experiments as any[]).map((exp) => {
            const hasActuals = exp.actual_views != null
            const diff = hasActuals && exp.predicted_views
              ? ((exp.actual_views - exp.predicted_views) / exp.predicted_views * 100)
              : null

            return (
              <Link key={exp.id} href={`/experiments/${exp.id}`}>
                <Card className="hover:border-zinc-700 hover:bg-zinc-800/40 transition-all cursor-pointer">
                  <CardContent className="py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-100 truncate">{exp.opportunities?.title ?? 'Untitled'}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{formatDate(exp.created_at)}</p>
                      </div>

                      <div className="flex items-center gap-6 flex-shrink-0">
                        {hasActuals ? (
                          <>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-zinc-100">{formatNumber(exp.actual_views)}</p>
                              <p className="text-xs text-zinc-500">views</p>
                            </div>
                            {exp.actual_ctr != null && (
                              <div className="text-right">
                                <p className="text-sm font-semibold text-zinc-100">{exp.actual_ctr}%</p>
                                <p className="text-xs text-zinc-500">CTR</p>
                              </div>
                            )}
                            {exp.actual_affiliate_revenue != null && (
                              <div className="text-right">
                                <p className="text-sm font-semibold text-emerald-400">{formatCurrency(exp.actual_affiliate_revenue)}</p>
                                <p className="text-xs text-zinc-500">revenue</p>
                              </div>
                            )}
                            {diff != null && (
                              <div className={`text-right ${diff >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                <p className="text-sm font-semibold">{diff >= 0 ? '+' : ''}{diff.toFixed(0)}%</p>
                                <p className="text-xs text-zinc-500">vs pred.</p>
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-zinc-500 bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded">Awaiting data</span>
                        )}
                        <ArrowRight className="h-4 w-4 text-zinc-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
