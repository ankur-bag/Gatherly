"use client";

import { cn } from "@/lib/utils";
import { ReactNode, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import { SignUpButton } from "@clerk/nextjs";

interface VerticalMarqueeProps {
  children: ReactNode;
  pauseOnHover?: boolean;
  reverse?: boolean;
  className?: string;
  speed?: number;
}

function VerticalMarquee({
  children,
  pauseOnHover = false,
  reverse = false,
  className,
  speed = 30,
}: VerticalMarqueeProps) {
  return (
    <div
      className={cn(
        "group flex flex-col overflow-hidden",
        className
      )}
      style={
        {
          "--duration": `${speed}s`,
          "--gap": "2rem",
        } as React.CSSProperties
      }
    >
      <div
        className={cn(
          "flex shrink-0 flex-col gap-8 animate-marquee-vertical",
          reverse && "[animation-direction:reverse]",
          pauseOnHover && "group-hover:[animation-play-state:paused]"
        )}
      >
        {children}
      </div>
      <div
        className={cn(
          "flex shrink-0 flex-col gap-8 animate-marquee-vertical",
          reverse && "[animation-direction:reverse]",
          pauseOnHover && "group-hover:[animation-play-state:paused]"
        )}
        aria-hidden="true"
      >
        {children}
      </div>
    </div>
  );
}

const marqueeItems = [
  "Run Effortlessly",
  "Ship Flawlessly",
  "Scale Automatically",
  "Manage Precisely",
  "Operate Silently",
];

export default function CTAWithVerticalMarquee() {
  const marqueeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const marqueeContainer = marqueeRef.current;
    if (!marqueeContainer) return;

    const updateOpacity = () => {
      const items = marqueeContainer.querySelectorAll('.marquee-item');
      const containerRect = marqueeContainer.getBoundingClientRect();
      const centerY = containerRect.top + containerRect.height / 2;

      items.forEach((item) => {
        const itemRect = item.getBoundingClientRect();
        const itemCenterY = itemRect.top + itemRect.height / 2;
        const distance = Math.abs(centerY - itemCenterY);
        const maxDistance = containerRect.height / 2;
        const normalizedDistance = Math.min(distance / maxDistance, 1);
        const opacity = 1 - normalizedDistance * 0.85;
        (item as HTMLElement).style.opacity = opacity.toString();
        // Subtle scale effect
        const scale = 1 - normalizedDistance * 0.15;
        (item as HTMLElement).style.transform = `scale(${scale})`;
      });
    };

    const animationFrame = () => {
      updateOpacity();
      requestAnimationFrame(animationFrame);
    };

    const frame = requestAnimationFrame(animationFrame);

    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="bg-cream py-24 lg:py-48 overflow-hidden">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          {/* Left Content */}
          <div className="flex flex-col items-start text-left max-w-xl">
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="mb-8 text-[11px] font-bold uppercase tracking-[0.4em] text-orange"
            >
              Get Started
            </motion.p>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-charcoal mb-10 text-6xl md:text-7xl lg:text-8xl"
            >
              Ready to ship <br />
              <span className="text-orange italic">your next big event?</span>
            </motion.h2>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-xl text-charcoal/40 leading-relaxed font-medium mb-16 max-w-[40ch]"
            >
              The silent partner in high-stakes event operations. Start managing
              registrations and guest flow with clinical precision today.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row gap-6 w-full"
            >
              <SignUpButton mode="modal">
                <button className="h-16 px-10 rounded-2xl bg-charcoal text-white font-bold inline-flex items-center gap-3 transition-all hover:bg-orange hover:shadow-[0_20px_50px_rgba(255,127,17,0.3)] hover:-translate-y-1 active:scale-95 cursor-pointer">
                  START OPERATING
                  <FiArrowRight size={22} />
                </button>
              </SignUpButton>
            </motion.div>
          </div>

          {/* Right Marquee */}
          <div ref={marqueeRef} className="relative h-[500px] lg:h-[700px] flex items-center justify-center">
            <div className="relative w-full h-full overflow-hidden">
              <VerticalMarquee speed={25} className="h-full">
                {marqueeItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display text-charcoal tracking-tight py-4 marquee-item transition-all duration-300 transform-gpu"
                  >
                    {item}
                  </div>
                ))}
              </VerticalMarquee>
              
              {/* Vignettes for vertical fade */}
              <div className="pointer-events-none absolute top-0 left-0 right-0 h-40 bg-linear-to-b from-cream to-transparent z-10" />
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 bg-linear-to-t from-cream to-transparent z-10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
