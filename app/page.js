"use client";

import Navbar from "@/components/landing/Navbar"
import HeroSection from "@/components/landing/HeroSection"
import TrustSection from "@/components/landing/TrustSection"
import ProductShowcase from "@/components/landing/ProductShowcase"
import DetailedFeatures from "@/components/landing/DetailedFeatures"
import TechnicalDeepDive from "@/components/landing/TechnicalDeepDive"
import SecuritySection from "@/components/landing/SecuritySection"
import HowItWorks from "@/components/landing/HowItWorks"
import CTASection from "@/components/landing/CTASection"
import Footer from "@/components/landing/Footer"

export default function LandingPage() {
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
  )
}
