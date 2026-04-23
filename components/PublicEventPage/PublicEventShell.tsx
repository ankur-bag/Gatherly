import Link from 'next/link'
import { FiArrowLeft } from 'react-icons/fi'

interface PublicEventShellProps {
  children: React.ReactNode
}

export function PublicEventShell({ children }: PublicEventShellProps) {
  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur-sm">
        <nav className="mx-auto w-full max-w-7xl px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-medium text-primary transition-colors hover:text-primary-dark"
          >
            <FiArrowLeft size={18} />
            Back to Home
          </Link>
        </nav>
      </header>
      {children}
    </main>
  )
}