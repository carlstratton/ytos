'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { updatePackStatus, markAsPublished } from '@/lib/actions/production'
import type { ProductionPack, Opportunity } from '@/lib/types'
import { statusConfig } from '@/lib/utils'
import { ArrowLeft, Check, RefreshCw, Upload, Copy } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PackWithOpportunity extends ProductionPack {
  opportunities: Opportunity
}

interface Props {
  pack: PackWithOpportunity
}

export function ProductionPackClient({ pack: initial }: Props) {
  const [pack, setPack] = useState(initial)
  const [loading, setLoading] = useState<string | null>(null)
  const [published, setPublished] = useState(false)
  const router = useRouter()

  async function handleApprove() {
    setLoading('approve')
    await updatePackStatus(pack.id, 'approved')
    setPack(prev => ({ ...prev, status: 'approved' }))
    setLoading(null)
  }

  async function handleRevision() {
    setLoading('revision')
    await updatePackStatus(pack.id, 'needs_revision')
    setPack(prev => ({ ...prev, status: 'needs_revision' }))
    setLoading(null)
  }

  async function handlePublish() {
    setLoading('publish')
    await markAsPublished(pack.id, pack.opportunity_id)
    setPublished(true)
    setLoading(null)
    router.push('/experiments')
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
  }

  const opp = pack.opportunities
  const cfg = statusConfig(pack.status)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/opportunities/${pack.opportunity_id}`} className="text-zinc-400 hover:text-zinc-100">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-zinc-100">{opp?.title ?? 'Production Pack'}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={cfg.className}>{cfg.label}</Badge>
            <span className="text-xs text-zinc-500">Production Pack</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-2">
            {pack.status !== 'approved' && (
              <Button variant="success" onClick={handleApprove} loading={loading === 'approve'}>
                <Check className="h-4 w-4" /> Approve Pack
              </Button>
            )}
            {pack.status !== 'needs_revision' && (
              <Button variant="secondary" onClick={handleRevision} loading={loading === 'revision'}>
                <RefreshCw className="h-4 w-4" /> Request Revision
              </Button>
            )}
            {pack.status === 'approved' && (
              <Button onClick={handlePublish} loading={loading === 'publish'}>
                <Upload className="h-4 w-4" /> Mark as Published
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Title Options */}
      {pack.title_options && pack.title_options.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Title Options</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {pack.title_options.map((t, i) => (
              <div key={i} className="flex items-start gap-3 bg-zinc-800/40 rounded px-3 py-2 group">
                <span className="text-xs text-zinc-500 w-5 flex-shrink-0 mt-0.5">{i + 1}.</span>
                <p className="text-sm text-zinc-200 flex-1">{t}</p>
                <button onClick={() => copyToClipboard(t)} className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-zinc-100">
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Hook */}
      {pack.hook && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Hook (First 30s)</CardTitle>
              <button onClick={() => copyToClipboard(pack.hook!)} className="text-zinc-400 hover:text-zinc-100">
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap bg-zinc-800/30 rounded-md px-4 py-3 border-l-2 border-indigo-500">{pack.hook}</p>
          </CardContent>
        </Card>
      )}

      {/* Thumbnail Concepts */}
      {pack.thumbnail_concepts && pack.thumbnail_concepts.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Thumbnail Concepts</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {pack.thumbnail_concepts.map((t, i) => (
              <div key={i} className="flex items-start gap-3 bg-zinc-800/40 rounded px-3 py-2">
                <span className="text-xs text-indigo-400 w-5 flex-shrink-0 mt-0.5">{i + 1}.</span>
                <p className="text-sm text-zinc-300">{t}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Script */}
      {pack.script && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Full Script</CardTitle>
              <button onClick={() => copyToClipboard(pack.script!)} className="text-zinc-400 hover:text-zinc-100">
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap font-sans">{pack.script}</pre>
          </CardContent>
        </Card>
      )}

      {/* Voiceover Script */}
      {pack.voiceover_script && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Voiceover Script</CardTitle>
              <button onClick={() => copyToClipboard(pack.voiceover_script!)} className="text-zinc-400 hover:text-zinc-100">
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap font-sans">{pack.voiceover_script}</pre>
          </CardContent>
        </Card>
      )}

      {/* B-Roll List */}
      {pack.b_roll_list && pack.b_roll_list.length > 0 && (
        <Card>
          <CardHeader><CardTitle>B-Roll Shot List</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {pack.b_roll_list.map((shot, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                  <span className="text-zinc-500 flex-shrink-0 w-5">{i + 1}.</span>
                  {shot}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Image Prompts */}
      {pack.image_prompts && pack.image_prompts.length > 0 && (
        <Card>
          <CardHeader><CardTitle>AI Image Prompts</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {pack.image_prompts.map((prompt, i) => (
              <div key={i} className="flex items-start gap-3 bg-zinc-800/40 rounded px-3 py-2 group">
                <span className="text-xs text-zinc-500 w-5 flex-shrink-0 mt-0.5">{i + 1}.</span>
                <p className="text-xs text-zinc-400 flex-1 font-mono">{prompt}</p>
                <button onClick={() => copyToClipboard(prompt)} className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-zinc-100">
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Editing Notes */}
      {pack.editing_notes && (
        <Card>
          <CardHeader><CardTitle>Editing Notes</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{pack.editing_notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Description */}
      {pack.description && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>YouTube Description</CardTitle>
              <button onClick={() => copyToClipboard(pack.description!)} className="text-zinc-400 hover:text-zinc-100">
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap font-sans">{pack.description}</pre>
          </CardContent>
        </Card>
      )}

      {/* Tags */}
      {pack.tags && pack.tags.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Tags</CardTitle>
              <button onClick={() => copyToClipboard(pack.tags!.join(', '))} className="text-zinc-400 hover:text-zinc-100">
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {pack.tags.map((tag, i) => (
                <span key={i} className="bg-zinc-800 text-zinc-400 text-xs px-2 py-0.5 rounded border border-zinc-700">
                  {tag}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* CTA */}
      {pack.cta && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Call to Action</CardTitle>
              <button onClick={() => copyToClipboard(pack.cta!)} className="text-zinc-400 hover:text-zinc-100">
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap bg-zinc-800/30 rounded-md px-4 py-3 border-l-2 border-emerald-500">{pack.cta}</p>
          </CardContent>
        </Card>
      )}

      {/* Affiliate Notes */}
      {pack.affiliate_notes && (
        <Card>
          <CardHeader><CardTitle>Affiliate Placement Notes</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{pack.affiliate_notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
