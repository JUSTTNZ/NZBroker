"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

const plans = [
  {
    name: "Basic",
    price: "$0",
    period: "Forever",
    description: "Perfect for beginners",
    features: ["$10,000 Demo Account", "Duration: 9 Days", "Basic Support", ],
    current: true,
  },
  {
    name: "Pro",
    price: "$49",
    period: "per month",
    description: "For serious traders",
    features: [
      "$50,000 Demo Account",
      "Duration: 15 Days",
      "Priority Support",
      // "Trading Signals",
      // "Copy Trading Access",
      // "Risk Management Tools",
    ],
    popular: true,
  },
  {
    name: "Elite",
    price: "$199",
    period: "per month",
    description: "For professionals",
    features: [
      "Unlimited Demo Account",
  
      "Duration: 30 Days",
      " 24/7 Premium Support",
      // "Personal Account Manager",
      // "Exclusive Webinars",
      // "API Access",
      // "Custom Alerts",
    ],
  },
]

export default function UpgradePlanPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Upgrade Your Plan</h1>
        <p className="text-muted-foreground">Choose a plan that fits your trading needs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`p-5 relative border-2 transition-all ${
              plan.popular
                ? "border-primary bg-primary/10 scale-105"
                : plan.current
                  ? "border-secondary"
                  : "border-border/40 bg-card/50"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-bold">
                Most Popular
              </div>
            )}

            <h3 className="text-xl font-bold ">{plan.name}</h3>
            <p className="text-muted-foreground text-sm ">{plan.description}</p>

            <div className="">
              <span className="text-4xl font-bold">{plan.price}</span>
              <span className="text-muted-foreground text-sm ml-2">{plan.period}</span>
            </div>

            <ul className="space-y-4 ">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              className={`w-full py-3 font-semibold ${
                plan.current
                  ? "bg-muted"
                  : plan.popular
                    ? "bg-primary hover:bg-primary/90"
                    : "bg-background border border-border/40 hover:bg-background/50"
              }`}
              disabled={plan.current}
            >
              {plan.current ? "Current Plan" : "Upgrade Now"}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}
