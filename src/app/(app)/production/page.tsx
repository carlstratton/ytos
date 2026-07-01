import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { statusConfig, formatDate } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'

export default async function ProductionListPage() {
  const supabase = await createClient()

  const { data: channel } = await supabase
    .from('channels').select('id').order('created_at', { ascending: true }).limit(1).single()

  const { data: packs } = channel
    ? await supabase
        .from('production_packs')
        .select('*, opportunities!inner(channel_id, title, status)')
        .eq('opportunities.channel_id', channel.id)
        .order('created_at', { ascending: false })
    : { data: [] }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-100">Production</h1>
        <p className="text-sm text-zinc-400 mt-1">All generated production packs.</p>
      </div>

      {(!packs || packs.length === 0) ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-sm text-zinc-400">No production packs yet.</p>
            <p className="text-xs text-zinc-500 mt-1">Approve an opportunity and generate a pack from it.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {packs.map((pack: any) => (
            <Link key={pack.id} href={`/production/${pack.id}`}>
              <Card className="hover:border-zinc-700 hover:bg-zinc-800/40 transition-all cursor-pointer">
                <CardContent className="py-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-100 truncate">{pack.opportunities?.title ?? 'Untitled'}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{formatDate(pack.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge className={statusConfig(pack.status).className}>{statusConfig(pack.status).label}</Badge>
                    <ArrowRight className="h-4 w-4 text-zinc-600" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
