'use client'

import { useEffect } from 'react'
import DashboardNav from './DashboardNav'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Sync user data with Mongoose on dashboard load
    fetch('/api/users/me', { method: 'POST' }).catch(console.error)
  }, [])

  return (
    <div className="min-h-screen bg-cream selection:bg-orange/20">
      <DashboardNav />
      <main className="w-full min-h-screen pt-20">
        <div className="mx-auto w-full max-w-6xl px-6 py-4 lg:px-12 lg:py-6">
          {children}
        </div>
      </main>
    </div>
  )
}
