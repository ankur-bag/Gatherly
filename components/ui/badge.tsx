import { cn } from "@/lib/utils";
import React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outline";
}

export function Badge({ 
  children, 
  className, 
  variant = "default", 
  ...props 
}: BadgeProps) {
  return (
    <div
      {...props}
      className={cn(
        "inline-flex items-center px-4 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors whitespace-nowrap",
        {
          "bg-charcoal text-white": variant === "default",
          "border border-black/10 bg-white/50 text-charcoal": variant === "outline",
        },
        className
      )}
    >
      {children}
    </div>
  );
}
