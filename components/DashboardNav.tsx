"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiHome, FiSettings, FiGrid, FiPlus } from "react-icons/fi";
import { motion } from "framer-motion";

const navItems = [
  { href: "/", label: "Home", Icon: FiHome },
  { href: "/dashboard", label: "Dashboard", Icon: FiGrid },
  { href: "/dashboard/settings", label: "Settings", Icon: FiSettings },
];

export default function DashboardNav() {
  const pathname = usePathname();

  function isActive(path: string) {
    if (path === "/") return pathname === "/";
    if (path === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(path);
  }

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
      <div className="glass bg-beige/60 backdrop-blur-3xl border border-white/50 rounded-pill px-2 py-2 shadow-framer flex items-center gap-2">

        {/* Navigation Items */}
        <div className="flex items-center gap-1 bg-charcoal/5 rounded-full p-1">
          {navItems.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className={`relative flex items-center gap-2 rounded-full px-5 py-2.5 text-[11px] font-bold tracking-widest uppercase transition-all ${
                isActive(href)
                  ? "text-white bg-charcoal shadow-md"
                  : "text-charcoal/40 hover:text-charcoal hover:bg-white/50"
              }`}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </div>

        <div className="h-6 w-px bg-charcoal/10 mx-1" />

        {/* Action Button */}
        <Link
          href="/dashboard/events/template-selector"
          className="flex h-11 w-11 sm:w-auto sm:px-6 items-center justify-center gap-2 rounded-full bg-orange text-white hover:bg-orange-hover transition-all duration-300 shadow-lg shadow-orange/20 hover:-translate-y-0.5 active:scale-95 group"
        >
          <FiPlus size={20} className="transition-transform group-hover:rotate-90" />
          <span className="hidden sm:inline text-[11px] font-bold uppercase tracking-widest">Create</span>
        </Link>

        <div className="h-6 w-px bg-charcoal/10 mx-1" />

        {/* Account */}
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/80 shadow-sm border border-white/60 overflow-hidden hover:border-orange/20 transition-colors">
          <UserButton appearance={{ elements: { userButtonAvatarBox: "w-9 h-9" } }} />
        </div>
      </div>
    </nav>
  );
}
