"use client";

import CTAWithVerticalMarquee from "@/components/ui/cta-with-text-marquee";

interface CtaProps {
  isSignedIn: boolean;
}

export function Cta({ isSignedIn }: CtaProps) {
  if (isSignedIn) return null;

  return (
    <section id="cta">
      <CTAWithVerticalMarquee />
    </section>
  );
}
