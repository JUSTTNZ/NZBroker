import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Bitcoin, DollarSign, BarChart3, TrendingUp, Zap, Shield, Smartphone } from "lucide-react"

export const metadata = {
  title: "Trading - Barcrest",
  description: "Trade global markets including crypto, forex, indices, and stocks with Barcrest",
}

export default function TradingPage() {
  const tradingInstruments = [
    {
      title: "Cryptocurrencies",
      description: "Trade Bitcoin, Ethereum, and 100+ altcoins with leverage up to 1:500",
      icon: Bitcoin,
      href: "/cryptocurrencies",
      cta: "Trade Crypto",
      iconColor: "text-orange-500",
      bgColor: "bg-orange-500/20",
    },
    {
      title: "Forex",
      description: "Major, minor, and exotic currency pairs with ultra-low spreads",
      icon: DollarSign,
      href: "/forex",
      cta: "Trade Forex",
      iconColor: "text-green-500",
      bgColor: "bg-green-500/20",
    },
    {
      title: "Indices",
      description: "Trade global stock indices including S&P 500, NASDAQ, and DAX",
      icon: BarChart3,
      href: "/indices",
      cta: "Trade Indices",
      iconColor: "text-blue-500",
      bgColor: "bg-blue-500/20",
    },
    {
      title: "Shares",
      description: "Trade stocks from tech giants to emerging companies worldwide",
      icon: TrendingUp,
      href: "/shares",
      cta: "Trade Stocks",
      iconColor: "text-purple-500",
      bgColor: "bg-purple-500/20",
    },
  ]

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Unlock Your Trading Potential
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            Trade multiple asset classes with professional-grade tools and institutional liquidity
          </p>
        </div>
      </section>

      {/* Trading Instruments */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {tradingInstruments.map((instrument) => {
            const IconComponent = instrument.icon
            return (
              <div
                key={instrument.title}
                className="group relative p-6 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:bg-card/80 transition-all duration-300"
              >
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-lg ${instrument.bgColor} flex items-center justify-center mb-4`}>
                    <IconComponent className={`w-6 h-6 ${instrument.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{instrument.title}</h3>
                  <p className="text-muted-foreground mb-6">{instrument.description}</p>
                  <Link href={`/login?redirect=${instrument.href}`}>
                    <Button className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-lg glow-purple transition-all">
                      {instrument.cta} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-border/40">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Why Trade with AstralisX Vault?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Ultra-Fast Execution</h3>
            <p className="text-sm text-muted-foreground">Lightning-fast order execution with minimal slippage</p>
          </div>
          <div className="p-6 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-lg bg-secondary/20 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="font-semibold mb-2">Secure & Regulated</h3>
            <p className="text-sm text-muted-foreground">Licensed trading platform with top-tier security</p>
          </div>
          <div className="p-6 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
              <Smartphone className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-semibold mb-2">Multi-Platform</h3>
            <p className="text-sm text-muted-foreground">Web, desktop, and mobile apps with synchronized accounts</p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
