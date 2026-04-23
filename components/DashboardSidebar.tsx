'use client'

import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FiCalendar, FiSettings } from 'react-icons/fi'

export default function DashboardSidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <aside className="fixed left-0 top-0 w-64 h-screen bg-white border-r border-neutral-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-neutral-100">
        <h1 className="text-2xl font-semibold text-foreground">Avento.ai</h1>
        <p className="text-sm text-neutral-500 mt-1">Event Management Platform</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6 space-y-2">
        <Link
          href="/dashboard"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isActive('/dashboard')
              ? 'bg-primary bg-opacity-10 text-primary font-medium'
              : 'text-neutral-700 hover:bg-neutral-50'
          }`}
        >
          <FiCalendar size={20} />
          <span>Events</span>
        </Link>

        <Link
          href="/dashboard/settings"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            isActive('/dashboard/settings')
              ? 'bg-primary bg-opacity-10 text-primary font-medium'
              : 'text-neutral-700 hover:bg-neutral-50'
          }`}
        >
          <FiSettings size={20} />
          <span>Settings</span>
        </Link>
      </nav>

      {/* User Profile */}
      <div className="p-6 border-t border-neutral-100 space-y-4">
        <div className="flex items-center justify-center">
          <UserButton />
        </div>
      </div>
    </aside>
  )
}
