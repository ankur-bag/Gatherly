"use client";

import { motion } from "framer-motion";
import { Marquee } from "@/components/ui/marquee";
import { Badge } from "@/components/ui/badge";
import { 
  FiCheckCircle, 
  FiHexagon, 
  FiTerminal, 
  FiZap 
} from "react-icons/fi";

const roadmapRoadblocks = [
  "Start with an Idea",
  "Define the Strategy",
  "Generate Instantly",
  "Refine with AI",
  "Design with Precision",
  "Optimize for Reach",
  "Publish Everywhere",
  "Distribute Seamlessly",
  "Engage at Scale",
  "Track What Works",
  "Analyze Deeply",
  "Iterate Faster",
  "Scale What Wins",
];

const highlights = [
  {
    title: "We make it simple",
    description:
      "No jargon, no overcomplication — just clear steps you can follow to manage your event registrations with confidence.",
    icon: FiHexagon,
  },
  {
    title: "Clinical Results",
    description:
      "Every workflow we build is designed to help you launch faster, track smarter, and eliminate operational noise.",
    icon: FiZap,
  },
  {
    title: "Zoom Sync",
    description:
      "Seamlessly link your events with Zoom. We handle meeting creation, attendee sync, and automated updates automatically.",
    icon: FiCheckCircle,
  },
  {
    title: "Full-Cycle Support",
    description:
      "From your first draft to the final checkout, we provide an operational command center that stays with you.",
    icon: FiTerminal,
  },
];

export default function VercepFeature1() {
  const m1 = roadmapRoadblocks.slice(0, 4);
  const m2 = roadmapRoadblocks.slice(4, 8);
  const m3 = roadmapRoadblocks.slice(8);

  return (
    <section id="features" className="relative bg-cream pt-20 lg:pt-48 overflow-hidden">
      <div className="mx-auto max-w-full">
        {/* Header Section */}
        <div className="section-container flex flex-col items-center text-center space-y-6 sm:space-y-8 mb-16 lg:mb-24">
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.4em] text-orange"
          >
            Capabilities
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl text-4xl sm:text-5xl lg:text-7xl"
          >
            Removing the roadblocks <br />
            <span className="text-sage italic">to your event's success.</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl text-lg sm:text-xl text-charcoal/40 font-medium leading-relaxed px-4"
          >
            It's easy to get lost in a sea of logistics, conflicting data, and endless approvals. 
            We filter out the noise and give you the clinical clarity required for perfection.
          </motion.p>

          {/* Marquee Section */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, delay: 0.4 }}
            className="relative w-full max-w-5xl py-8 lg:py-12"
          >
            {/* Edge Fades */}
            <div className="absolute left-0 top-0 z-10 h-full w-20 sm:w-40 bg-linear-to-r from-cream to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 z-10 h-full w-20 sm:w-40 bg-linear-to-l from-cream to-transparent pointer-events-none" />

            <div className="flex flex-col gap-3 sm:gap-4">
              <Marquee duration={50} pauseOnHover>
                {m1.map((item) => (
                  <Badge key={item} variant="outline" className="border-black/5 bg-white/40 px-4 sm:px-6 py-2 sm:py-3 rounded-none text-[10px] sm:text-xs">
                    {item}
                  </Badge>
                ))}
              </Marquee>

              <Marquee duration={60} reverse pauseOnHover>
                {m2.map((item) => (
                  <Badge key={item} variant="outline" className="border-black/5 bg-white/40 px-4 sm:px-6 py-2 sm:py-3 rounded-none text-[10px] sm:text-xs">
                    {item}
                  </Badge>
                ))}
              </Marquee>

              <Marquee duration={45} pauseOnHover>
                {m3.map((item) => (
                  <Badge key={item} variant="outline" className="border-black/5 bg-white/40 px-4 sm:px-6 py-2 sm:py-3 rounded-none text-[10px] sm:text-xs">
                    {item}
                  </Badge>
                ))}
              </Marquee>
            </div>
          </motion.div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 divide-y divide-black/5 divide-dashed border-t border-black/5 border-dashed sm:grid-cols-2 sm:divide-y-0 sm:divide-x lg:grid-cols-4 bg-white/20">
          {highlights.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 * idx, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col p-8 sm:p-10 lg:p-14 group"
            >
              <div className="mb-8 lg:mb-12 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-orange/5 text-orange transition-all duration-500 group-hover:bg-orange group-hover:text-white">
                <item.icon className="size-6 sm:size-7" />
              </div>

              <div className="mt-auto space-y-3 sm:space-y-4">
                <h3 className="font-display font-medium text-2xl sm:text-3xl tracking-tight text-charcoal">
                  {item.title}
                </h3>
                <p className="text-sm sm:text-base text-charcoal/40 font-medium leading-relaxed">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
