"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function EducationCenter() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute left-0 bottom-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Video */}
          <div className="h-[400px] rounded-lg overflow-hidden bg-black/50 border border-border">
            <iframe
              width="100%"
              height="100%"
src="https://www.youtube.com/embed/ogHmX5ybfyQ"
              title="Crypto Trading Education"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>

          {/* Right: Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold">
                Learn From{" "}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Market Experts
                </span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Access comprehensive educational resources, live trading sessions, and expert insights to accelerate
                your learning journey and master the markets.
              </p>
            </div>

            {/* Info Card */}
            <Card className="glass-dark p-6 space-y-4 hover:glow-cyan transition-all">
              <h3 className="text-xl font-semibold text-foreground">About Solana and Web3</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Discover how blockchain technology and decentralized finance are transforming the trading landscape.
                Learn about the fundamentals of cryptocurrency trading, smart contracts, and how to identify
                opportunities in emerging markets.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  <span className="text-muted-foreground">Introduction to blockchain</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  <span className="text-muted-foreground">Cryptocurrency trading basics</span>
                </div>
              </div>
            </Card>

            {/* CTA Buttons */}
            <div className="space-y-3">
              <Button className="w-full bg-gradient-to-r from-primary to-accent glow-purple text-white hover:shadow-lg transition-all h-12">
                Explore learning resources
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" className="w-full border-border hover:bg-card h-12 bg-transparent">
                Join free webinars
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
