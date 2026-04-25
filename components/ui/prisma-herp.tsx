import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { FiCheckCircle, FiLayers, FiZap } from "react-icons/fi";
import { useRef } from "react";
import { SignUpButton } from "@clerk/nextjs";
import Link from "next/link";

/* ---------------- WordsPullUp ---------------- */
interface WordsPullUpProps {
  text: string;
  className?: string;
  showAsterisk?: boolean;
  style?: React.CSSProperties;
}

export const WordsPullUp = ({ text, className = "", showAsterisk = false, style }: WordsPullUpProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const words = text.split(" ");

  return (
    <div ref={ref} className={`inline-flex flex-wrap ${className}`} style={style}>
      {words.map((word, i) => {
        const isLast = i === words.length - 1;
        return (
          <motion.span
            key={i}
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="inline-block relative"
            style={{ marginRight: isLast ? 0 : "0.25em" }}
          >
            {word}
            {showAsterisk && isLast && (
              <span className="absolute top-[0.65em] -right-[0.3em] text-[0.31em]">*</span>
            )}
          </motion.span>
        );
      })}
    </div>
  );
};

/* ---------------- WordsPullUpMultiStyle ---------------- */
interface Segment {
  text: string;
  className?: string;
}

interface WordsPullUpMultiStyleProps {
  segments: Segment[];
  className?: string;
  style?: React.CSSProperties;
}

export const WordsPullUpMultiStyle = ({ segments, className = "", style }: WordsPullUpMultiStyleProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  const words: { word: string; className?: string }[] = [];
  segments.forEach((seg) => {
    seg.text.split(" ").forEach((w) => {
      if (w) words.push({ word: w, className: seg.className });
    });
  });

  return (
    <div ref={ref} className={`inline-flex flex-wrap justify-center ${className}`} style={style}>
      {words.map((w, i) => (
        <motion.span
          key={i}
          initial={{ y: 20, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          className={`inline-block ${w.className ?? ""}`}
          style={{ marginRight: "0.25em" }}
        >
          {w.word}
        </motion.span>
      ))}
    </div>
  );
};

/* ---------------- Hero ---------------- */
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

const PrismaHero = ({ isSignedIn = false }: { isSignedIn?: boolean }) => {
  const navItems = [
    { name: "Features", href: "#features" },
    ...(isSignedIn ? [{ name: "Dashboard", href: "/dashboard" }] : []),
  ];

  return (
    <section className="h-screen w-full">
      <div className="relative h-full w-full overflow-hidden">
        
        {/* Background video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4"
        />

        {/* Noise overlay */}
        <div className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.7] mix-blend-overlay" />

        {/* Gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />

        {/* Navbar */}
        <nav className="absolute left-1/2 top-0 z-20 -translate-x-1/2">
          <div className="flex items-center gap-3 rounded-b-2xl bg-black px-4 py-2 sm:gap-6 md:gap-12 md:rounded-b-3xl md:px-8 lg:gap-14">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-[10px] transition-colors sm:text-xs md:text-sm"
                style={{ color: "rgba(225, 224, 204, 0.8)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#E1E0CC")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(225, 224, 204, 0.8)")}
              >
                {item.name}
              </a>
            ))}
          </div>
        </nav>

        {/* Top-left description */}
        <div className="absolute top-20 left-4 sm:top-24 sm:left-8 md:left-10 max-w-[280px] sm:max-w-md md:max-w-lg z-20">
          <motion.p
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-[10px] text-white/90 sm:text-lg md:text-2xl leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Avento is a powerful event management platform where organizers create, manage, and scale events with precision. Bridge physical and digital experiences seamlessly with built-in Zoom integration and total control.
          </motion.p>
        </div>

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 sm:px-8 sm:pb-8 md:px-10 md:pb-10">
          <div className="grid grid-cols-12 items-end gap-4 lg:gap-8">
            
            <div className="col-span-12 lg:col-span-8">
              <h1
                className="font-medium leading-[0.8] tracking-[-0.07em] text-[24vw] sm:text-[22vw] md:text-[20vw] lg:text-[18vw]"
                style={{ color: "#E1E0CC" }}
              >
                <WordsPullUp text="Avento" showAsterisk />
              </h1>
            </div>

            <div className="col-span-12 flex flex-col gap-6 lg:col-span-4 lg:pb-10">

              {isSignedIn ? (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link href="/dashboard" className="group inline-flex items-center gap-3 self-start rounded-full bg-primary py-2 pl-5 pr-1.5 text-sm text-white transition-all hover:gap-4 sm:py-3 sm:pl-7 sm:pr-2 sm:text-lg md:text-3xl" style={{ fontFamily: "var(--font-display)" }}>
                    Launch Your First Event
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black transition-transform group-hover:scale-110 sm:h-12 sm:w-12">
                      <ArrowRight className="h-4 w-4 sm:h-6 sm:w-6 cursor-pointer" style={{ color: "#E1E0CC" }} />
                    </span>
                  </Link>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
                >
                  <SignUpButton mode="modal">
                    <button className="group inline-flex items-center gap-3 self-start rounded-full bg-primary py-2 pl-5 pr-1.5 text-sm text-white transition-all hover:gap-4 sm:py-3 sm:pl-7 sm:pr-2 sm:text-lg md:text-xl" style={{ fontFamily: "var(--font-display)" }}>
                      Launch Your First Event
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black transition-transform group-hover:scale-110 sm:h-12 sm:w-12">
                        <ArrowRight className="h-4 w-4 sm:h-6 sm:w-6 cursor-pointer" style={{ color: "#E1E0CC" }} />
                      </span>
                    </button>
                  </SignUpButton>
                </motion.div>
              )}

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="mt-2 flex flex-col gap-3 sm:gap-4 border-t border-white/10 pt-6"
              >
                {trustPoints.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-3 sm:gap-4">
                    <point.Icon className="mt-1 shrink-0 text-[#E1E0CC] size-4 sm:size-5" />
                    <div>
                      <h4 className="text-xs sm:text-base font-semibold text-[#E1E0CC]">{point.title}</h4>
                      <p className="text-[10px] sm:text-sm text-[#E1E0CC]/70">{point.description}</p>
                    </div>
                  </div>
                ))}
              </motion.div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export {PrismaHero}