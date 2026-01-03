"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, ArrowRight } from "lucide-react"

const features = [
  "Forex, Indices, Shares & Commodities",
  "24/7 market access",
  "Multilingual support",
  "Mobile and desktop trading",
  "Advanced charting tools",
  "Copy trading available",
]

export function PremiumExperience() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="glass-dark p-8 md:p-12 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold">
                  Premium Trading{" "}
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Experience
                  </span>
                </h2>
                <p className="text-lg text-muted-foreground">
                  Experience the ultimate in trading with our institutional-grade platform
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 group">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center flex-shrink-0 glow-purple">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-foreground group-hover:text-primary transition-colors">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <Button className="bg-gradient-to-r from-primary to-accent glow-purple text-white h-12 px-8">
                Learn About Our Commissions
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            {/* Right Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 space-y-2 hover:glow-purple transition-all">
                <div className="text-3xl font-bold text-primary">0.5</div>
                <p className="text-sm text-muted-foreground">Minimum Spread</p>
              </div>
              <div className="p-6 rounded-lg bg-gradient-to-br from-secondary/20 to-primary/20 border border-secondary/30 space-y-2 hover:glow-cyan transition-all">
                <div className="text-3xl font-bold text-secondary">50+</div>
                <p className="text-sm text-muted-foreground">Trading Pairs</p>
              </div>
              <div className="p-6 rounded-lg bg-gradient-to-br from-accent/20 to-secondary/20 border border-accent/30 space-y-2 hover:glow-purple transition-all">
                <div className="text-3xl font-bold text-accent">100ms</div>
                <p className="text-sm text-muted-foreground">Execution Speed</p>
              </div>
              <div className="p-6 rounded-lg bg-gradient-to-br from-green-500/20 to-primary/20 border border-green-500/30 space-y-2 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all">
                <div className="text-3xl font-bold text-green-400">$100</div>
                <p className="text-sm text-muted-foreground">Min. Deposit</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}
