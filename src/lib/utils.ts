import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatNumber(n: number | null | undefined) {
  if (n == null) return '—'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return n.toString()
}

export function formatCurrency(n: number | null | undefined) {
  if (n == null) return '—'
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(n)
}

export function scoreColor(score: number | null | undefined): string {
  if (score == null) return 'text-zinc-400'
  if (score >= 75) return 'text-emerald-400'
  if (score >= 50) return 'text-amber-400'
  return 'text-red-400'
}

export function scoreBg(score: number | null | undefined): string {
  if (score == null) return 'bg-zinc-800'
  if (score >= 75) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  if (score >= 50) return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  return 'bg-red-500/10 text-red-400 border-red-500/20'
}

export function statusConfig(status: string) {
  const map: Record<string, { label: string; className: string }> = {
    draft: { label: 'Draft', className: 'bg-zinc-800 text-zinc-300 border-zinc-700' },
    shortlisted: { label: 'Shortlisted', className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    approved: { label: 'Approved', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    rejected: { label: 'Rejected', className: 'bg-red-500/10 text-red-400 border-red-500/20' },
    in_production: { label: 'In Production', className: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
    published: { label: 'Published', className: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    analysed: { label: 'Analysed', className: 'bg-teal-500/10 text-teal-400 border-teal-500/20' },
    needs_revision: { label: 'Needs Revision', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  }
  return map[status] ?? { label: status, className: 'bg-zinc-800 text-zinc-300 border-zinc-700' }
}

export function calculateOpportunityScore(o: {
  estimated_views: number | null
  affiliate_potential_score: number | null
  competition_score: number | null
  evergreen_score: number | null
  production_effort_score: number | null
}): number {
  const views = o.estimated_views ?? 0
  const affiliate = o.affiliate_potential_score ?? 0
  const competition = o.competition_score ?? 0
  const evergreen = o.evergreen_score ?? 0
  const effort = o.production_effort_score ?? 0

  // Normalise estimated_views to 0-100 (assume max 500K)
  const viewsScore = Math.min(100, (views / 500_000) * 100)

  return (
    viewsScore * 0.3 +
    affiliate * 0.3 +
    competition * 0.2 +
    evergreen * 0.15 +
    effort * 0.05
  )
}
