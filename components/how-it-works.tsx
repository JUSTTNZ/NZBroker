"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, TrendingUp, Wallet, ArrowRight } from "lucide-react"

const steps = [
  {
    icon: DollarSign,
    title: "Deposit",
    description: "Fund your account with multiple payment methods",
    cta: "Get Started",
  },
  {
    icon: TrendingUp,
    title: "Trade",
    description: "Access markets with competitive spreads",
    cta: "Explore Markets",
  },
  {
    icon: Wallet,
    title: "Withdraw",
    description: "Fast and secure withdrawals anytime",
    cta: "Learn More",
  },
]

export function HowItWorks() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="space-y-8 text-center">
          <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30">
            <span className="text-sm font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              SIMPLE PROCESS
            </span>
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">How It Works</h2>
            <p className="text-muted-foreground text-lg">Get started in three simple steps</p>
          </div>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {steps.map((step, index) => {
            const IconComponent = step.icon
            return (
              <div key={index} className="relative group">
                {/* Connector Line (desktop) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/3 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary to-transparent"></div>
                )}

                <Card className="glass-dark p-8 space-y-6 h-full hover:glow-cyan transition-all duration-300 hover:scale-105">
                  {/* Step Number and Icon */}
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-primary to-accent flex items-center justify-center glow-purple flex-shrink-0">
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-4xl font-bold text-primary/30 group-hover:text-primary/50 transition-colors">
                      {index + 1}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-4 flex-1">
                    <h3 className="text-2xl font-semibold text-foreground">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>

                  {/* CTA */}
                  <Button
                    variant="outline"
                    className="w-full border-border/40 hover:bg-card hover:border-primary/50 group/btn bg-transparent"
                  >
                    {step.cta}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Card>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
