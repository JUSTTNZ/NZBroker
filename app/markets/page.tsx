import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Markets Overview - Barcrest Capital",
  description: "Real-time market data and analysis for crypto, forex, indices, and stocks",
}

export default function MarketsPage() {
  const marketCategories = [
    {
      name: "Cryptocurrencies",
      description: "Digital assets and blockchain-based cryptocurrencies",
      href: "/cryptocurrencies",
      color: "from-orange-500 to-yellow-500",
    },
    {
      name: "Forex",
      description: "Foreign exchange and currency pairs trading",
      href: "/forex",
      color: "from-blue-500 to-cyan-500",
    },
    {
      name: "Indices",
      description: "Global stock market indices and benchmarks",
      href: "/indices",
      color: "from-purple-500 to-pink-500",
    },
    {
      name: "Shares",
      description: "Individual stocks from companies worldwide",
      href: "/shares",
      color: "from-green-500 to-emerald-500",
    },
  ]

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center justify-center py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Global Markets at Your Fingertips
          </h1>
          <p className="text-lg text-muted-foreground">
            Access real-time market data, analysis, and trading opportunities across all asset classes
          </p>
        </div>
      </section>

      {/* Market Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-6">
          {marketCategories.map((category) => (
            <Link key={category.name} href={category.href} className="group">
              <div className="h-full p-8 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:bg-card/80 transition-all duration-300">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${category.color} mb-4`}></div>
                <h3 className="text-2xl font-semibold mb-2">{category.name}</h3>
                <p className="text-muted-foreground mb-6">{category.description}</p>
                <Button variant="outline" className="border-border/40 hover:border-primary/50 bg-transparent">
                  Explore Markets →
                </Button>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Market Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-border/40">
        <div className="grid md:grid-cols-4 gap-6">
          <div className="p-6 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm text-center">
            <div className="text-3xl font-bold text-primary mb-2">500+</div>
            <p className="text-muted-foreground">Trading Instruments</p>
          </div>
          <div className="p-6 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm text-center">
            <div className="text-3xl font-bold text-secondary mb-2">24/7</div>
            <p className="text-muted-foreground">Market Access</p>
          </div>
          <div className="p-6 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm text-center">
            <div className="text-3xl font-bold text-accent mb-2">$1T+</div>
            <p className="text-muted-foreground">Daily Volume</p>
          </div>
          <div className="p-6 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">0.1s</div>
            <p className="text-muted-foreground">Execution Speed</p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
