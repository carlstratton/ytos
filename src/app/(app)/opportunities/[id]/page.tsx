import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { OpportunityDetail } from './opportunity-detail'

export default async function OpportunityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: opp } = await supabase
    .from('opportunities').select('*').eq('id', id).single()

  if (!opp) notFound()

  const { data: pack } = await supabase
    .from('production_packs').select('id, status').eq('opportunity_id', id).order('created_at', { ascending: false }).limit(1).single()

  return (
    <div className="p-8 max-w-3xl">
      <OpportunityDetail opportunity={opp} productionPack={pack ?? null} />
    </div>
  )
}
