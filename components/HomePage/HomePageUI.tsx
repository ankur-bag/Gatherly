'use client'

import { useAuth } from '@clerk/nextjs'
import { Cta } from './Cta'
import { Features } from './Features'
import { Footer } from './Footer'
import { Hero } from './Hero'
import { Nav } from './Nav'

export function HomePageUI() {
  const { isSignedIn } = useAuth()
  const signedIn = Boolean(isSignedIn)

  return (
    <main className="relative min-h-screen overflow-x-clip bg-[#001E2B] text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[-280px] h-[520px] bg-[radial-gradient(circle_at_top,_rgba(0,237,100,0.24),_transparent_60%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-[-260px] w-[380px] bg-[radial-gradient(circle_at_center,_rgba(0,237,100,0.14),_transparent_68%)]"
      />

      <Nav isSignedIn={signedIn} />
      <Hero isSignedIn={signedIn} />
      <Features />
      <Cta isSignedIn={signedIn} />
      <Footer />
    </main>
  )
}