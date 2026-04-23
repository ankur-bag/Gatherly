"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function Footer() {
  return (
    <footer className="border-t border-black/5 bg-cream py-24 pb-32">
      <div className="section-container">
        <div className="flex flex-col items-center justify-between gap-16 md:flex-row">
          {/* Logo & Brand */}
          <div className="flex flex-col items-center md:items-start gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-charcoal text-white font-bold text-sm shadow-xl">
                A
              </div>
              <span 
                className="text-2xl font-medium tracking-tight text-charcoal" 
                style={{ fontFamily: "var(--font-display)" }}
              >
                Avento
              </span>
            </div>
            <p className="text-sm font-medium text-charcoal/30 max-w-[25ch] text-center md:text-left leading-relaxed">
              The event operating system for teams who value precision.
            </p>
          </div>
          
          {/* Main Navigation */}
          <nav className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {["Product", "Workflows", "Pricing", "Privacy", "Terms"].map((link) => (
              <a 
                key={link} 
                href="#" 
                className="text-[11px] font-bold text-charcoal/40 transition-all hover:text-orange uppercase tracking-[0.3em]"
              >
                {link}
              </a>
            ))}
          </nav>
          
          {/* Legal / Copyright */}
          <div className="flex flex-col items-center md:items-end gap-2">
            <p className="text-[11px] font-bold text-charcoal/20 uppercase tracking-[0.2em]">
              &copy; {new Date().getFullYear()} Avento Operations Inc.
            </p>
            <p className="text-[10px] font-medium text-charcoal/10">
              Built for high-stakes organizers.
            </p>
          </div>
        </div>

        {/* Massive Decorative Text */}
        <div className="mt-32 pointer-events-none select-none">
          <h2 className="text-[15vw] leading-none font-display text-charcoal/[0.02] text-center tracking-tighter">
            AVENTO
          </h2>
        </div>
      </div>
    </footer>
  );
}