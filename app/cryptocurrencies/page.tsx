import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Cryptocurrencies - Barcrest Capital",
  description: "Trade Bitcoin, Ethereum, and 100+ cryptocurrencies with leverage",
}

export default function CryptocurrenciesPage() {
  const cryptos = [
    {
      symbol: "BTC",
      name: "Bitcoin",
      description: "The world's first and most valuable cryptocurrency",
      price: "$95,234",
      change: "+12.5%",
    },
    {
      symbol: "ETH",
      name: "Ethereum",
      description: "Smart contract platform and decentralized applications",
      price: "$3,456",
      change: "+8.2%",
    },
    {
      symbol: "XRP",
      name: "Ripple",
      description: "Digital payment protocol for fast transactions",
      price: "$2.34",
      change: "+15.3%",
    },
    {
      symbol: "ADA",
      name: "Cardano",
      description: "Proof-of-stake blockchain platform",
      price: "$1.23",
      change: "+5.6%",
    },
    {
      symbol: "SOL",
      name: "Solana",
      description: "High-speed blockchain for decentralized apps",
      price: "$189.45",
      change: "+22.1%",
    },
    {
      symbol: "DOT",
      name: "Polkadot",
      description: "Multi-chain interoperability protocol",
      price: "$34.56",
      change: "+9.8%",
    },
  ]

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center justify-center py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
            Crypto Trading Simplified
          </h1>
          <p className="text-lg text-muted-foreground">
            Trade 100+ cryptocurrencies with leverage up to 1:500 and zero commission
          </p>
        </div>
      </section>

      {/* Crypto Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cryptos.map((crypto) => (
            <div
              key={crypto.symbol}
              className="group p-6 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:bg-card/80 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{crypto.name}</h3>
                  <p className="text-sm text-muted-foreground">{crypto.symbol}</p>
                </div>
                <span
                  className={`text-sm font-semibold ${crypto.change.includes("+") ? "text-green-400" : "text-red-400"}`}
                >
                  {crypto.change}
                </span>
              </div>
              <p className="text-muted-foreground text-sm mb-4">{crypto.description}</p>
              <div className="mb-6">
                <div className="text-2xl font-bold">{crypto.price}</div>
              </div>
              <Link href={`/login?redirect=/trade/crypto/${crypto.symbol}`}>
                <Button className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-lg glow-purple transition-all">
                  Trade {crypto.symbol}
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
