import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Indices Trading - Barcrest Capital",
  description: "Trade major stock indices including S&P 500, NASDAQ, DAX, and FTSE",
}

export default function IndicesPage() {
  const indices = [
    { name: "S&P 500", description: "Top 500 US companies", price: "5,843.25", change: "+2.1%" },
    { name: "NASDAQ", description: "US tech-heavy index", price: "18,432.50", change: "+3.5%" },
    { name: "DAX", description: "German blue-chip index", price: "18,921.30", change: "+1.8%" },
    { name: "FTSE 100", description: "UK blue-chip index", price: "8,234.15", change: "+0.9%" },
    { name: "Nikkei 225", description: "Japanese stock index", price: "33,456.75", change: "+4.2%" },
    { name: "CAC 40", description: "French stock index", price: "7,654.20", change: "+1.5%" },
  ]

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center justify-center py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Stock Index Trading
          </h1>
          <p className="text-lg text-muted-foreground">Trade global stock indices with leverage and zero commission</p>
        </div>
      </section>

      {/* Indices Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-6">
          {indices.map((index) => (
            <div
              key={index.name}
              className="group p-6 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:bg-card/80 transition-all duration-300"
            >
              <h3 className="text-2xl font-semibold mb-2">{index.name}</h3>
              <p className="text-muted-foreground mb-4">{index.description}</p>
              <div className="flex items-center justify-between mb-6">
                <div className="text-2xl font-bold">{index.price}</div>
                <span
                  className={`text-sm font-semibold ${index.change.includes("+") ? "text-green-400" : "text-red-400"}`}
                >
                  {index.change}
                </span>
              </div>
              <Link href={`/login?redirect=/trade/indices/${index.name}`}>
                <Button className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-lg glow-purple transition-all">
                  Trade {index.name}
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
