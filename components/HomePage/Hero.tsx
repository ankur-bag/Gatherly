"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";
import { FiArrowRight, FiCheckCircle, FiLayers, FiZap } from "react-icons/fi";
import { motion } from "framer-motion";

interface HeroProps {
  isSignedIn: boolean;
}

const trustPoints = [
  {
    title: "Approval Queue",
    description: "Manual verification workflows for total control.",
    Icon: FiCheckCircle,
  },
  {
    title: "Live Tracking",
    description: "Monitor seat inventory and attendee check-ins.",
    Icon: FiLayers,
  },
  {
    title: "Hybrid Sync",
    description: "Bridge physical and digital experiences seamlessly.",
    Icon: FiZap,
  },
];

export function Hero({ isSignedIn }: HeroProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-32 pb-24 overflow-hidden">
      <div className="section-container relative z-10">
        <div className="flex flex-col items-center text-center max-w-5xl mx-auto mb-24">
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/50 px-5 py-2 backdrop-blur-sm mb-12 shadow-sm"
          >
            <span className="flex h-2 w-2 rounded-full bg-orange animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-charcoal/60">
              The Event Operating System
            </span>
          </motion.div>

          {/* Massive Heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="mb-10"
          >
            Run every event <br />
            <span className="text-orange italic lg:text-[8.5rem] tracking-tight">Flawlessly.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-xl sm:text-2xl text-charcoal/50 leading-relaxed max-w-[45ch] text-balance mb-14 "
          >
            A high-fidelity command center for organizers who can't afford chaos. 
            The silent partner in high-stakes event operations.
          </motion.p>

          {/* CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center gap-6"
          >
            {isSignedIn ? (
              <Link
                href="/dashboard"
                className="h-16 px-12 rounded-2xl bg-charcoal text-white font-bold inline-flex items-center gap-3 transition-all hover:bg-orange hover:shadow-[0_20px_50px_rgba(255,127,17,0.3)] hover:-translate-y-1 active:scale-95"
              >
                ENTER COMMAND CENTER
                <FiArrowRight size={22} />
              </Link>
            ) : (
              <>
                <SignUpButton mode="modal">
                  <button className="h-16 px-12 rounded-2xl bg-charcoal text-white font-bold inline-flex items-center gap-3 transition-all hover:bg-orange hover:shadow-[0_20px_50px_rgba(255,127,17,0.3)] hover:-translate-y-1 active:scale-95 cursor-pointer">
                    START OPERATING
                    <FiArrowRight size={22} />
                  </button>
                </SignUpButton>
                <SignInButton mode="modal">
                  <button className="h-16 px-12 rounded-2xl glass font-bold text-charcoal hover:bg-black/5 hover:border-black/10 transition-all active:scale-95 cursor-pointer">
                    SIGN IN
                  </button>
                </SignInButton>
              </>
            )}
          </motion.div>
        </div>

        {/* Feature Cards / Bento Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {trustPoints.map(({ title, description, Icon }, index) => (
            <motion.div 
              key={title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="bento-card group"
            >
              <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange/5 text-orange transition-all duration-500 group-hover:bg-orange group-hover:text-white group-hover:scale-110">
                <Icon size={28} />
              </div>
              <h3 className="mb-4">
                {title}
              </h3>
              <p className="text-base text-charcoal/40 leading-relaxed font-medium">
                {description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Background Gradient & Effects */}
      <div className="absolute top-0 left-1/2 -track-x-1/2 w-full h-full -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-[60vw] h-[60vw] bg-orange/[0.03] rounded-full blur-[150px]" />
        <div className="absolute top-[20%] right-[0%] w-[50vw] h-[50vw] bg-sage/[0.05] rounded-full blur-[130px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[40vw] h-[40vw] bg-orange/[0.02] rounded-full blur-[120px]" />
      </div>
    </section>
  );
}
