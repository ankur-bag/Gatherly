import Link from 'next/link'
import Image from 'next/image'
import { FiArrowLeft } from 'react-icons/fi'

interface PublicEventShellProps {
  children: React.ReactNode
}

export function PublicEventShell({ children }: PublicEventShellProps) {
  return (
    <main className="min-h-screen bg-cream">
      {/* Public Nav - Minimal version of floating nav */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-100 w-[95%] max-w-5xl glass rounded-pill px-6 py-3 shadow-framer">
        <nav className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-charcoal/40 transition-colors hover:text-charcoal group"
          >
            <FiArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
            Home
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center">
              <Image src="/gatherly.svg" alt="Gatherly Logo" width={28} height={28} className="object-contain" />
            </div>
            <span className="text-lg font-medium tracking-tight text-charcoal" style={{ fontFamily: 'var(--font-display)' }}>
              Gatherly
            </span>
          </div>
        </nav>
      </div>
      
      {/* Background Decor */}
      <div className="fixed inset-0 -z-10 bg-cream">
         <div className="absolute top-0 left-0 w-full h-96 bg-linear-to-b from-orange/5 to-transparent" />
      </div>

      <div className="pt-24 pb-20">
        {children}
      </div>
    </main>
  )
}
