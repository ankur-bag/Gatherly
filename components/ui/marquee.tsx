"use client";

import { cn } from "@/lib/utils";
import React from "react";
import { motion } from "framer-motion";

interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  children?: React.ReactNode;
  vertical?: boolean;
  repeat?: number;
  duration?: number;
}

export function Marquee({
  className,
  reverse,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  duration = 40,
  ...props
}: MarqueeProps) {
  const [isPaused, setIsPaused] = React.useState(false);

  return (
    <div
      {...props}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
      className={cn(
        "group flex overflow-hidden p-2 [--gap:1rem] gap-(--gap)",
        {
          "flex-row": !vertical,
          "flex-col": vertical,
        },
        className
      )}
    >
      {Array(repeat)
        .fill(0)
        .map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              [vertical ? "y" : "x"]: reverse ? [ "-100%", "0%"] : ["0%", "-100%"],
            }}
            transition={{
              duration: duration,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              animationPlayState: isPaused ? "paused" : "running",
            } as any}
            className={cn("flex shrink-0 gap-(--gap)", {
              "flex-row": !vertical,
              "flex-col": vertical,
            })}
          >
            {children}
          </motion.div>
        ))}
    </div>
  );
}
