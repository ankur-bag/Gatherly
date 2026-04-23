import DashboardSidebar from './DashboardSidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream">
      <DashboardSidebar />
      <main className="lg:pl-[300px] min-h-screen">
        <div className="mx-auto w-full max-w-6xl px-6 py-12 lg:px-12 lg:py-16">
          {children}
        </div>
      </main>
      
      {/* Mobile Nav Placeholder or Floating Menu can go here if needed */}
    </div>
  )
}
