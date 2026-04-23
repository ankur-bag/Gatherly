import { SignInButton, SignUpButton } from '@clerk/nextjs'
import Link from 'next/link'
import { FiArrowRight, FiCalendar, FiShield, FiUsers } from 'react-icons/fi'

interface HeroProps {
  isSignedIn: boolean
}

const trustPoints = [
  {
    title: 'Approval-first workflows',
    description: 'Review attendee requests before issuing confirmations.',
    Icon: FiShield,
  },
  {
    title: 'Organizer-grade visibility',
    description: 'Track seats, statuses, and communication in one stream.',
    Icon: FiUsers,
  },
  {
    title: 'Online + in-person ready',
    description: 'Run hybrid events with predictable operational control.',
    Icon: FiCalendar,
  },
]

export function Hero({ isSignedIn }: HeroProps) {
  return (
    <section className="relative mx-auto grid w-full max-w-7xl gap-10 px-4 pb-18 pt-14 sm:px-6 md:pb-24 md:pt-18 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12 lg:px-8 lg:pt-24">
      <div className="space-y-8">
        <p className="inline-flex items-center rounded-full border border-[#1F3B4D] bg-[#112733] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#B8C4CE]">
          Premium event operations
        </p>

        <div className="space-y-5">
          <h1 className="max-w-[20ch] font-display text-[clamp(2.15rem,5.6vw,4.75rem)] font-bold leading-[1.04] tracking-[-0.02em] text-white">
            Run every event with Mongo-style speed and control.
          </h1>
          <p className="max-w-[65ch] text-base leading-relaxed text-[#B8C4CE] sm:text-lg">
            GoAvo gives teams a high-trust command center for registration approvals, attendee flow, and hybrid-event
            coordination, with a polished public experience from first click to final confirmation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isSignedIn ? (
            <Link
              href="/dashboard"
              className="inline-flex h-12 items-center gap-2 rounded-lg bg-[#00ED64] px-6 text-sm font-bold uppercase tracking-[0.05em] text-[#001E2B] transition-colors hover:bg-[#00C853]"
            >
              Open Dashboard
              <FiArrowRight size={17} />
            </Link>
          ) : (
            <>
              <SignUpButton>
                <button className="inline-flex h-12 items-center gap-2 rounded-lg bg-[#00ED64] px-6 text-sm font-bold uppercase tracking-[0.05em] text-[#001E2B] transition-colors hover:bg-[#00C853]">
                  Launch Free
                  <FiArrowRight size={17} />
                </button>
              </SignUpButton>
              <SignInButton>
                <button className="inline-flex h-12 items-center rounded-lg border border-[#1F3B4D] bg-[#112733] px-6 text-sm font-semibold text-white transition-colors hover:border-[#00ED64] hover:bg-[#183343]">
                  Sign In
                </button>
              </SignInButton>
            </>
          )}
        </div>
      </div>

      <aside className="rounded-2xl border border-[#1F3B4D] bg-[#112733] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.33)] sm:p-7">
        <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-[#B8C4CE]">Why teams switch to GoAvo</h2>
        <div className="mt-5 space-y-4">
          {trustPoints.map(({ title, description, Icon }) => (
            <article key={title} className="rounded-xl border border-[#1F3B4D] bg-[#0D2431] p-4">
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#00ED64]/15 text-[#00ED64]">
                <Icon size={18} />
              </div>
              <h3 className="text-base font-semibold text-white">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-[#B8C4CE]">{description}</p>
            </article>
          ))}
        </div>
      </aside>
    </section>
  )
}