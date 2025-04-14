"use client";

import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { NavBar } from "@/components/landing/nav-bar";
import { useAuth } from "@/lib/auth-context";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <NavBar />
      <main className="flex-1 grid grid-rows-3">
        <HeroSection />
        <FeaturesSection />
        <HowItWorks />
      </main>
    </div>
  );
}

