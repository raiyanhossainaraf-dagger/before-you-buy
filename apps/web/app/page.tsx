import { Hero } from './_components/landing/hero';
import { TrustQuestions } from './_components/landing/trust-questions';
import { HowItWorks } from './_components/landing/how-it-works';
import { DemoSlot, EmailCaptureSlot, PreorderSlot } from './_components/landing/slots';
import { PricingPreview } from './_components/landing/pricing-preview';
import { Faq } from './_components/landing/faq';
import { LandingFooter } from './_components/landing/footer';

/** M0.2 — Gate 0 landing page (UI §7.14, PRD §3). */
export default function HomePage() {
  return (
    <>
      <main id="main">
        <Hero />
        <TrustQuestions />
        <HowItWorks />
        <DemoSlot />
        <EmailCaptureSlot />
        <PreorderSlot />
        <PricingPreview />
        <Faq />
      </main>
      <LandingFooter />
    </>
  );
}
