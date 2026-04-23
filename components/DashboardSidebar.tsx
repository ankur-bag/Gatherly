'use client'

import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FiHome, FiSettings, FiGrid } from 'react-icons/fi'

const navItems = [
  { href: '/dashboard', label: 'Overview', Icon: FiGrid },
  { href: '/dashboard/settings', label: 'Settings', Icon: FiSettings },
]

export default function DashboardSidebar() {
  const pathname = usePathname()

  function isActive(path: string) {
    if (path === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(path)
  }

  return (
    <aside className="fixed left-6 top-6 bottom-6 z-40 hidden w-64 flex-col glass rounded-3xl p-4 shadow-framer lg:flex">
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-6 border-b border-black/5 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-charcoal shadow-lg">
          <span className="text-base font-bold text-white">A</span>
        </div>
        <div className="flex flex-col">
          <p className="text-lg font-medium text-charcoal leading-none" style={{ fontFamily: 'var(--font-display)' }}>
            Avento
          </p>
          <span className="text-[10px] uppercase font-bold tracking-widest text-black/30 mt-1">Operator</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-2">
        {navItems.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
              isActive(href)
                ? 'bg-charcoal text-white shadow-lg shadow-black/10'
                : 'text-charcoal/50 hover:bg-black/5 hover:text-charcoal'
            }`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="mt-auto pt-6 border-t border-black/5 flex flex-col gap-2">
        <Link 
          href="/" 
          className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-charcoal/50 hover:bg-black/5 hover:text-charcoal transition-all"
        >
          <FiHome size={18} />
          Go to Site
        </Link>
        
        <div className="flex items-center justify-between px-4 py-2 bg-black/5 rounded-2xl">
          <div className="flex items-center gap-3">
             <UserButton />
             <span className="text-xs font-bold text-charcoal/60">Account</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
