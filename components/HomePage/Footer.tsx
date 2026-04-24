"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { WordsPullUp } from "../ui/prisma-herp";

export function Footer() {
  return (
    <footer className="bg-black py-24 pb-32 text-white">
      <div className="section-container">
        <div className="flex flex-col items-center justify-between gap-16 md:flex-row">
          {/* Logo & Brand */}
          <div className="flex flex-col items-center md:items-start gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center">
                <Image src="/avento.svg" alt="Avento Logo" width={44} height={44} className="object-contain" />
              </div>
              <span 
                className="text-3xl  text-white" 
                style={{ fontFamily: "var(--font-display)" }}
              >
                Avento
              </span>
            </div>
            <p className="text-sm font-medium text-white/60 max-w-[25ch] text-center md:text-left leading-relaxed">
              The event operating system for teams who value precision.
            </p>
          </div>
          
          {/* Main Navigation - Removed as per user request */}
          <nav className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          </nav>
          
          {/* Legal / Copyright */}
          <div className="flex flex-col items-center md:items-end gap-2">
            <p className="text-[11px] font-bold text-white/60 uppercase tracking-[0.2em]">
              &copy; {new Date().getFullYear()} Avento Operations Inc.
            </p>
            <p className="text-[10px] font-medium text-white/60">
              Built for high-stakes organizers.
            </p>
          </div>
        </div>

        {/* Massive Decorative Text */}
        <div className="mt-32 pointer-events-none select-none flex justify-center overflow-hidden">
          <h2 className="text-[20vw] leading-none font-display text-[#E1E0CC] text-center tracking-tighter">
            <WordsPullUp text="Avento" showAsterisk />
          </h2>
        </div>
      </div>
    </footer>
  );
}