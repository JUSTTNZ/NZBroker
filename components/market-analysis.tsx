"use client"

import { Card } from "@/components/ui/card"

export function MarketAnalysis() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="glass-dark p-8 md:p-12 space-y-8">
          <div className="space-y-2">
            <h2 className="text-4xl md:text-5xl font-bold">Real-Time Market Analysis</h2>
            <p className="text-muted-foreground text-lg">Forex Heat Map by TradingView</p>
          </div>

          {/* Heat Map Grid */}
          <div className="h-[400px] overflow-auto">
            <iframe
              src="https://s.tradingview.com/embed-widget/forex-heat-map/?symbols=EURUSD,GBPUSD,USDJPY,AUDUSD,USDCAD,USDCHF,CNHUSD,NZDUSD,USDHKD&locale=en&copyrightYear=2026"
              className="w-full h-full border-0"
              allowFullScreen
              allow="clipboard-write; web-share"
            ></iframe>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-muted-foreground border-t border-border/40 pt-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Bullish</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <span>Bearish</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-500"></div>
              <span>Neutral</span>
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}
