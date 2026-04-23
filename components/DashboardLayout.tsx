import DashboardNav from './DashboardNav'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream selection:bg-orange/20">
      <DashboardNav />
      <main className="w-full min-h-screen pt-28">
        <div className="mx-auto w-full max-w-6xl px-6 py-12 lg:px-12 lg:py-16">
          {children}
        </div>
      </main>
    </div>
  )
}
