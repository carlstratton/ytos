'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { generateReport, generateOpportunitiesFromReport } from '@/lib/actions/daily-report'
import type { DailyReport } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { Sparkles, ChevronDown, ChevronUp, Lightbulb, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
  channelId: string
  reports: DailyReport[]
}

export function DailyReportClient({ channelId, reports: initial }: Props) {
  const [reports] = useState(initial)
  const [selectedId, setSelectedId] = useState<string | null>(initial[0]?.id ?? null)
  const [generating, setGenerating] = useState(false)
  const [generatingOpps, setGeneratingOpps] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const router = useRouter()

  const selectedReport = reports.find(r => r.id === selectedId)

  async function handleGenerate() {
    setGenerating(true)
    setError(null)
    setSuccess(null)
    const result = await generateReport(channelId)
    if (result.success) {
      setSuccess('Report generated successfully!')
      router.refresh()
    } else {
      setError(result.error ?? 'Failed to generate report')
    }
    setGenerating(false)
  }

  async function handleGenerateOpportunities(reportId: string) {
    setGeneratingOpps(true)
    setError(null)
    const result = await generateOpportunitiesFromReport(reportId, channelId)
    if (result.success) {
      setSuccess(`Generated ${result.count} opportunities!`)
      router.push('/opportunities')
    } else {
      setError(result.error ?? 'Failed to generate opportunities')
    }
    setGeneratingOpps(false)
  }

  function toggle(key: string) {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Button onClick={handleGenerate} loading={generating}>
          <Sparkles className="h-4 w-4" />
          Generate Today's Report
        </Button>
        {reports.length > 0 && (
          <Button
            variant="secondary"
            onClick={() => selectedId && handleGenerateOpportunities(selectedId)}
            loading={generatingOpps}
            disabled={!selectedId}
          >
            <Lightbulb className="h-4 w-4" />
            Generate Opportunities
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-emerald-400">{success}</p>
        </div>
      )}

      {reports.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Sparkles className="h-8 w-8 text-zinc-600 mx-auto mb-3" />
            <p className="text-sm text-zinc-400">No reports yet.</p>
            <p className="text-xs text-zinc-500 mt-1">Click "Generate Today's Report" to analyse your market.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex gap-5">
          {/* Report list */}
          <div className="w-48 flex-shrink-0 space-y-1.5">
            {reports.map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedId(r.id)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  selectedId === r.id
                    ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-600/20'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
                }`}
              >
                {formatDate(r.report_date)}
              </button>
            ))}
          </div>

          {/* Report detail */}
          {selectedReport && (
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-zinc-100">
                    Report — {formatDate(selectedReport.report_date)}
                  </h2>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleGenerateOpportunities(selectedReport.id)}
                  loading={generatingOpps}
                >
                  <Lightbulb className="h-3.5 w-3.5" />
                  Generate Opportunities
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>

              {selectedReport.summary && (
                <Card>
                  <CardHeader>
                    <CardTitle>Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{selectedReport.summary}</p>
                  </CardContent>
                </Card>
              )}

              {selectedReport.emerging_topics && selectedReport.emerging_topics.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Emerging Topics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {selectedReport.emerging_topics.map((t, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                          <span className="text-indigo-400 font-medium flex-shrink-0 w-5">{i + 1}.</span>
                          {t}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {[
                { key: 'competitor_activity', label: 'Competitor Activity', value: selectedReport.competitor_activity },
                { key: 'outperforming_videos', label: 'Outperforming Video Patterns', value: selectedReport.outperforming_videos },
                { key: 'thumbnail_trends', label: 'Thumbnail Trends', value: selectedReport.thumbnail_trends },
                { key: 'format_trends', label: 'Format Trends', value: selectedReport.format_trends },
              ].filter(s => s.value).map(({ key, label, value }) => (
                <Card key={key}>
                  <button
                    className="w-full text-left"
                    onClick={() => toggle(key)}
                  >
                    <CardHeader className="cursor-pointer hover:bg-zinc-800/30 transition-colors rounded-t-lg">
                      <div className="flex items-center justify-between">
                        <CardTitle>{label}</CardTitle>
                        {expanded[key] ? <ChevronUp className="h-4 w-4 text-zinc-400" /> : <ChevronDown className="h-4 w-4 text-zinc-400" />}
                      </div>
                    </CardHeader>
                  </button>
                  {expanded[key] && (
                    <CardContent>
                      <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{value}</p>
                    </CardContent>
                  )}
                </Card>
              ))}

              {selectedReport.recommended_actions && selectedReport.recommended_actions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recommended Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {selectedReport.recommended_actions.map((a, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                          <span className="text-emerald-400 font-medium flex-shrink-0 mt-0.5">→</span>
                          {a}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
