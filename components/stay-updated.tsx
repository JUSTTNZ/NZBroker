"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function StayUpdated() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: TradingView Chart */}
          <div className="h-[400px] rounded-lg overflow-hidden">
            <iframe
              src="https://s.tradingview.com/embed-widget/advanced-chart/?symbol=BTCUSD&interval=D&timezone=Etc/UTC&theme=dark&style=3&locale=en&copyrightYear=2026"
              className="w-full h-full border-0"
              allowFullScreen
              allow="clipboard-write; web-share"
            ></iframe>
          </div>

          {/* Right: Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold">
                Stay Up to Date with{" "}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Our Experts
                </span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Get daily market insights, trading signals, and expert analysis directly from our team of professional
                traders. Stay informed with real-time updates and actionable intelligence to make smarter trading
                decisions.
              </p>
            </div>

            {/* Feature Card */}
            <Card className="glass-dark p-6 space-y-4 hover:glow-cyan transition-all">
              <h3 className="text-xl font-semibold text-foreground">Experience More Than Trading</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  Daily live webinars with market experts
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  Exclusive trading signals and alerts
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-accent"></span>
                  Community access and networking
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  Priority support 24/7
                </li>
              </ul>
            </Card>

            {/* CTA Button */}
            <Button className="bg-gradient-to-r from-primary to-accent glow-purple text-white hover:shadow-lg transition-all h-12 px-8 w-full sm:w-auto">
              Learn about our commissions
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
