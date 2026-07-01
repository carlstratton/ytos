'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Settings,
  Users,
  FileText,
  Lightbulb,
  Clapperboard,
  FlaskConical,
  BookOpen,
  ChevronRight,
  Tv2,
  LogOut,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/channel', label: 'Channel', icon: Tv2 },
  { href: '/competitors', label: 'Competitors', icon: Users },
  { href: '/daily-report', label: 'Daily Report', icon: FileText },
  { href: '/opportunities', label: 'Opportunities', icon: Lightbulb },
  { href: '/production', label: 'Production', icon: Clapperboard },
  { href: '/experiments', label: 'Experiments', icon: FlaskConical },
  { href: '/learnings', label: 'Learnings', icon: BookOpen },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-zinc-950 border-r border-zinc-800 flex flex-col z-10">
      <div className="px-4 py-5 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">M</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-zinc-100 truncate">Media OS</p>
            <p className="text-xs text-zinc-500 truncate">Command Centre</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-2 py-3 overflow-y-auto">
        <ul className="space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors group',
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-600/20'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
                  )}
                >
                  <Icon className={cn('h-4 w-4 flex-shrink-0', isActive ? 'text-indigo-400' : 'text-zinc-500 group-hover:text-zinc-300')} />
                  <span className="truncate">{label}</span>
                  {isActive && <ChevronRight className="h-3 w-3 ml-auto text-indigo-400 flex-shrink-0" />}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="px-2 py-3 border-t border-zinc-800">
        <Link
          href="/channel"
          className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition-colors"
        >
          <Settings className="h-4 w-4 text-zinc-500" />
          <span>Settings</span>
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition-colors"
        >
          <LogOut className="h-4 w-4 text-zinc-500" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  )
}
