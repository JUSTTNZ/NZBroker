import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Forex Trading - Barcrest Capital",
  description: "Trade major, minor, and exotic currency pairs with tight spreads",
}

export default function ForexPage() {
  const pairs = [
    { pair: "EUR/USD", description: "Euro / US Dollar", spread: "0.2" },
    { pair: "GBP/USD", description: "British Pound / US Dollar", spread: "0.3" },
    { pair: "USD/JPY", description: "US Dollar / Japanese Yen", spread: "0.4" },
    { pair: "USD/CHF", description: "US Dollar / Swiss Franc", spread: "0.3" },
    { pair: "AUD/USD", description: "Australian Dollar / US Dollar", spread: "0.5" },
    { pair: "USD/CAD", description: "US Dollar / Canadian Dollar", spread: "0.4" },
  ]

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center justify-center py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Global Currency Trading
          </h1>
          <p className="text-lg text-muted-foreground">
            Trade 50+ currency pairs with institutional-grade execution and tight spreads
          </p>
        </div>
      </section>

      {/* Forex Pairs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-6">
          {pairs.map((item) => (
            <div
              key={item.pair}
              className="group p-6 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:bg-card/80 transition-all duration-300"
            >
              <h3 className="text-2xl font-semibold mb-2">{item.pair}</h3>
              <p className="text-muted-foreground mb-4">{item.description}</p>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Spread: <span className="font-semibold text-foreground">{item.spread} pips</span>
                </span>
              </div>
              <Link href={`/login?redirect=/trade/forex/${item.pair}`}>
                <Button className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-lg glow-purple transition-all">
                  Trade {item.pair}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  )
}
