"use client";

import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { FiMenu, FiX } from "react-icons/fi";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { cn } from "@/lib/utils";

interface NavProps {
  isSignedIn: boolean;
}

export function Nav({ isSignedIn }: NavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const { scrollY } = useScroll();
  const lastScrollY = useRef(0);

  /**
   * Smooth scroll logic - Hide on hero
   */
  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 80);
    setIsVisible(latest > (typeof window !== "undefined" ? window.innerHeight * 0.8 : 800));
  });

  const navLinks: any[] = [];

  return (
    <>
      <motion.header
        initial={false}
        animate={{ 
          y: isVisible ? 0 : -100,
          opacity: isVisible ? 1 : 0
        }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 inset-x-0 z-[100] pointer-events-none"
      >
        <div className="mx-auto max-w-4xl px-6 py-8 transition-all duration-500">
          <motion.div 
            animate={{
              backgroundColor: scrolled ? "rgba(255, 255, 255, 0.7)" : "rgba(255, 255, 255, 0)",
              backdropFilter: scrolled ? "blur(16px)" : "blur(0px)",
              borderColor: scrolled ? "rgba(18, 18, 17, 0.05)" : "rgba(18, 18, 17, 0)",
              paddingLeft: scrolled ? "32px" : "0px",
              paddingRight: scrolled ? "32px" : "0px",
              boxShadow: scrolled ? "0 10px 30px rgba(0,0,0,0.05)" : "0 0 0 rgba(0,0,0,0)",
              scale: scrolled ? 0.98 : 1,
            }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex items-center justify-between rounded-full border py-5 pointer-events-auto"
          >
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-3 transition-all hover:opacity-70 active:scale-95"
            >
              <div className="flex h-9 w-9 items-center justify-center">
                <Image 
                  src="/avento.svg" 
                  alt="Avento Logo" 
                  width={36} 
                  height={36}
                  className="object-contain drop-shadow-sm"
                />
              </div>
              <span
                className="text-3xl tracking-tight text-charcoal"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Avento
              </span>
            </Link>

            {/* Navigation Links (Framer-style Fade) */}
            <nav className="hidden md:flex items-center gap-2">
              <AnimatePresence>
                {scrolled && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex items-center gap-1"
                  >
                    {navLinks.map((link) => (
                      <a
                        key={link.name}
                        href={link.href}
                        className="px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-charcoal/40 transition-all hover:text-charcoal hover:bg-black/5 rounded-full"
                      >
                        {link.name}
                      </a>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {isSignedIn ? (
                <div className="flex items-center gap-6">
                  <Link
                    href="/dashboard"
                    className="hidden sm:block text-[11px] font-bold uppercase tracking-[0.2em] text-charcoal hover:text-orange transition-colors"
                  >
                    Dashboard
                  </Link>
                  <UserButton />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <SignInButton mode="modal">
                    <button className="text-[11px] font-bold uppercase tracking-[0.2em] text-charcoal hover:text-orange transition-colors px-4 py-2 cursor-pointer transition-all active:scale-95">
                      Signin
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="h-10 px-6 rounded-full bg-charcoal text-white text-[10px] font-bold uppercase tracking-[0.2em] transition-all hover:bg-orange hover:shadow-lg active:scale-95 cursor-pointer">
                      Get Started
                    </button>
                  </SignUpButton>
                </div>
              )}
              
              {/* Mobile Toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 text-charcoal md:hidden rounded-full hover:bg-black/5 transition-colors active:scale-95"
              >
                {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
              </button>
            </div>
          </motion.div>
        </div>
      </motion.header>

      {/* Mobile Menu (Same as before but with better overlay) */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-cream/80 backdrop-blur-sm z-[110]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="fixed inset-x-4 top-24 z-[120] md:hidden"
            >
              <div className="rounded-[2rem] bg-white p-8 shadow-[0_40px_80px_rgba(0,0,0,0.15)] flex flex-col gap-6 border border-black/5">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-2xl font-medium text-charcoal hover:text-orange transition-colors"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {link.name}
                  </a>
                ))}
                <div className="h-px bg-black/5" />
                <div className="flex flex-col gap-4">
                  {isSignedIn ? (
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="h-16 w-full bg-charcoal rounded-2xl flex items-center justify-center text-white font-bold text-sm uppercase tracking-widest"
                    >
                      Dashboard
                    </Link>
                  ) : (
                    <>
                      <SignUpButton mode="modal">
                        <button className="h-16 w-full bg-orange rounded-2xl flex items-center justify-center text-white font-bold text-sm uppercase tracking-widest">
                          Get Started
                        </button>
                      </SignUpButton>
                      <SignInButton mode="modal">
                        <button className="h-16 w-full border border-black/10 rounded-2xl flex items-center justify-center text-charcoal font-bold text-sm uppercase tracking-widest">
                          Log in
                        </button>
                      </SignInButton>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}