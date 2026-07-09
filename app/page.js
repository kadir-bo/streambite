"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context";
import {
  Navbar,
  HeroSection,
  TrustSection,
  ProductShowcase,
  DetailedFeatures,
  TechnicalDeepDive,
  SecuritySection,
  HowItWorks,
  CTASection,
  Footer,
  LoadingSpinner,
} from "@/components";

export default function LandingPage() {
  const { firebaseUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && firebaseUser) {
      router.replace("/channels");
    }
  }, [loading, firebaseUser, router]);

  // Show nothing while we check auth state — prevents a flash of the landing
  // page before redirecting an already-logged-in user to /channels.
  if (loading) {
    return <LoadingSpinner />;
  }

  // Already logged in? Don't render the landing — redirect is in flight.
  if (firebaseUser) return null;

  return (
    <div className="h-full overflow-y-auto bg-zinc-950">
      <Navbar />
      <main>
        <HeroSection />
        <TrustSection />
        <ProductShowcase />
        <DetailedFeatures />
        <TechnicalDeepDive />
        <SecuritySection />
        <HowItWorks />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
