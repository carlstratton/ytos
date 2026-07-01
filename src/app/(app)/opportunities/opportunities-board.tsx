'use client'

import Link from 'next/link'
import type { Opportunity, OpportunityStatus } from '@/lib/types'
import { scoreColor, statusConfig, formatNumber } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'

const COLUMNS: { status: OpportunityStatus; label: string }[] = [
  { status: 'draft', label: 'Draft' },
  { status: 'shortlisted', label: 'Shortlisted' },
  { status: 'approved', label: 'Approved' },
  { status: 'in_production', label: 'In Production' },
  { status: 'published', label: 'Published' },
  { status: 'analysed', label: 'Analysed' },
]

interface Props {
  opportunities: Opportunity[]
}

export function OpportunitiesBoard({ opportunities }: Props) {
  const grouped = COLUMNS.map(col => ({
    ...col,
    items: opportunities.filter(o => o.status === col.status),
  }))

  const totalByCol = grouped.map(g => g.items.length)
  const hasAny = totalByCol.some(n => n > 0)

  if (!hasAny) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-zinc-400">No opportunities yet.</p>
        <p className="text-xs text-zinc-500 mt-1">Generate a daily report and create opportunities from it.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-fit">
        {grouped.map(({ status, label, items }) => {
          const cfg = statusConfig(status)
          return (
            <div key={status} className="w-72 flex-shrink-0">
              <div className="flex items-center gap-2 mb-3">
                <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${cfg.className}`}>
                  {label}
                </span>
                <span className="text-xs text-zinc-500">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map((opp) => (
                  <OpportunityCard key={opp.id} opp={opp} />
                ))}
                {items.length === 0 && (
                  <div className="border border-dashed border-zinc-800 rounded-lg p-4 text-center">
                    <p className="text-xs text-zinc-600">Empty</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function OpportunityCard({ opp }: { opp: Opportunity }) {
  return (
    <Link href={`/opportunities/${opp.id}`}>
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 hover:bg-zinc-800/60 transition-all group cursor-pointer">
        <div className="flex items-start justify-between gap-2 mb-3">
          <p className="text-sm font-medium text-zinc-100 line-clamp-2 flex-1 leading-tight">{opp.title}</p>
          <ChevronRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-zinc-400 flex-shrink-0 mt-0.5 transition-colors" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-center">
              <p className={`text-lg font-bold ${scoreColor(opp.opportunity_score)}`}>
                {opp.opportunity_score?.toFixed(0) ?? '—'}
              </p>
              <p className="text-xs text-zinc-600">score</p>
            </div>
            <div className="w-px h-8 bg-zinc-800" />
            <div className="space-y-0.5">
              <p className="text-xs text-zinc-400">{formatNumber(opp.estimated_views)} views</p>
              <p className="text-xs text-zinc-500">aff: {opp.affiliate_potential_score ?? '—'} · comp: {opp.competition_score ?? '—'}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-500">conf</p>
            <p className={`text-sm font-semibold ${scoreColor(opp.confidence_score)}`}>{opp.confidence_score ?? '—'}</p>
          </div>
        </div>
      </div>
    </Link>
  )
}
