import { Suspense } from "react";
import SiteHeader from "@/components/site-header";
import HeroSection from "@/components/hero-section";
import FeaturesSection from "@/components/features-section";
import PricingSection, { PricingFallback } from "@/components/pricing-section";
import SiteFooter from "@/components/site-footer";

export default function HomePage() {
  return (
    <>
      <SiteHeader />

      <main>
        <HeroSection />
        <FeaturesSection />

        <section id="how-it-works" className="bg-background py-20">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-3xl font-bold tracking-tight text-text">
              Simple to get started
            </h2>

            <p className="mt-4 max-w-2xl leading-7 text-text-muted">
              Set up your store, add your products, and start recording sales.
            </p>
          </div>
        </section>

        <Suspense fallback={<PricingFallback />}>
          <PricingSection />
        </Suspense>
      </main>

      <SiteFooter />
    </>
  );
}
