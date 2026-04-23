import { SignUpButton } from '@clerk/nextjs'
import Link from 'next/link'
import { FiArrowRight } from 'react-icons/fi'

interface CtaProps {
  isSignedIn: boolean
}

export function Cta({ isSignedIn }: CtaProps) {
  return (
    <section id="why-goavo" className="mx-auto w-full max-w-7xl px-4 pb-16 pt-10 sm:px-6 md:pb-24 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl border border-[#1F3B4D] bg-[linear-gradient(135deg,_#00ED64,_#00684A)] p-7 sm:p-9 md:p-12">
        <div
          aria-hidden
          className="absolute right-[-90px] top-[-70px] h-52 w-52 rounded-full bg-white/20 blur-3xl"
        />

        <div className="relative max-w-3xl">
          <p id="pricing" className="text-xs font-bold uppercase tracking-[0.11em] text-[#003A27]">
            Premium launch path
          </p>
          <h2 className="mt-2 font-display text-[clamp(1.75rem,3.7vw,3.2rem)] font-bold leading-[1.07] text-[#001E2B]">
            Deploy your next event in minutes, not weeks.
          </h2>
          <p className="mt-3 max-w-[65ch] text-base leading-relaxed text-[#053825] sm:text-lg">
            Build branded public pages, review registrations intelligently, and keep your team aligned from first RSVP
            to event closeout.
          </p>

          <div className="mt-7">
            {isSignedIn ? (
              <Link
                href="/dashboard"
                className="inline-flex h-12 items-center gap-2 rounded-lg bg-[#001E2B] px-6 text-sm font-bold uppercase tracking-[0.05em] text-white transition-colors hover:bg-[#0B3244]"
              >
                Go to Dashboard
                <FiArrowRight size={17} />
              </Link>
            ) : (
              <SignUpButton>
                <button className="inline-flex h-12 items-center gap-2 rounded-lg bg-[#001E2B] px-6 text-sm font-bold uppercase tracking-[0.05em] text-white transition-colors hover:bg-[#0B3244]">
                  Start Free
                  <FiArrowRight size={17} />
                </button>
              </SignUpButton>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}