import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { MarketTicker } from "@/components/market-ticker"
import { MarketOverview } from "@/components/market-overview"
import { AboutUs } from "@/components/about-us"
import { TradingPlans } from "@/components/trading-plans"
import { StayUpdated } from "@/components/stay-updated"
import { PremiumTradingExperience } from "@/components/premium-trading-experience"
import { EducationCenter } from "@/components/education-center"
import { MarketAnalysis } from "@/components/market-analysis"
import { TrustedReputation } from "@/components/trusted-reputation"
import { HowItWorks } from "@/components/how-it-works"
import { FreedomToTrade } from "@/components/freedom-to-trade"
import { CryptoTradingSection } from "@/components/crypto-trading-section"
import { PremiumExperience } from "@/components/premium-experience"
import { Services } from "@/components/services"
import { Awards } from "@/components/awards"
import { InvestmentOptions } from "@/components/investment-options"
import { CTAStrip } from "@/components/cta-strip"
import { Testimonials } from "@/components/testimonials"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <Hero />
      <MarketTicker />
      <MarketOverview />
      <AboutUs />
      <TradingPlans />
      <StayUpdated />
      <PremiumTradingExperience />
      <MarketAnalysis />
      <TrustedReputation />
      <HowItWorks />
      <FreedomToTrade />
      <CryptoTradingSection />
      <EducationCenter />
      <PremiumExperience />
      <Services />
      <Awards />
      <InvestmentOptions />
      <CTAStrip />
      <Testimonials />
      <Footer />
    </main>
  )
}
