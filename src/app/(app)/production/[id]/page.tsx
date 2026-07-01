import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ProductionPackClient } from './production-pack-client'

export default async function ProductionPackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: pack } = await supabase
    .from('production_packs')
    .select('*, opportunities(*)')
    .eq('id', id)
    .single()

  if (!pack) notFound()

  return (
    <div className="p-8 max-w-4xl">
      <ProductionPackClient pack={pack as any} />
    </div>
  )
}
