import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Vercel cron: runs daily at 06:00 UTC
// Schedule defined in vercel.json
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  try {
    // TODO: use generateReport() action when automatic triggering is wanted
    // For now this endpoint is a skeleton for cron-ready architecture
    return NextResponse.json({ success: true, message: 'Cron endpoint ready. Trigger report generation here.' })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
