"use client"

import { Card } from "@/components/ui/card"
import { MiniChart } from "./mini-chart"
export function CryptoTradingSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">Cryptocurrency Trading</h2>
            <p className="text-muted-foreground text-lg">
              Trade Bitcoin, Ethereum, and other major cryptocurrencies with live market data
            </p>
          </div>

          {/* ETH/USD Live Chart */}
          <Card className="glass-dark overflow-hidden">
            <div className="h-[500px]">
              <iframe
                src="https://s.tradingview.com/embed-widget/advanced-chart/?symbol=ETHUSD&interval=D&timezone=Etc/UTC&theme=dark&style=3&locale=en&copyrightYear=2026"
                className="w-full h-full border-0"
                allowFullScreen
                allow="clipboard-write; web-share"
              ></iframe>
            </div>
          </Card>

          {/* Mini Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <MiniChart symbol="BTCUSD" />
            <MiniChart symbol="ETHUSD" />
            <MiniChart symbol="LTCUSD" />
          </div>
        </div>
      </div>
    </section>
  )
}
