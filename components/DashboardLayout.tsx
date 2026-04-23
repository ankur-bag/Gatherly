'use client'

import { ClerkProvider } from '@clerk/nextjs'
import DashboardSidebar from '@/components/DashboardSidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <div className="flex h-screen">
        <DashboardSidebar />
        <main className="flex-1 ml-64 overflow-auto">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </ClerkProvider>
  )
}
