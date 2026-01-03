"use client"

import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

export function TradingPlans() {
  const router = useRouter()

  const handleSelectPlan = (planName: string) => {
    const authToken = localStorage.getItem("authToken")
    if (!authToken) {
      router.push(`/login?redirect=${encodeURIComponent("/dashboard/upgrade-plan")}`)
    } else {
      router.push("/dashboard/upgrade-plan")
    }
  }

  const plans = [
    {
      name: "Test",
      percentage: "0.5%",
      features: ["Practice Trading", "Simulated Funds", "Market Access", "Basic Analytics"],
      min: "$0",
      max: "$10,000",
    },
    {
      name: "Starter",
      percentage: "1.2%",
      features: ["Live Trading", "Real Account", "24/7 Market Access", "Market Data"],
      min: "$100",
      max: "$50,000",
      highlighted: true,
    },
    {
      name: "Standard",
      percentage: "1.8%",
      features: ["Premium Tools", "Advanced Analytics", "Priority Support", "Educational Resources"],
      min: "$500",
      max: "$250,000",
    },
    {
      name: "Premium",
      percentage: "2.5%",
      features: ["VIP Support", "Custom Strategies", "Institutional Tools", "Market Alerts"],
      min: "$5,000",
      max: "Unlimited",
    },
  ]

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute right-0 bottom-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="space-y-6 text-center">
          <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30">
            <span className="text-sm font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              TRADING PLANS
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold">Investment Opportunities</h2>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`p-6 space-y-6 transition-all ${
                plan.highlighted
                  ? "glass-dark border-primary/50 ring-1 ring-primary/50 hover:glow-purple scale-105 md:scale-100"
                  : "glass-dark hover:glow-cyan"
              }`}
            >
              {/* Plan Name */}
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                <div className="text-sm text-muted-foreground">Per trade</div>
              </div>

              {/* Percentage */}
              <div className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {plan.percentage}
              </div>

              {/* Min/Max */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Min:</span>
                  <span className="text-foreground font-semibold">{plan.min}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Max:</span>
                  <span className="text-foreground font-semibold">{plan.max}</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button
                className={`w-full h-10 ${
                  plan.highlighted
                    ? "bg-gradient-to-r from-primary to-accent text-white glow-purple"
                    : "bg-transparent border border-border hover:bg-card"
                }`}
                onClick={() => handleSelectPlan(plan.name)}
              >
                Select Plan
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
