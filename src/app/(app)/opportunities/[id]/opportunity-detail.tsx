'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { updateOpportunityStatus, createProductionPackForOpportunity } from '@/lib/actions/opportunities'
import type { Opportunity, OpportunityStatus } from '@/lib/types'
import { statusConfig, scoreColor, formatNumber } from '@/lib/utils'
import { ArrowLeft, Check, X, Sparkles, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
  opportunity: Opportunity
  productionPack: { id: string; status: string } | null
}

const scores = [
  { key: 'opportunity_score' as const, label: 'Overall Score', highlight: true },
  { key: 'affiliate_potential_score' as const, label: 'Affiliate' },
  { key: 'competition_score' as const, label: 'Competition' },
  { key: 'evergreen_score' as const, label: 'Evergreen' },
  { key: 'production_effort_score' as const, label: 'Effort' },
  { key: 'confidence_score' as const, label: 'Confidence' },
]

export function OpportunityDetail({ opportunity: initial, productionPack }: Props) {
  const [opp, setOpp] = useState(initial)
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function changeStatus(status: OpportunityStatus) {
    setLoading(status)
    await updateOpportunityStatus(opp.id, status)
    setOpp(prev => ({ ...prev, status }))
    setLoading(null)
  }

  async function handleGeneratePack() {
    setLoading('generating')
    setError(null)
    const result = await createProductionPackForOpportunity(opp.id)
    if (result.success && result.packId) {
      router.push(`/production/${result.packId}`)
    } else {
      setError(result.error ?? 'Failed to generate production pack')
      setLoading(null)
    }
  }

  const cfg = statusConfig(opp.status)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/opportunities" className="text-zinc-400 hover:text-zinc-100">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-zinc-100">{opp.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={cfg.className}>{cfg.label}</Badge>
            {opp.target_audience && <span className="text-xs text-zinc-500">→ {opp.target_audience}</span>}
          </div>
        </div>
      </div>

      {/* Score grid */}
      <div className="grid grid-cols-6 gap-3">
        {scores.map(({ key, label, highlight }) => (
          <div key={key} className={`rounded-lg p-3 text-center ${highlight ? 'bg-indigo-600/10 border border-indigo-500/20' : 'bg-zinc-900 border border-zinc-800'}`}>
            <p className={`text-xl font-bold ${scoreColor(opp[key])}`}>
              {opp[key]?.toString() === '0' || opp[key] != null ? (
                typeof opp[key] === 'number' && !Number.isInteger(opp[key])
                  ? opp[key]?.toFixed(0)
                  : opp[key]
              ) : '—'}
            </p>
            <p className={`text-xs mt-0.5 ${highlight ? 'text-indigo-400' : 'text-zinc-500'}`}>{label}</p>
          </div>
        ))}
      </div>

      {/* Concept & Rationale */}
      {opp.concept && (
        <Card>
          <CardHeader><CardTitle>Concept</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-300 leading-relaxed">{opp.concept}</p>
          </CardContent>
        </Card>
      )}

      {opp.rationale && (
        <Card>
          <CardHeader><CardTitle>Rationale</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-300 leading-relaxed">{opp.rationale}</p>
            {opp.estimated_views && (
              <p className="text-xs text-zinc-500 mt-3">
                Estimated views: <span className="text-zinc-300">{formatNumber(opp.estimated_views)}</span>
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action bar */}
      <Card>
        <CardContent className="py-4">
          {error && <p className="text-xs text-red-400 mb-3">{error}</p>}

          <div className="flex flex-wrap gap-2">
            {opp.status === 'draft' && (
              <>
                <Button
                  variant="success"
                  onClick={() => changeStatus('shortlisted')}
                  loading={loading === 'shortlisted'}
                >
                  <Check className="h-4 w-4" /> Shortlist
                </Button>
                <Button
                  variant="danger"
                  onClick={() => changeStatus('rejected')}
                  loading={loading === 'rejected'}
                >
                  <X className="h-4 w-4" /> Reject
                </Button>
              </>
            )}

            {opp.status === 'shortlisted' && (
              <>
                <Button
                  variant="success"
                  onClick={() => changeStatus('approved')}
                  loading={loading === 'approved'}
                >
                  <Check className="h-4 w-4" /> Approve
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => changeStatus('draft')}
                  loading={loading === 'draft'}
                >
                  Move to Draft
                </Button>
                <Button
                  variant="danger"
                  onClick={() => changeStatus('rejected')}
                  loading={loading === 'rejected'}
                >
                  <X className="h-4 w-4" /> Reject
                </Button>
              </>
            )}

            {opp.status === 'approved' && !productionPack && (
              <Button
                onClick={handleGeneratePack}
                loading={loading === 'generating'}
              >
                <Sparkles className="h-4 w-4" />
                Generate Production Pack
              </Button>
            )}

            {(opp.status === 'in_production' || (opp.status === 'approved' && productionPack)) && productionPack && (
              <Link href={`/production/${productionPack.id}`}>
                <Button variant="secondary">
                  View Production Pack <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}

            {opp.status === 'approved' && !productionPack && (
              <Button
                onClick={handleGeneratePack}
                loading={loading === 'generating'}
              >
                <Sparkles className="h-4 w-4" />
                Generate Production Pack
              </Button>
            )}

            {opp.status === 'rejected' && (
              <Button variant="ghost" onClick={() => changeStatus('draft')}>
                Move back to Draft
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
