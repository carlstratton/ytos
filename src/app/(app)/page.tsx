import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatNumber, formatCurrency, scoreColor, statusConfig } from '@/lib/utils'
import Link from 'next/link'
import { ArrowRight, TrendingUp, Lightbulb, Clapperboard, FlaskConical, BookOpen, Target, AlertCircle } from 'lucide-react'
import type { Opportunity, Experiment } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: channel } = await supabase
    .from('channels')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  if (!channel) {
    return (
      <div className="p-8 max-w-lg">
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-300">No channel found</p>
              <p className="text-xs text-amber-400/80 mt-1">
                Run the seed SQL to set up your channel, or create one via{' '}
                <Link href="/channel" className="underline">Channel Settings</Link>.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const [
    { data: latestReport },
    { data: topOpps },
    { data: inProdOpps },
    { data: recentExperiments },
    { data: recentLearnings },
    { data: recentRules },
    { data: allExperiments },
  ] = await Promise.all([
    supabase.from('daily_reports').select('*').eq('channel_id', channel.id).order('report_date', { ascending: false }).limit(1).single(),
    supabase.from('opportunities').select('*').eq('channel_id', channel.id).in('status', ['draft', 'shortlisted', 'approved']).order('opportunity_score', { ascending: false }).limit(5),
    supabase.from('opportunities').select('*').eq('channel_id', channel.id).in('status', ['approved', 'in_production']).order('created_at', { ascending: false }).limit(5),
    supabase.from('experiments').select('*, opportunities!inner(channel_id, title)').eq('opportunities.channel_id', channel.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('learnings').select('*').eq('channel_id', channel.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('rules').select('*').eq('channel_id', channel.id).order('created_at', { ascending: false }).limit(3),
    supabase.from('experiments').select('actual_affiliate_revenue').eq('opportunities.channel_id', channel.id).not('actual_affiliate_revenue', 'is', null),
  ])

  const monthlyRevenue = (allExperiments ?? []).reduce((sum: number, e: { actual_affiliate_revenue: number | null }) => sum + (e.actual_affiliate_revenue ?? 0), 0)
  const revenueGoalAmount = parseFloat(channel.revenue_goal?.replace(/[^0-9.]/g, '') ?? '5000')
  const revenueProgress = Math.min(100, (monthlyRevenue / revenueGoalAmount) * 100)

  const topOpp = (topOpps ?? [])[0] as Opportunity | undefined
  const priorityAction = inProdOpps && inProdOpps.length > 0
    ? `You have ${inProdOpps.length} approved idea${inProdOpps.length > 1 ? 's' : ''} waiting for production. Start with "${inProdOpps[0].title}".`
    : topOpp
    ? `"${topOpp.title}" is your highest-scoring opportunity (${topOpp.opportunity_score?.toFixed(0) ?? '?'}/100). Consider approving and generating a production pack.`
    : latestReport
    ? 'Generate opportunities from today\'s report to build your production queue.'
    : 'Generate your first Daily Intelligence Report to get started.'

  return (
    <div className="p-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-100">{channel.name}</h1>
        <p className="text-sm text-zinc-400 mt-1">{channel.niche ?? 'No niche set'} · {channel.platform}</p>
      </div>

      {/* Today's Priority */}
      <div className="mb-6 bg-indigo-600/10 border border-indigo-500/20 rounded-lg p-5 flex items-start gap-4">
        <div className="w-8 h-8 rounded-lg bg-indigo-600/30 flex items-center justify-center flex-shrink-0">
          <Target className="h-4 w-4 text-indigo-400" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">Today's Priority</p>
          <p className="text-sm text-zinc-100">{priorityAction}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {/* Revenue Progress */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  Revenue Progress
                </CardTitle>
                <CardDescription>Toward {channel.revenue_goal ?? '£5,000/month'}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-3">
              <div className="flex justify-between text-xs text-zinc-400 mb-1.5">
                <span>{formatCurrency(monthlyRevenue)}</span>
                <span>{channel.revenue_goal ?? '£5,000/month'}</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${revenueProgress}%` }}
                />
              </div>
              <p className="text-xs text-zinc-400 mt-1.5">{revenueProgress.toFixed(1)}% of goal</p>
            </div>
          </CardContent>
        </Card>

        {/* Top Opportunities */}
        <Card className="md:col-span-1 xl:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-400" />
                  Top Opportunities
                </CardTitle>
                <CardDescription>Highest-scored pending ideas</CardDescription>
              </div>
              <Link href="/opportunities" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {(topOpps ?? []).length === 0 ? (
              <p className="text-xs text-zinc-500 px-6 py-4">No opportunities yet. Generate a daily report first.</p>
            ) : (
              <ul className="divide-y divide-zinc-800">
                {(topOpps as Opportunity[]).map((opp) => (
                  <li key={opp.id}>
                    <Link href={`/opportunities/${opp.id}`} className="flex items-center gap-3 px-6 py-3 hover:bg-zinc-800/40 transition-colors">
                      <span className={`text-sm font-semibold w-9 flex-shrink-0 ${scoreColor(opp.opportunity_score)}`}>
                        {opp.opportunity_score?.toFixed(0) ?? '—'}
                      </span>
                      <span className="text-sm text-zinc-200 flex-1 truncate">{opp.title}</span>
                      <span className="text-xs text-zinc-500 flex-shrink-0">{formatNumber(opp.estimated_views)} views</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Production Queue */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clapperboard className="h-4 w-4 text-indigo-400" />
                Production Queue
              </CardTitle>
              <Link href="/opportunities" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                View <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <CardDescription>Approved ideas waiting for production</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {(inProdOpps ?? []).length === 0 ? (
              <p className="text-xs text-zinc-500 px-6 py-4">No approved ideas in production queue.</p>
            ) : (
              <ul className="divide-y divide-zinc-800">
                {(inProdOpps as Opportunity[]).map((opp) => (
                  <li key={opp.id}>
                    <Link href={`/opportunities/${opp.id}`} className="flex items-center gap-3 px-6 py-3 hover:bg-zinc-800/40 transition-colors">
                      <span className="text-sm text-zinc-200 flex-1 truncate">{opp.title}</span>
                      <Badge className={statusConfig(opp.status).className}>{statusConfig(opp.status).label}</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Recent Performance */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-purple-400" />
                Recent Performance
              </CardTitle>
              <Link href="/experiments" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                View <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <CardDescription>Latest published experiments</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {(recentExperiments ?? []).length === 0 ? (
              <p className="text-xs text-zinc-500 px-6 py-4">No experiments yet.</p>
            ) : (
              <ul className="divide-y divide-zinc-800">
                {(recentExperiments as Array<Experiment & { opportunities: { title: string } }>).map((exp) => (
                  <li key={exp.id}>
                    <Link href={`/experiments/${exp.id}`} className="flex items-center gap-3 px-6 py-3 hover:bg-zinc-800/40 transition-colors">
                      <span className="text-sm text-zinc-200 flex-1 truncate">{exp.opportunities?.title ?? 'Untitled'}</span>
                      <span className="text-xs text-zinc-400 flex-shrink-0">{formatNumber(exp.actual_views)} views</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Latest Learnings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-teal-400" />
                Latest Learnings
              </CardTitle>
              <Link href="/learnings" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                View <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <CardDescription>Recent rules and insights</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(recentRules ?? []).length === 0 && (recentLearnings ?? []).length === 0 ? (
              <p className="text-xs text-zinc-500">No learnings yet. Analyse an experiment to generate insights.</p>
            ) : (
              <>
                {(recentRules ?? []).slice(0, 2).map((rule) => (
                  <div key={rule.id} className="bg-zinc-800/50 rounded p-2.5">
                    <p className="text-xs font-medium text-amber-400 mb-0.5">Rule</p>
                    <p className="text-xs text-zinc-300 line-clamp-2">{rule.rule_text}</p>
                  </div>
                ))}
                {(recentLearnings ?? []).slice(0, 3).map((l) => (
                  <div key={l.id} className="bg-zinc-800/50 rounded p-2.5">
                    <p className="text-xs text-zinc-300 line-clamp-2">{l.learning}</p>
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>

        {/* Today's Report */}
        <Card className="md:col-span-2 xl:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Today's Intelligence</CardTitle>
                <CardDescription>
                  {latestReport ? formatDate(latestReport.report_date) : 'No report yet'}
                </CardDescription>
              </div>
              <Link href="/daily-report" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                {latestReport ? 'View' : 'Generate'} <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {latestReport?.summary ? (
              <p className="text-xs text-zinc-400 line-clamp-6">{latestReport.summary}</p>
            ) : (
              <div className="text-center py-4">
                <p className="text-xs text-zinc-500">No report generated yet.</p>
                <Link href="/daily-report" className="text-xs text-indigo-400 hover:text-indigo-300 mt-1 inline-block">
                  Generate your first report →
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
