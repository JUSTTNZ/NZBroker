"use client"

import { Card } from "@/components/ui/card"
import { Users, Award } from "lucide-react"

export function InvestmentOptions() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">Investment Options</h2>
          <p className="text-muted-foreground text-lg">Multiple ways to grow your portfolio</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Follower Card */}
          <Card className="glass-dark p-8 space-y-6 hover:glow-cyan transition-all group">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-primary to-accent flex items-center justify-center glow-purple">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-foreground group-hover:text-primary transition-colors">
                For Followers
              </h3>
              <p className="text-muted-foreground">
                Copy trades from successful traders and grow your portfolio with proven strategies
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Browse successful traders
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                  Automatic copy trading
                </li>
              </ul>
            </div>
          </Card>

          {/* Investor Card */}
          <Card className="glass-dark p-8 space-y-6 hover:glow-cyan transition-all group">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-accent to-secondary flex items-center justify-center glow-purple">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-foreground group-hover:text-secondary transition-colors">
                For Investors
              </h3>
              <p className="text-muted-foreground">
                Share your trading strategy and earn from followers who want to copy your trades
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                  Showcase your performance
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Earn recurring commissions
                </li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
