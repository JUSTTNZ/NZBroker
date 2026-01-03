"use client"

import { Card } from "@/components/ui/card"

export function FreedomToTrade() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 w-fit">
              <span className="text-sm font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                FREEDOM TO TRADE
              </span>
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold">
                Trade What You Want,{" "}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  When You Want
                </span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Enjoy complete flexibility to trade across multiple asset classes with no restrictions. Our platform
                empowers you with 24/7 market access and institutional-grade tools.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-primary">24/7</div>
                <p className="text-sm text-muted-foreground">Market Access</p>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-secondary">0%</div>
                <p className="text-sm text-muted-foreground">Commission*</p>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-accent">100+</div>
                <p className="text-sm text-muted-foreground">Asset Classes</p>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-green-400">1:500</div>
                <p className="text-sm text-muted-foreground">Max Leverage</p>
              </div>
            </div>
          </div>

          {/* Right Visual - TradingView BTC/USD Chart */}
          <Card className="glass-dark overflow-hidden">
            <div className="h-[400px]">
              <iframe
                src="https://s.tradingview.com/embed-widget/advanced-chart/?symbol=BTCUSD&interval=D&timezone=Etc/UTC&theme=dark&style=3&locale=en&copyrightYear=2026"
                className="w-full h-full border-0"
                allowFullScreen
                allow="clipboard-write; web-share"
              ></iframe>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
