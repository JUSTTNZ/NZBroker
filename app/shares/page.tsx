import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Shares Trading - AstralisX Vault",
  description: "Trade individual stocks from companies worldwide with zero commission",
}

export default function SharesPage() {
  const stocks = [
    { symbol: "AAPL", name: "Apple Inc.", price: "$234.50", change: "+5.2%" },
    { symbol: "MSFT", name: "Microsoft Corp.", price: "$456.75", change: "+8.1%" },
    { symbol: "GOOGL", name: "Alphabet Inc.", price: "$189.25", change: "+3.4%" },
    { symbol: "AMZN", name: "Amazon Inc.", price: "$198.90", change: "+6.7%" },
    { symbol: "TSLA", name: "Tesla Inc.", price: "$298.45", change: "+12.3%" },
    { symbol: "META", name: "Meta Platforms", price: "$567.80", change: "+7.8%" },
  ]

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center justify-center py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            Stock Trading Made Easy
          </h1>
          <p className="text-lg text-muted-foreground">
            Trade stocks from the world's leading companies with zero commission
          </p>
        </div>
      </section>

      {/* Stocks Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stocks.map((stock) => (
            <div
              key={stock.symbol}
              className="group p-6 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:bg-card/80 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{stock.name}</h3>
                  <p className="text-sm text-muted-foreground">{stock.symbol}</p>
                </div>
                <span
                  className={`text-sm font-semibold ${stock.change.includes("+") ? "text-green-400" : "text-red-400"}`}
                >
                  {stock.change}
                </span>
              </div>
              <div className="mb-6">
                <div className="text-2xl font-bold">{stock.price}</div>
              </div>
              <Link href={`/login?redirect=/trade/stocks/${stock.symbol}`}>
                <Button className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-lg glow-purple transition-all">
                  Trade {stock.symbol}
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
