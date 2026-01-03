import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

export const metadata = {
  title: "Trading Plans - AstralisX Vault",
  description: "Choose the right trading plan for your needs",
}

export default function PricingPage() {
  const plans = [
    {
      name: "Test",
      rate: "5%",
      min: "No minimum",
      max: "Up to $5,000",
      features: ["Demo trading", "Limited leverage", "Basic analytics", "Email support"],
    },
    {
      name: "Starter",
      rate: "8%",
      min: "$100",
      max: "Up to $50,000",
      features: ["Live trading", "Leverage up to 1:50", "Advanced charts", "Priority support"],
      highlighted: true,
    },
    {
      name: "Standard",
      rate: "10%",
      min: "$500",
      max: "Up to $500,000",
      features: ["Full leverage (1:500)", "API access", "Risk management tools", "24/7 support"],
    },
    {
      name: "Premium",
      rate: "12%",
      min: "$5,000",
      max: "Unlimited",
      features: ["White-glove service", "Dedicated account manager", "Custom solutions", "Priority execution"],
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
            Investment Plans
          </h1>
          <p className="text-lg text-muted-foreground mb-4">Choose the trading plan that fits your goals</p>
          <p className="text-sm text-yellow-400">
            ⚠️ Disclaimer: These plans are for demonstration purposes. This is informational content only.
          </p>
        </div>
      </section>

      {/* Plans Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative p-6 rounded-xl border transition-all duration-300 ${
                plan.highlighted
                  ? "border-primary/50 bg-card/80 ring-2 ring-primary/30"
                  : "border-border/40 bg-card/50 hover:border-primary/50 hover:bg-card/80"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold">
                  Popular
                </div>
              )}

              <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
              <div className="mb-4">
                <div className="text-3xl font-bold">{plan.rate}</div>
                <p className="text-xs text-muted-foreground">Return Rate</p>
              </div>

              <div className="space-y-2 mb-6 text-sm text-muted-foreground">
                <p>Min: {plan.min}</p>
                <p>Max: {plan.max}</p>
              </div>

              <Link href={`/login?redirect=/subscribe/${plan.name.toLowerCase()}`} className="block mb-6">
                <Button
                  className={`w-full ${plan.highlighted ? "bg-gradient-to-r from-primary to-accent hover:shadow-lg glow-purple" : "bg-muted hover:bg-muted/80"}`}
                >
                  Subscribe
                </Button>
              </Link>

              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Risk Warning */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-border/40">
        <div className="p-8 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm">
          <h3 className="text-xl font-semibold mb-4">⚠️ Important Risk Warning</h3>
          <p className="text-sm text-muted-foreground text-balance">
            CFDs are complex financial products. Trading CFDs involves substantial risk of loss. 74-89% of retail
            investor accounts lose money when trading CFDs. You should not risk more than you can afford to lose. Before
            trading, please ensure you fully understand the risks involved and seek advice from independent financial
            advisors if necessary. These investment plans are for informational purposes only.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  )
}
