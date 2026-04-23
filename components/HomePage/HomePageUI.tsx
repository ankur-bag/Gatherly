"use client";

import { useAuth } from "@clerk/nextjs";
import { Cta } from "./Cta";
import VercepFeature1 from "../ui/vercep-feature-1";
import { Footer } from "./Footer";
import { Hero } from "./Hero";
import { Nav } from "./Nav";

export function HomePageUI() {
  const { isSignedIn } = useAuth();
  const signedIn = Boolean(isSignedIn);

  return (
    <div className="relative w-full bg-cream">
      <Nav isSignedIn={signedIn} />
      <main className="w-full">
        <Hero isSignedIn={signedIn} />
        <VercepFeature1 />

        <Cta isSignedIn={signedIn} />
      </main>
      <Footer />
    </div>
  );
}
