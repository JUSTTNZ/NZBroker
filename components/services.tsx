"use client"

import { Card } from "@/components/ui/card"
import { Zap, TrendingUp } from "lucide-react"

export function Services() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="space-y-8 text-center">
          <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30">
            <span className="text-sm font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              COMPREHENSIVE SERVICES
            </span>
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">Start Trading with Barcrest Vault</h2>
            <p className="text-muted-foreground text-lg">Everything you need in one platform</p>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Market Analysis Card */}
          <Card className="glass-dark p-8 space-y-6 hover:glow-cyan transition-all group">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-primary to-accent flex items-center justify-center glow-purple">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-foreground group-hover:text-primary transition-colors">
                Market Analysis
              </h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  Daily Market Analysis
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  Weekly Live Webinars
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent"></span>
                  Live Q&A Sessions
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  Trading Strategy Support
                </li>
              </ul>
            </div>
          </Card>

          {/* Copy Trading Card */}
          <Card className="glass-dark p-8 space-y-6 hover:glow-cyan transition-all group">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-accent to-secondary flex items-center justify-center glow-purple">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-foreground group-hover:text-secondary transition-colors">
                Copy Trading
              </h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent"></span>
                  BA Copy – How It Works
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  Become a Follower
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  PAMM Ranking
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent"></span>
                  Become an Investor
                </li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
