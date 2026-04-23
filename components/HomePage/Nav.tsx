import { SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import Link from 'next/link'

interface NavProps {
  isSignedIn: boolean
}

const navLinkClass =
  'text-sm font-medium text-[#B8C4CE] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ED64] focus-visible:ring-offset-2 focus-visible:ring-offset-[#001E2B]'

export function Nav({ isSignedIn }: NavProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-[#1F3B4D] bg-[#001E2B]/92 backdrop-blur-md">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-10">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#00ED64]" />
            <span className="font-display text-xl font-semibold tracking-tight text-white">Avento.ai</span>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            <a href="#features" className={navLinkClass}>
              Features
            </a>
            <a href="#why-goavo" className={navLinkClass}>
              Why GoAvo
            </a>
            <a href="#pricing" className={navLinkClass}>
              Plans
            </a>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <>
              <Link
                href="/dashboard"
                className="inline-flex h-10 items-center rounded-lg border border-[#1F3B4D] bg-[#112733] px-4 text-sm font-semibold text-white transition-colors hover:border-[#00ED64] hover:bg-[#183343]"
              >
                Dashboard
              </Link>
              <UserButton />
            </>
          ) : (
            <>
              <SignInButton>
                <button className="inline-flex h-10 items-center rounded-lg border border-[#1F3B4D] bg-transparent px-4 text-sm font-semibold text-white transition-colors hover:border-[#00ED64] hover:bg-[#112733]">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton>
                <button className="inline-flex h-10 items-center rounded-lg bg-[#00ED64] px-4 text-sm font-semibold text-[#001E2B] transition-colors hover:bg-[#00C853]">
                  Start Free
                </button>
              </SignUpButton>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}